/**
 * Advanced Undo/Redo System - Branching History and Advanced Operations
 * 
 * Provides branching undo/redo with merge capabilities
 */

export interface HistoryNode {
  id: string;
  timestamp: number;
  operation: string;
  data: any;
  parent?: string;
  children: string[];
  branch: string;
}

export interface HistoryBranch {
  id: string;
  name: string;
  head: string;
  nodes: Map<string, HistoryNode>;
}

export class AdvancedUndoRedo {
  private branches: Map<string, HistoryBranch> = new Map();
  private currentBranch: string = 'main';
  private maxHistorySize: number = 100;
  private maxBranches: number = 10;

  /**
   * Create new history node
   */
  createNode(
    operation: string,
    data: any,
    branchId?: string
  ): HistoryNode {
    const branch = branchId || this.currentBranch;
    const branchData = this.branches.get(branch);
    
    if (!branchData) {
      throw new Error(`Branch ${branch} does not exist`);
    }

    const node: HistoryNode = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      operation,
      data,
      parent: branchData.head,
      children: [],
      branch,
    };

    // Add to branch
    branchData.nodes.set(node.id, node);
    
    // Update parent's children
    if (node.parent) {
      const parent = branchData.nodes.get(node.parent);
      if (parent) {
        parent.children.push(node.id);
      }
    }

    // Update branch head
    branchData.head = node.id;

    // Limit history size
    this.limitHistorySize(branch);

    return node;
  }

  /**
   * Undo operation
   */
  undo(branchId?: string): HistoryNode | null {
    const branch = branchId || this.currentBranch;
    const branchData = this.branches.get(branch);
    
    if (!branchData || !branchData.head) {
      return null;
    }

    const currentNode = branchData.nodes.get(branchData.head);
    if (!currentNode || !currentNode.parent) {
      return null;
    }

    // Move to parent
    branchData.head = currentNode.parent;
    return currentNode;
  }

  /**
   * Redo operation
   */
  redo(branchId?: string): HistoryNode | null {
    const branch = branchId || this.currentBranch;
    const branchData = this.branches.get(branch);
    
    if (!branchData || !branchData.head) {
      return null;
    }

    const currentNode = branchData.nodes.get(branchData.head);
    if (!currentNode || currentNode.children.length === 0) {
      return null;
    }

    // Move to first child (linear redo)
    const nextNodeId = currentNode.children[0];
    branchData.head = nextNodeId;
    return branchData.nodes.get(nextNodeId) || null;
  }

  /**
   * Create new branch
   */
  createBranch(name: string, fromBranch?: string): string {
    if (this.branches.size >= this.maxBranches) {
      // Remove oldest branch
      const oldest = Array.from(this.branches.values())
        .sort((a, b) => {
          const aHead = a.nodes.get(a.head);
          const bHead = b.nodes.get(b.head);
          return (aHead?.timestamp || 0) - (bHead?.timestamp || 0);
        })[0];
      this.branches.delete(oldest.id);
    }

    const sourceBranch = fromBranch || this.currentBranch;
    const sourceData = this.branches.get(sourceBranch);
    
    const branchId = `branch-${Date.now()}`;
    const newBranch: HistoryBranch = {
      id: branchId,
      name,
      head: sourceData?.head || '',
      nodes: new Map(sourceData?.nodes || []),
    };

    this.branches.set(branchId, newBranch);
    return branchId;
  }

  /**
   * Switch to branch
   */
  switchBranch(branchId: string): boolean {
    if (!this.branches.has(branchId)) {
      return false;
    }
    this.currentBranch = branchId;
    return true;
  }

  /**
   * Merge branches
   */
  mergeBranches(
    sourceBranch: string,
    targetBranch: string,
    strategy: 'theirs' | 'ours' | 'merge' = 'merge'
  ): boolean {
    const source = this.branches.get(sourceBranch);
    const target = this.branches.get(targetBranch);
    
    if (!source || !target) {
      return false;
    }

    if (strategy === 'theirs') {
      // Use source branch completely
      target.head = source.head;
      target.nodes = new Map(source.nodes);
    } else if (strategy === 'ours') {
      // Keep target branch (no change)
      return true;
    } else {
      // Merge: combine both histories
      // This is a simplified merge - in practice would need conflict resolution
      for (const [id, node] of source.nodes) {
        if (!target.nodes.has(id)) {
          target.nodes.set(id, node);
        }
      }
      // Set head to most recent
      const sourceHead = source.nodes.get(source.head);
      const targetHead = target.nodes.get(target.head);
      if (sourceHead && targetHead) {
        target.head = sourceHead.timestamp > targetHead.timestamp 
          ? source.head 
          : target.head;
      }
    }

    return true;
  }

  /**
   * Get branch history
   */
  getBranchHistory(branchId?: string): HistoryNode[] {
    const branch = branchId || this.currentBranch;
    const branchData = this.branches.get(branch);
    
    if (!branchData) {
      return [];
    }

    const history: HistoryNode[] = [];
    let currentNodeId = branchData.head;

    while (currentNodeId) {
      const node = branchData.nodes.get(currentNodeId);
      if (!node) break;
      
      history.unshift(node);
      currentNodeId = node.parent || '';
    }

    return history;
  }

  /**
   * Get all branches
   */
  getBranches(): HistoryBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Limit history size
   */
  private limitHistorySize(branchId: string): void {
    const branch = this.branches.get(branchId);
    if (!branch) return;

    const history = this.getBranchHistory(branchId);
    if (history.length <= this.maxHistorySize) return;

    // Remove oldest nodes (keep only most recent)
    const toKeep = history.slice(-this.maxHistorySize);
    const toRemove = history.slice(0, history.length - this.maxHistorySize);

    for (const node of toRemove) {
      branch.nodes.delete(node.id);
    }

    // Update head if needed
    if (toKeep.length > 0) {
      branch.head = toKeep[toKeep.length - 1].id;
    }
  }

  /**
   * Initialize main branch
   */
  constructor() {
    this.branches.set('main', {
      id: 'main',
      name: 'Main',
      head: '',
      nodes: new Map(),
    });
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.branches.clear();
    this.branches.set('main', {
      id: 'main',
      name: 'Main',
      head: '',
      nodes: new Map(),
    });
    this.currentBranch = 'main';
  }
}

