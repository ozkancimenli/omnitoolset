// Version Control System
// Manages PDF versions and history branches

export interface PDFVersion {
  id: string;
  timestamp: number;
  message: string;
  author?: string;
  data: ArrayBuffer;
  annotations: any[];
  metadata: {
    pageCount: number;
    fileSize: number;
    checksum: string;
  };
  parent?: string;
  branches?: string[];
}

export interface VersionBranch {
  name: string;
  head: string;
  created: number;
  description?: string;
}

export class VersionControl {
  private versions: Map<string, PDFVersion> = new Map();
  private branches: Map<string, VersionBranch> = new Map();
  private currentBranch: string = 'main';
  private currentVersion: string | null = null;

  /**
   * Create a new version
   */
  async createVersion(
    data: ArrayBuffer,
    annotations: any[],
    message: string,
    author?: string
  ): Promise<string> {
    const versionId = `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const checksum = await this.calculateChecksum(data);

    const version: PDFVersion = {
      id: versionId,
      timestamp: Date.now(),
      message,
      author,
      data,
      annotations: JSON.parse(JSON.stringify(annotations)), // Deep copy
      metadata: {
        pageCount: 0, // Would extract from PDF
        fileSize: data.byteLength,
        checksum,
      },
      parent: this.currentVersion || undefined,
    };

    // Update parent's branches
    if (this.currentVersion) {
      const parent = this.versions.get(this.currentVersion);
      if (parent) {
        parent.branches = parent.branches || [];
        parent.branches.push(versionId);
      }
    }

    this.versions.set(versionId, version);
    this.currentVersion = versionId;

    // Update branch head
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.head = versionId;
    }

    return versionId;
  }

  /**
   * Get version by ID
   */
  getVersion(versionId: string): PDFVersion | undefined {
    return this.versions.get(versionId);
  }

  /**
   * Get current version
   */
  getCurrentVersion(): PDFVersion | undefined {
    if (!this.currentVersion) return undefined;
    return this.versions.get(this.currentVersion);
  }

  /**
   * Get version history
   */
  getHistory(limit?: number): PDFVersion[] {
    const versions = Array.from(this.versions.values());
    versions.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? versions.slice(0, limit) : versions;
  }

  /**
   * Get version tree
   */
  getVersionTree(): Map<string, PDFVersion[]> {
    const tree = new Map<string, PDFVersion[]>();
    
    this.versions.forEach(version => {
      const parent = version.parent || 'root';
      if (!tree.has(parent)) {
        tree.set(parent, []);
      }
      tree.get(parent)!.push(version);
    });

    return tree;
  }

  /**
   * Create a branch
   */
  createBranch(name: string, fromVersion?: string, description?: string): void {
    const branch: VersionBranch = {
      name,
      head: fromVersion || this.currentVersion || '',
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
    this.currentVersion = branch.head;
  }

  /**
   * Merge branch
   */
  async mergeBranch(
    sourceBranch: string,
    targetBranch: string = this.currentBranch,
    message?: string
  ): Promise<string> {
    const source = this.branches.get(sourceBranch);
    const target = this.branches.get(targetBranch);

    if (!source || !target) {
      throw new Error('Branch not found');
    }

    const sourceVersion = this.versions.get(source.head);
    const targetVersion = this.versions.get(target.head);

    if (!sourceVersion || !targetVersion) {
      throw new Error('Version not found');
    }

    // Merge logic would go here
    // For now, create a new version from target
    return await this.createVersion(
      targetVersion.data,
      targetVersion.annotations,
      message || `Merge ${sourceBranch} into ${targetBranch}`
    );
  }

  /**
   * Delete version
   */
  deleteVersion(versionId: string): void {
    this.versions.delete(versionId);
    
    // Update references
    this.versions.forEach(version => {
      if (version.parent === versionId) {
        version.parent = undefined;
      }
      if (version.branches) {
        version.branches = version.branches.filter(b => b !== versionId);
      }
    });
  }

  /**
   * Calculate checksum
   */
  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get all branches
   */
  getBranches(): VersionBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Get current branch
   */
  getCurrentBranch(): string {
    return this.currentBranch;
  }

  /**
   * Export version
   */
  exportVersion(versionId: string): PDFVersion | undefined {
    return this.versions.get(versionId);
  }

  /**
   * Import version
   */
  importVersion(version: PDFVersion): void {
    this.versions.set(version.id, version);
  }
}

// Singleton instance
let versionControlInstance: VersionControl | null = null;

export const getVersionControl = (): VersionControl => {
  if (!versionControlInstance) {
    versionControlInstance = new VersionControl();
    // Initialize main branch
    versionControlInstance.createBranch('main', undefined, 'Main branch');
  }
  return versionControlInstance;
};

