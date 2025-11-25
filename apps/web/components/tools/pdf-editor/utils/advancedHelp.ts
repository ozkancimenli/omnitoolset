// Advanced Help and Tutorial System
// Provides interactive tutorials, tooltips, and help content

export interface HelpTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  videoUrl?: string;
  steps?: HelpStep[];
  relatedTopics?: string[];
}

export interface HelpStep {
  title: string;
  description: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  highlight?: string;
  action?: () => Promise<void>;
  checkCompletion?: () => boolean;
}

export class AdvancedHelpSystem {
  private topics: Map<string, HelpTopic> = new Map();
  private tutorials: Map<string, Tutorial> = new Map();
  private activeTutorial: Tutorial | null = null;
  private currentStep: number = 0;
  private tooltips: Map<string, string> = new Map();

  /**
   * Register a help topic
   */
  registerTopic(topic: HelpTopic): void {
    this.topics.set(topic.id, topic);
  }

  /**
   * Get help topic
   */
  getTopic(topicId: string): HelpTopic | undefined {
    return this.topics.get(topicId);
  }

  /**
   * Search help topics
   */
  searchTopics(query: string): HelpTopic[] {
    const lowerQuery = query.toLowerCase();
    const results: HelpTopic[] = [];

    this.topics.forEach(topic => {
      if (
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.content.toLowerCase().includes(lowerQuery) ||
        topic.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(topic);
      }
    });

    return results;
  }

  /**
   * Get topics by category
   */
  getTopicsByCategory(category: string): HelpTopic[] {
    const results: HelpTopic[] = [];
    this.topics.forEach(topic => {
      if (topic.category === category) {
        results.push(topic);
      }
    });
    return results;
  }

  /**
   * Register a tutorial
   */
  registerTutorial(tutorial: Tutorial): void {
    this.tutorials.set(tutorial.id, tutorial);
  }

  /**
   * Start a tutorial
   */
  async startTutorial(tutorialId: string): Promise<void> {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      throw new Error(`Tutorial ${tutorialId} not found`);
    }

    this.activeTutorial = tutorial;
    this.currentStep = 0;
    await this.showStep(0);
  }

  /**
   * Show tutorial step
   */
  private async showStep(stepIndex: number): Promise<void> {
    if (!this.activeTutorial) return;

    const step = this.activeTutorial.steps[stepIndex];
    if (!step) {
      this.completeTutorial();
      return;
    }

    // Highlight target element
    if (step.target) {
      this.highlightElement(step.target);
    }

    // Show step content
    this.showStepContent(step);

    // Execute action if provided
    if (step.action) {
      await step.action();
    }
  }

  /**
   * Highlight element
   */
  private highlightElement(selector: string): void {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tutorial-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Show step content
   */
  private showStepContent(step: TutorialStep): void {
    // This would show a modal or overlay with step content
    console.log(`[Tutorial] Step ${this.currentStep + 1}: ${step.title}`);
    console.log(`[Tutorial] ${step.description}`);
  }

  /**
   * Next tutorial step
   */
  async nextStep(): Promise<void> {
    if (!this.activeTutorial) return;

    const step = this.activeTutorial.steps[this.currentStep];
    
    // Check completion if provided
    if (step.checkCompletion && !step.checkCompletion()) {
      console.warn('[Tutorial] Step not completed yet');
      return;
    }

    this.currentStep++;
    await this.showStep(this.currentStep);
  }

  /**
   * Previous tutorial step
   */
  async previousStep(): Promise<void> {
    if (!this.activeTutorial) return;

    if (this.currentStep > 0) {
      this.currentStep--;
      await this.showStep(this.currentStep);
    }
  }

  /**
   * Complete tutorial
   */
  completeTutorial(): void {
    if (this.activeTutorial) {
      console.log(`[Tutorial] Completed: ${this.activeTutorial.name}`);
      this.activeTutorial = null;
      this.currentStep = 0;
      this.clearHighlights();
    }
  }

  /**
   * Cancel tutorial
   */
  cancelTutorial(): void {
    this.activeTutorial = null;
    this.currentStep = 0;
    this.clearHighlights();
  }

  /**
   * Clear highlights
   */
  private clearHighlights(): void {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  }

  /**
   * Register tooltip
   */
  registerTooltip(elementId: string, content: string): void {
    this.tooltips.set(elementId, content);
  }

  /**
   * Get tooltip
   */
  getTooltip(elementId: string): string | undefined {
    return this.tooltips.get(elementId);
  }

  /**
   * Show tooltip
   */
  showTooltip(elementId: string, position: 'top' | 'bottom' | 'left' | 'right' = 'top'): void {
    const content = this.getTooltip(elementId);
    if (!content) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    tooltip.textContent = content;
    tooltip.style.cssText = `
      position: absolute;
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
      max-width: 200px;
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    switch (position) {
      case 'top':
        tooltip.style.bottom = `${window.innerHeight - rect.top + 8}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        tooltip.style.top = `${rect.bottom + 8}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltip.style.right = `${window.innerWidth - rect.left + 8}px`;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        tooltip.style.left = `${rect.right + 8}px`;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
    }

    // Remove on mouse leave
    const removeTooltip = () => {
      tooltip.remove();
      element.removeEventListener('mouseleave', removeTooltip);
    };
    element.addEventListener('mouseleave', removeTooltip);
  }

  /**
   * Get all tutorials
   */
  getAllTutorials(): Tutorial[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * Get active tutorial
   */
  getActiveTutorial(): Tutorial | null {
    return this.activeTutorial;
  }

  /**
   * Get current step
   */
  getCurrentStep(): number {
    return this.currentStep;
  }
}

// Singleton instance
let helpSystemInstance: AdvancedHelpSystem | null = null;

export const getAdvancedHelpSystem = (): AdvancedHelpSystem => {
  if (!helpSystemInstance) {
    helpSystemInstance = new AdvancedHelpSystem();
  }
  return helpSystemInstance;
};

