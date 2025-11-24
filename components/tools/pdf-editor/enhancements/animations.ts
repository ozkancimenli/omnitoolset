// Animation Utilities for Smooth UI Interactions

/**
 * Easing functions for smooth animations
 */
export const easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  spring: (t: number) => 1 - Math.cos(t * Math.PI / 2),
};

/**
 * Animate a value over time
 */
export const animate = (
  from: number,
  to: number,
  duration: number,
  callback: (value: number) => void,
  easingFn: (t: number) => number = easing.easeOut
): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const difference = to - from;
    
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easingFn(progress);
      const current = from + difference * eased;
      
      callback(current);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    
    requestAnimationFrame(step);
  });
};

/**
 * Create a spring animation
 */
export const spring = (
  from: number,
  to: number,
  callback: (value: number) => void,
  options: { stiffness?: number; damping?: number; mass?: number } = {}
): Promise<void> => {
  const { stiffness = 100, damping = 10, mass = 1 } = options;
  const velocity = 0;
  let position = from;
  const target = to;
  
  return new Promise((resolve) => {
    const step = () => {
      const force = (target - position) * stiffness;
      const dampingForce = velocity * damping;
      const acceleration = (force - dampingForce) / mass;
      const newVelocity = velocity + acceleration * 0.016; // ~60fps
      const newPosition = position + newVelocity * 0.016;
      
      position = newPosition;
      callback(position);
      
      if (Math.abs(target - position) < 0.01 && Math.abs(newVelocity) < 0.01) {
        callback(target);
        resolve();
      } else {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  });
};

/**
 * Fade in animation
 */
export const fadeIn = (
  element: HTMLElement,
  duration: number = 300
): Promise<void> => {
  return animate(0, 1, duration, (value) => {
    element.style.opacity = value.toString();
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  element: HTMLElement,
  duration: number = 300
): Promise<void> => {
  return animate(1, 0, duration, (value) => {
    element.style.opacity = value.toString();
  });
};

/**
 * Slide animation
 */
export const slide = (
  element: HTMLElement,
  from: number,
  to: number,
  duration: number = 300,
  direction: 'x' | 'y' = 'y'
): Promise<void> => {
  const property = direction === 'x' ? 'translateX' : 'translateY';
  return animate(from, to, duration, (value) => {
    element.style.transform = `${property}(${value}px)`;
  });
};

/**
 * Scale animation
 */
export const scale = (
  element: HTMLElement,
  from: number,
  to: number,
  duration: number = 300
): Promise<void> => {
  return animate(from, to, duration, (value) => {
    element.style.transform = `scale(${value})`;
  });
};

/**
 * Rotate animation
 */
export const rotate = (
  element: HTMLElement,
  from: number,
  to: number,
  duration: number = 300
): Promise<void> => {
  return animate(from, to, duration, (value) => {
    element.style.transform = `rotate(${value}deg)`;
  });
};

/**
 * Create a micro-interaction for button clicks
 */
export const createMicroInteraction = (element: HTMLElement) => {
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;
  
  element.style.transition = 'transform 0.1s ease-out';
  
  const press = () => {
    element.style.transform = 'scale(0.95)';
  };
  
  const release = () => {
    element.style.transform = originalTransform || 'scale(1)';
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 100);
  };
  
  return { press, release };
};

/**
 * Stagger animation for multiple elements
 */
export const stagger = (
  elements: HTMLElement[],
  animation: (element: HTMLElement) => Promise<void>,
  delay: number = 50
): Promise<void> => {
  return Promise.all(
    elements.map((element, index) => 
      new Promise<void>((resolve) => {
        setTimeout(() => {
          animation(element).then(resolve);
        }, index * delay);
      })
    )
  ).then(() => {});
};

