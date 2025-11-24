// Testing Utilities and QA Tools
// Provides utilities for testing and quality assurance

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

export class TestUtilities {
  /**
   * Run a test
   */
  async runTest(name: string, testFn: () => Promise<void> | void): Promise<TestResult> {
    const start = performance.now();
    try {
      await testFn();
      const duration = performance.now() - start;
      return {
        name,
        passed: true,
        duration,
      };
    } catch (error: any) {
      const duration = performance.now() - start;
      return {
        name,
        passed: false,
        duration,
        error: error.message || String(error),
        details: error,
      };
    }
  }

  /**
   * Run test suite
   */
  async runTestSuite(name: string, tests: Array<{ name: string; fn: () => Promise<void> | void }>): Promise<TestSuite> {
    const start = performance.now();
    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await this.runTest(test.name, test.fn);
      results.push(result);
    }

    const duration = performance.now() - start;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    return {
      name,
      tests: results,
      passed,
      failed,
      duration,
    };
  }

  /**
   * Assert utility
   */
  assert(condition: boolean, message: string = 'Assertion failed'): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Assert equals
   */
  assertEquals(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  /**
   * Assert deep equals
   */
  assertDeepEquals(actual: any, expected: any, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Mock function
   */
  createMock<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<T> {
    const mock = jest.fn(implementation);
    return mock as any;
  }

  /**
   * Wait for condition
   */
  async waitFor(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now();
    while (!condition()) {
      if (Date.now() - start > timeout) {
        throw new Error('Timeout waiting for condition');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  /**
   * Generate test data
   */
  generateTestPDF(size: 'small' | 'medium' | 'large' = 'medium'): ArrayBuffer {
    // Generate mock PDF data
    const sizes = {
      small: 1024,
      medium: 10240,
      large: 102400,
    };
    
    return new ArrayBuffer(sizes[size]);
  }

  /**
   * Create test annotation
   */
  createTestAnnotation(overrides?: any): any {
    return {
      id: `test-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      text: 'Test annotation',
      fontSize: 16,
      color: '#000000',
      ...overrides,
    };
  }

  /**
   * Performance benchmark
   */
  async benchmark(name: string, fn: () => Promise<void> | void, iterations: number = 10): Promise<{
    name: string;
    iterations: number;
    total: number;
    average: number;
    min: number;
    max: number;
  }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    return {
      name,
      iterations,
      total: times.reduce((a, b) => a + b, 0),
      average: times.reduce((a, b) => a + b, 0) / iterations,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }
}

// Singleton instance
let testUtilitiesInstance: TestUtilities | null = null;

export const getTestUtilities = (): TestUtilities => {
  if (!testUtilitiesInstance) {
    testUtilitiesInstance = new TestUtilities();
  }
  return testUtilitiesInstance;
};

