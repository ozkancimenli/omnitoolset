/**
 * Content Stream Parser - Advanced PDF Content Stream Analysis
 * 
 * Parses and manipulates PDF content streams at a low level
 * for advanced text editing and manipulation
 */

export interface ContentStreamOperator {
  operator: string;
  operands: any[];
  position: number;
  context?: {
    font?: string;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
    transform?: number[];
    textMatrix?: number[];
  };
}

export interface TextOperator extends ContentStreamOperator {
  operator: 'Tj' | 'TJ' | "'" | '"';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ContentStreamParser {
  /**
   * Parse content stream into operators
   */
  static parseContentStream(contentStream: string): ContentStreamOperator[] {
    const operators: ContentStreamOperator[] = [];
    const tokens = this.tokenize(contentStream);
    
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      
      // Check if it's an operator
      if (this.isOperator(token)) {
        // Collect operands before this operator
        const operands: any[] = [];
        let j = i - 1;
        while (j >= 0 && !this.isOperator(tokens[j])) {
          operands.unshift(this.parseOperand(tokens[j]));
          j--;
        }
        
        operators.push({
          operator: token,
          operands,
          position: i,
        });
      }
      
      i++;
    }
    
    return operators;
  }

  /**
   * Tokenize content stream
   */
  private static tokenize(contentStream: string): string[] {
    const tokens: string[] = [];
    let currentToken = '';
    let inString = false;
    let stringEscape = false;
    
    for (let i = 0; i < contentStream.length; i++) {
      const char = contentStream[i];
      
      if (stringEscape) {
        currentToken += char;
        stringEscape = false;
        continue;
      }
      
      if (char === '\\') {
        stringEscape = true;
        currentToken += char;
        continue;
      }
      
      if (char === '(' || char === '<') {
        inString = true;
        currentToken += char;
        continue;
      }
      
      if (inString && (char === ')' || char === '>')) {
        inString = false;
        currentToken += char;
        continue;
      }
      
      if (inString) {
        currentToken += char;
        continue;
      }
      
      // Whitespace separates tokens
      if (/\s/.test(char)) {
        if (currentToken.trim()) {
          tokens.push(currentToken.trim());
          currentToken = '';
        }
        continue;
      }
      
      currentToken += char;
    }
    
    if (currentToken.trim()) {
      tokens.push(currentToken.trim());
    }
    
    return tokens;
  }

  /**
   * Check if token is an operator
   */
  private static isOperator(token: string): boolean {
    // PDF operators are typically 1-2 characters, uppercase
    const operators = [
      'q', 'Q', 'cm', 'w', 'J', 'j', 'M', 'd', 'ri', 'i', 'gs',
      'BT', 'ET', 'Tc', 'Tw', 'Tz', 'TL', 'Tf', 'Tr', 'Ts', 'Td', 'TD',
      'Tm', 'T*', 'Tj', 'TJ', "'", '"', 'Do', 'MP', 'DP', 'BMC', 'BDC', 'EMC',
      'BX', 'EX', 'cs', 'CS', 'sc', 'SC', 'scn', 'SCN', 'G', 'g', 'RG', 'rg',
      'K', 'k', 're', 's', 'S', 'f', 'F', 'f*', 'B', 'B*', 'b', 'b*', 'n',
      'W', 'W*', 'm', 'l', 'c', 'v', 'y', 'h', 'S', 's', 'f', 'F', 'f*',
      'B', 'B*', 'b', 'b*', 'n', 'W', 'W*', 'sh', 'BI', 'ID', 'EI',
    ];
    
    return operators.includes(token);
  }

  /**
   * Parse operand value
   */
  private static parseOperand(token: string): any {
    // Try to parse as number
    const num = parseFloat(token);
    if (!isNaN(num)) {
      return num;
    }
    
    // Try to parse as boolean
    if (token === 'true') return true;
    if (token === 'false') return false;
    
    // Try to parse as name (starts with /)
    if (token.startsWith('/')) {
      return token.substring(1);
    }
    
    // Try to parse as string
    if ((token.startsWith('(') && token.endsWith(')')) ||
        (token.startsWith('<') && token.endsWith('>'))) {
      return token.substring(1, token.length - 1);
    }
    
    // Try to parse as array
    if (token.startsWith('[') && token.endsWith(']')) {
      const content = token.substring(1, token.length - 1);
      return content.split(/\s+/).map(t => this.parseOperand(t));
    }
    
    // Return as string
    return token;
  }

  /**
   * Extract text operators from content stream
   */
  static extractTextOperators(operators: ContentStreamOperator[]): TextOperator[] {
    const textOperators: TextOperator[] = [];
    let currentFont = 'Helvetica';
    let currentFontSize = 12;
    let currentColor = { r: 0, g: 0, b: 0 };
    let textMatrix = [1, 0, 0, 1, 0, 0];
    
    for (const op of operators) {
      // Update font
      if (op.operator === 'Tf' && op.operands.length >= 2) {
        currentFont = op.operands[0] as string;
        currentFontSize = op.operands[1] as number;
      }
      
      // Update color
      if (op.operator === 'rg' && op.operands.length >= 3) {
        currentColor = {
          r: op.operands[0] as number,
          g: op.operands[1] as number,
          b: op.operands[2] as number,
        };
      }
      
      // Update text matrix
      if (op.operator === 'Tm' && op.operands.length >= 6) {
        textMatrix = op.operands as number[];
      }
      
      // Extract text
      if (op.operator === 'Tj' || op.operator === "'" || op.operator === '"') {
        const text = op.operands[0] as string;
        const x = textMatrix[4];
        const y = textMatrix[5];
        
        // Estimate width and height
        const width = text.length * currentFontSize * 0.6; // Rough estimate
        const height = currentFontSize;
        
        textOperators.push({
          ...op,
          operator: op.operator as 'Tj' | 'TJ' | "'" | '"',
          text,
          x,
          y,
          width,
          height,
          context: {
            font: currentFont,
            fontSize: currentFontSize,
            color: currentColor,
            transform: textMatrix,
            textMatrix,
          },
        });
      }
      
      // Handle TJ operator (array of text and spacing)
      if (op.operator === 'TJ' && op.operands.length > 0) {
        const operand = op.operands[0];
        if (!Array.isArray(operand)) continue;
        const array = operand as Array<string | number>;
        let currentX = textMatrix[4];
        
        for (const item of array) {
          if (typeof item === 'string') {
            const width = item.length * currentFontSize * 0.6;
            const height = currentFontSize;
            
            textOperators.push({
              ...op,
              operator: 'TJ',
              text: item,
              x: currentX,
              y: textMatrix[5],
              width,
              height,
              context: {
                font: currentFont,
                fontSize: currentFontSize,
                color: currentColor,
                transform: textMatrix,
                textMatrix,
              },
            });
            
            currentX += width;
          } else if (typeof item === 'number') {
            // Spacing adjustment
            currentX += item * currentFontSize * 0.001;
          }
        }
      }
    }
    
    return textOperators;
  }

  /**
   * Rebuild content stream with modified text
   */
  static rebuildContentStream(
    operators: ContentStreamOperator[],
    textReplacements: Map<string, string>
  ): string {
    let output = '';
    
    for (const op of operators) {
      // Check if this is a text operator that needs replacement
      if ((op.operator === 'Tj' || op.operator === "'" || op.operator === '"') &&
          op.operands.length > 0) {
        const originalText = op.operands[0] as string;
        const replacement = textReplacements.get(originalText);
        
        if (replacement !== undefined) {
          // Write operands
          for (const operand of op.operands.slice(0, -1)) {
            output += this.formatOperand(operand) + ' ';
          }
          // Write replaced text
          output += `(${replacement}) `;
          output += op.operator + '\n';
          continue;
        }
      }
      
      // Handle TJ operator
      if (op.operator === 'TJ' && op.operands.length > 0) {
        const operand = op.operands[0];
        if (!Array.isArray(operand)) {
          // Write original operator if operand is not an array
          for (const operandItem of op.operands) {
            output += this.formatOperand(operandItem) + ' ';
          }
          output += op.operator + '\n';
          continue;
        }
        const array = operand as Array<string | number>;
        const newArray: Array<string | number> = [];
        let modified = false;
        
        for (const item of array) {
          if (typeof item === 'string') {
            const replacement = textReplacements.get(item);
            if (replacement !== undefined) {
              newArray.push(replacement);
              modified = true;
            } else {
              newArray.push(item);
            }
          } else {
            newArray.push(item);
          }
        }
        
        if (modified) {
          output += '[';
          for (const item of newArray) {
            if (typeof item === 'string') {
              output += `(${item}) `;
            } else {
              output += item + ' ';
            }
          }
          output += '] ' + op.operator + '\n';
          continue;
        }
      }
      
      // Write original operator
      for (const operand of op.operands) {
        output += this.formatOperand(operand) + ' ';
      }
      output += op.operator + '\n';
    }
    
    return output;
  }

  /**
   * Format operand for output
   */
  private static formatOperand(operand: any): string {
    if (typeof operand === 'number') {
      return operand.toString();
    }
    if (typeof operand === 'boolean') {
      return operand ? 'true' : 'false';
    }
    if (typeof operand === 'string') {
      // Check if it's a name
      if (operand.startsWith('/')) {
        return operand;
      }
      // It's a string literal
      return `(${operand})`;
    }
    if (Array.isArray(operand)) {
      return '[' + operand.map(o => this.formatOperand(o)).join(' ') + ']';
    }
    return String(operand);
  }
}

