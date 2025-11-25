// Plugin System for Extensibility
// Allows third-party plugins to extend PDF editor functionality

export interface Plugin {
  name: string;
  version: string;
  author?: string;
  description?: string;
  initialize: (context: PluginContext) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
  hooks?: {
    [hookName: string]: (...args: any[]) => any | Promise<any>;
  };
}

export interface PluginContext {
  registerCommand: (name: string, handler: (...args: any[]) => any) => void;
  registerHook: (name: string, handler: (...args: any[]) => any) => void;
  getAPI: (apiName: string) => any;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
}

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Set<(...args: any[]) => any>> = new Map();
  private commands: Map<string, (...args: any[]) => any> = new Map();
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private apis: Map<string, any> = new Map();

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    const context: PluginContext = {
      registerCommand: (name: string, handler: (...args: any[]) => any) => {
        this.commands.set(`${plugin.name}:${name}`, handler);
      },
      registerHook: (name: string, handler: (...args: any[]) => any) => {
        if (!this.hooks.has(name)) {
          this.hooks.set(name, new Set());
        }
        this.hooks.get(name)!.add(handler);
      },
      getAPI: (apiName: string) => {
        return this.apis.get(apiName);
      },
      emit: (event: string, data: any) => {
        this.emit(`${plugin.name}:${event}`, data);
      },
      on: (event: string, handler: (data: any) => void) => {
        this.on(`${plugin.name}:${event}`, handler);
      },
    };

    try {
      await plugin.initialize(context);
      this.plugins.set(plugin.name, plugin);
      console.log(`[PluginSystem] Registered plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`[PluginSystem] Failed to register plugin ${plugin.name}:`, error);
      throw error;
    }
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not registered`);
    }

    if (plugin.destroy) {
      await plugin.destroy();
    }

    // Remove plugin commands
    const commandPrefix = `${pluginName}:`;
    for (const [key] of this.commands) {
      if (key.startsWith(commandPrefix)) {
        this.commands.delete(key);
      }
    }

    // Remove plugin hooks
    for (const [hookName, handlers] of this.hooks) {
      for (const handler of handlers) {
        // Note: We can't easily identify which handler belongs to which plugin
        // In production, track this better
      }
    }

    this.plugins.delete(pluginName);
    console.log(`[PluginSystem] Unregistered plugin: ${pluginName}`);
  }

  /**
   * Execute a hook
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const handlers = this.hooks.get(hookName);
    if (!handlers || handlers.size === 0) {
      return args;
    }

    let result = args;
    for (const handler of handlers) {
      try {
        result = await handler(...result);
        if (!Array.isArray(result)) {
          result = [result];
        }
      } catch (error) {
        console.error(`[PluginSystem] Hook ${hookName} error:`, error);
      }
    }

    return result;
  }

  /**
   * Execute a command
   */
  async executeCommand(commandName: string, ...args: any[]): Promise<any> {
    const handler = this.commands.get(commandName);
    if (!handler) {
      throw new Error(`Command ${commandName} not found`);
    }

    return await handler(...args);
  }

  /**
   * Register an API
   */
  registerAPI(apiName: string, api: any): void {
    this.apis.set(apiName, api);
  }

  /**
   * Emit event
   */
  emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[PluginSystem] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Listen to event
   */
  on(event: string, handler: (data: any) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unregister function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if plugin is registered
   */
  hasPlugin(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }
}

// Singleton instance
let pluginSystemInstance: PluginSystem | null = null;

export const getPluginSystem = (): PluginSystem => {
  if (!pluginSystemInstance) {
    pluginSystemInstance = new PluginSystem();
  }
  return pluginSystemInstance;
};

