/**
 * Coordinate Transformer - Advanced Coordinate System Conversions
 * 
 * Handles complex coordinate transformations between different PDF coordinate systems
 */

export interface CoordinateSystem {
  origin: 'top-left' | 'bottom-left' | 'center';
  xAxis: 'left-to-right' | 'right-to-left';
  yAxis: 'top-to-bottom' | 'bottom-to-top';
  unit: 'point' | 'pixel' | 'inch' | 'cm' | 'mm';
}

export interface TransformMatrix {
  a: number; // Scale X
  b: number; // Skew Y
  c: number; // Skew X
  d: number; // Scale Y
  e: number; // Translate X
  f: number; // Translate Y
}

export class CoordinateTransformer {
  /**
   * Convert PDF coordinates (bottom-left origin) to Canvas coordinates (top-left origin)
   */
  static pdfToCanvas(
    pdfX: number,
    pdfY: number,
    viewportHeight: number
  ): { x: number; y: number } {
    return {
      x: pdfX,
      y: viewportHeight - pdfY,
    };
  }

  /**
   * Convert Canvas coordinates (top-left origin) to PDF coordinates (bottom-left origin)
   */
  static canvasToPdf(
    canvasX: number,
    canvasY: number,
    viewportHeight: number
  ): { x: number; y: number } {
    return {
      x: canvasX,
      y: viewportHeight - canvasY,
    };
  }

  /**
   * Apply transformation matrix
   */
  static applyTransform(
    x: number,
    y: number,
    matrix: TransformMatrix
  ): { x: number; y: number } {
    return {
      x: matrix.a * x + matrix.c * y + matrix.e,
      y: matrix.b * x + matrix.d * y + matrix.f,
    };
  }

  /**
   * Multiply transformation matrices
   */
  static multiplyMatrices(
    m1: TransformMatrix,
    m2: TransformMatrix
  ): TransformMatrix {
    return {
      a: m1.a * m2.a + m1.b * m2.c,
      b: m1.a * m2.b + m1.b * m2.d,
      c: m1.c * m2.a + m1.d * m2.c,
      d: m1.c * m2.b + m1.d * m2.d,
      e: m1.a * m2.e + m1.c * m2.f + m1.e,
      f: m1.b * m2.e + m1.d * m2.f + m1.f,
    };
  }

  /**
   * Create transformation matrix from array [a, b, c, d, e, f]
   */
  static fromArray(arr: number[]): TransformMatrix {
    return {
      a: arr[0] || 1,
      b: arr[1] || 0,
      c: arr[2] || 0,
      d: arr[3] || 1,
      e: arr[4] || 0,
      f: arr[5] || 0,
    };
  }

  /**
   * Convert transformation matrix to array
   */
  static toArray(matrix: TransformMatrix): number[] {
    return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
  }

  /**
   * Create identity matrix
   */
  static identity(): TransformMatrix {
    return {
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
    };
  }

  /**
   * Create translation matrix
   */
  static translate(tx: number, ty: number): TransformMatrix {
    return {
      a: 1, b: 0, c: 0, d: 1, e: tx, f: ty,
    };
  }

  /**
   * Create scale matrix
   */
  static scale(sx: number, sy: number): TransformMatrix {
    return {
      a: sx, b: 0, c: 0, d: sy, e: 0, f: 0,
    };
  }

  /**
   * Create rotation matrix
   */
  static rotate(angle: number): TransformMatrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0,
    };
  }

  /**
   * Invert transformation matrix
   */
  static invert(matrix: TransformMatrix): TransformMatrix | null {
    const det = matrix.a * matrix.d - matrix.b * matrix.c;
    if (Math.abs(det) < 1e-10) return null; // Singular matrix

    return {
      a: matrix.d / det,
      b: -matrix.b / det,
      c: -matrix.c / det,
      d: matrix.a / det,
      e: (matrix.c * matrix.f - matrix.d * matrix.e) / det,
      f: (matrix.b * matrix.e - matrix.a * matrix.f) / det,
    };
  }

  /**
   * Convert units
   */
  static convertUnits(
    value: number,
    from: 'point' | 'pixel' | 'inch' | 'cm' | 'mm',
    to: 'point' | 'pixel' | 'inch' | 'cm' | 'mm',
    dpi: number = 72
  ): number {
    // Convert to points first
    let points: number;
    
    switch (from) {
      case 'point':
        points = value;
        break;
      case 'pixel':
        points = (value / dpi) * 72;
        break;
      case 'inch':
        points = value * 72;
        break;
      case 'cm':
        points = (value / 2.54) * 72;
        break;
      case 'mm':
        points = (value / 25.4) * 72;
        break;
      default:
        points = value;
    }

    // Convert from points to target unit
    switch (to) {
      case 'point':
        return points;
      case 'pixel':
        return (points / 72) * dpi;
      case 'inch':
        return points / 72;
      case 'cm':
        return (points / 72) * 2.54;
      case 'mm':
        return (points / 72) * 25.4;
      default:
        return points;
    }
  }

  /**
   * Transform bounding box
   */
  static transformBoundingBox(
    x: number,
    y: number,
    width: number,
    height: number,
    matrix: TransformMatrix
  ): { x: number; y: number; width: number; height: number } {
    // Transform all four corners
    const corners = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ].map(corner => this.applyTransform(corner.x, corner.y, matrix));

    // Find bounding box of transformed corners
    const xs = corners.map(c => c.x);
    const ys = corners.map(c => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}



