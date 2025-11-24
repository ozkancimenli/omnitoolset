'use client';

/**
 * Global Initialization Component
 * Initializes system-wide optimizations
 */

import { useEffect } from 'react';
import { initGlobalPerformance } from '@/lib/globalPerformance';
import { initGlobalOptimization } from '@/lib/globalOptimization';
import { initGlobalErrorHandling } from '@/lib/globalErrorHandling';
import { initGlobalSecurity } from '@/lib/globalSecurity';
import { initPWA } from '@/lib/progressiveWebApp';
import { initMonitoring } from '@/lib/advancedMonitoring';
import { initSEO } from '@/lib/advancedSEO';

export function GlobalInit() {
  useEffect(() => {
    // Initialize all global optimizations
    initGlobalPerformance();
    initGlobalOptimization();
    initGlobalErrorHandling();
    initGlobalSecurity();
    initPWA();
    initMonitoring();
    initSEO();
  }, []);

  return null;
}

