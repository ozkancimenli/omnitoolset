// Advanced Template System
// Manages PDF templates with categories, tags, and customization

import type { Annotation } from '../types';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  annotations: Annotation[];
  metadata: {
    author?: string;
    version: string;
    createdAt: number;
    updatedAt: number;
    usageCount: number;
  };
  customizable: {
    colors: boolean;
    fonts: boolean;
    layout: boolean;
    content: boolean;
  };
  variables?: Record<string, any>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  templates: string[];
}

export class AdvancedTemplateSystem {
  private templates: Map<string, Template> = new Map();
  private categories: Map<string, TemplateCategory> = new Map();
  private userTemplates: Map<string, Template> = new Map();

  /**
   * Register a template
   */
  registerTemplate(template: Template): void {
    this.templates.set(template.id, template);
    
    // Add to category
    if (!this.categories.has(template.category)) {
      this.createCategory(template.category, template.category, '📄', '');
    }
    const category = this.categories.get(template.category);
    if (category && !category.templates.includes(template.id)) {
      category.templates.push(template.id);
    }
  }

  /**
   * Create a category
   */
  createCategory(
    id: string,
    name: string,
    icon: string,
    description: string
  ): void {
    this.categories.set(id, {
      id,
      name,
      icon,
      description,
      templates: [],
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): Template | undefined {
    return this.templates.get(templateId) || this.userTemplates.get(templateId);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(categoryId: string): Template[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];

    return category.templates
      .map(id => this.getTemplate(id))
      .filter((t): t is Template => t !== undefined);
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    const results: Template[] = [];

    this.templates.forEach(template => {
      if (
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(template);
      }
    });

    return results;
  }

  /**
   * Apply template with customization
   */
  applyTemplate(
    templateId: string,
    customizations?: {
      colors?: Record<string, string>;
      fonts?: Record<string, string>;
      variables?: Record<string, any>;
    }
  ): Annotation[] {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Deep copy annotations
    let annotations = JSON.parse(JSON.stringify(template.annotations)) as Annotation[];

    // Apply customizations
    if (customizations) {
      if (customizations.colors && template.customizable.colors) {
        annotations = this.applyColors(annotations, customizations.colors);
      }

      if (customizations.fonts && template.customizable.fonts) {
        annotations = this.applyFonts(annotations, customizations.fonts);
      }

      if (customizations.variables && template.variables) {
        annotations = this.applyVariables(annotations, customizations.variables);
      }
    }

    // Increment usage count
    template.metadata.usageCount++;

    return annotations;
  }

  /**
   * Apply color customizations
   */
  private applyColors(
    annotations: Annotation[],
    colors: Record<string, string>
  ): Annotation[] {
    return annotations.map(annotation => {
      const updated = { ...annotation };
      
      if (colors.primary && annotation.color) {
        updated.color = colors.primary;
      }
      if (colors.secondary && annotation.strokeColor) {
        updated.strokeColor = colors.secondary;
      }
      if (colors.highlight && annotation.type === 'highlight') {
        updated.color = colors.highlight;
      }

      return updated;
    });
  }

  /**
   * Apply font customizations
   */
  private applyFonts(
    annotations: Annotation[],
    fonts: Record<string, string>
  ): Annotation[] {
    return annotations.map(annotation => {
      if (annotation.type !== 'text') return annotation;

      const updated = { ...annotation };
      if (fonts.family) updated.fontFamily = fonts.family;
      if (fonts.size) updated.fontSize = Number(fonts.size);
      if (fonts.weight) updated.fontWeight = fonts.weight as any;

      return updated;
    });
  }

  /**
   * Apply variable substitutions
   */
  private applyVariables(
    annotations: Annotation[],
    variables: Record<string, any>
  ): Annotation[] {
    return annotations.map(annotation => {
      if (annotation.type !== 'text' || !annotation.text) return annotation;

      const updated = { ...annotation };
      let text = annotation.text;

      // Replace variables like {{name}}, {{date}}, etc.
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        text = text.replace(regex, String(value));
      });

      updated.text = text;
      return updated;
    });
  }

  /**
   * Save user template
   */
  saveUserTemplate(template: Omit<Template, 'id' | 'metadata'>): string {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullTemplate: Template = {
      ...template,
      id,
      metadata: {
        version: '1.0.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        usageCount: 0,
      },
    };

    this.userTemplates.set(id, fullTemplate);
    return id;
  }

  /**
   * Delete user template
   */
  deleteUserTemplate(templateId: string): void {
    this.userTemplates.delete(templateId);
  }

  /**
   * Get all categories
   */
  getCategories(): TemplateCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Template[] {
    return [
      ...Array.from(this.templates.values()),
      ...Array.from(this.userTemplates.values()),
    ];
  }

  /**
   * Get popular templates
   */
  getPopularTemplates(limit: number = 10): Template[] {
    const all = this.getAllTemplates();
    return all
      .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
      .slice(0, limit);
  }
}

// Singleton instance
let templateSystemInstance: AdvancedTemplateSystem | null = null;

export const getAdvancedTemplateSystem = (): AdvancedTemplateSystem => {
  if (!templateSystemInstance) {
    templateSystemInstance = new AdvancedTemplateSystem();
  }
  return templateSystemInstance;
};

