// Advanced Undo/Redo System with Branches
// Provides sophisticated undo/redo with branching history

export interface HistoryState {
  id: string;
  timestamp: number;
  type: 'action' | 'checkpoint';
  description: string;
  data: any;
  parent?: string;
  children: string[];
  branch?: string;
}

export interface HistoryBranch {
  name: string;
  head: string;
  created: number;
  description?: string;
}

export class AdvancedUndoRedo {
  private history: Map<string, HistoryState> = new Map();
  private currentState: string | null = null;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private branches: Map<string, HistoryBranch> = new Map();
  private currentBranch: string = 'main';
  private maxHistorySize: number = 100;

  constructor() {
    this.createBranch('main', 'Main history branch');
  }

  /**
   * Create a checkpoint
   */
  createCheckpoint(description: string, data: any): string {
    return this.addState('checkpoint', description, data);
  }

  /**
   * Add action to history
   */
  addAction(description: string, data: any): string {
    const stateId = this.addState('action', description, data);
    this.redoStack = []; // Clear redo stack on new action
    return stateId;
  }

  /**
   * Add state to history
   */
  private addState(type: 'action' | 'checkpoint', description: string, data: any): string {
    const stateId = `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const state: HistoryState = {
      id: stateId,
      timestamp: Date.now(),
      type,
      description,
      data: this.deepClone(data),
      parent: this.currentState || undefined,
      children: [],
      branch: this.currentBranch,
    };

    // Link to parent
    if (this.currentState) {
      const parent = this.history.get(this.currentState);
      if (parent) {
        parent.children.push(stateId);
      }
    }

    this.history.set(stateId, state);
    this.currentState = stateId;
    this.undoStack.push(stateId);

    // Update branch head
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.head = stateId;
    }

    // Limit history size
    this.limitHistorySize();

    return stateId;
  }

  /**
   * Undo last action
   */
  undo(): HistoryState | null {
    if (this.undoStack.length === 0) {
      return null;
    }

    const stateId = this.undoStack.pop()!;
    const state = this.history.get(stateId);
    
    if (state) {
      this.redoStack.push(stateId);
      this.currentState = state.parent || null;
      return state;
    }

    return null;
  }

  /**
   * Redo last undone action
   */
  redo(): HistoryState | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    const stateId = this.redoStack.pop()!;
    const state = this.history.get(stateId);
    
    if (state) {
      this.undoStack.push(stateId);
      this.currentState = stateId;
      return state;
    }

    return null;
  }

  /**
   * Create a branch from current state
   */
  createBranch(name: string, description?: string): void {
    const branch: HistoryBranch = {
      name,
      head: this.currentState || '',
      created: Date.now(),
      description,
    };

    this.branches.set(name, branch);
  }

  /**
   * Switch to branch
   */
  switchBranch(branchName: string): void {
    const branch = this.branches.get(branchName);
    if (!branch) {
      throw new Error(`Branch ${branchName} not found`);
    }

    this.currentBranch = branchName;
    this.currentState = branch.head;
    
    // Rebuild stacks based on branch
    this.rebuildStacks();
  }

  /**
   * Merge branch into current
   */
  mergeBranch(branchName: string, description?: string): string {
    const branch = this.branches.get(branchName);
    if (!branch) {
      throw new Error(`Branch ${branchName} not found`);
    }

    // Create merge checkpoint
    return this.createCheckpoint(
      description || `Merge ${branchName} into ${this.currentBranch}`,
      {
        mergedFrom: branchName,
        mergedInto: this.currentBranch,
      }
    );
  }

  /**
   * Get current state
   */
  getCurrentState(): HistoryState | null {
    if (!this.currentState) return null;
    return this.history.get(this.currentState) || null;
  }

  /**
   * Get history
   */
  getHistory(limit?: number): HistoryState[] {
    const states = Array.from(this.history.values());
    states.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? states.slice(0, limit) : states;
  }

  /**
   * Get undo stack
   */
  getUndoStack(): string[] {
    return [...this.undoStack];
  }

  /**
   * Get redo stack
   */
  getRedoStack(): string[] {
    return [...this.redoStack];
  }

  /**
   * Can undo
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Can redo
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
  }

  /**
   * Rebuild stacks
   */
  private rebuildStacks(): void {
    this.undoStack = [];
    this.redoStack = [];

    if (!this.currentState) return;

    // Build path to root
    const path: string[] = [];
    let current: string | null = this.currentState;

    while (current) {
      path.unshift(current);
      const state = this.history.get(current);
      current = state?.parent || null;
    }

    this.undoStack = path;
  }

  /**
   * Limit history size
   */
  private limitHistorySize(): void {
    if (this.history.size <= this.maxHistorySize) return;

    // Remove oldest states (keep checkpoints)
    const states = Array.from(this.history.values())
      .filter(s => s.type === 'action')
      .sort((a, b) => a.timestamp - b.timestamp);

    const toRemove = states.slice(0, states.length - this.maxHistorySize + 50);
    toRemove.forEach(state => {
      this.history.delete(state.id);
      this.undoStack = this.undoStack.filter(id => id !== state.id);
      this.redoStack = this.redoStack.filter(id => id !== state.id);
    });
  }

  /**
   * Deep clone
   */
  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Get all branches
   */
  getBranches(): HistoryBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Get current branch
   */
  getCurrentBranch(): string {
    return this.currentBranch;
  }
}

// Singleton instance
let undoRedoInstance: AdvancedUndoRedo | null = null;

export const getAdvancedUndoRedo = (): AdvancedUndoRedo => {
  if (!undoRedoInstance) {
    undoRedoInstance = new AdvancedUndoRedo();
  }
  return undoRedoInstance;
};

