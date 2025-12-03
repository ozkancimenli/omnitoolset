// Comprehensive Error Handling & Monitoring
(function() {
    'use strict';
    
    // Global error handler
    window.addEventListener('error', (event) => {
        // Don't log Adsterra errors (already suppressed)
        if (event.filename && event.filename.includes('effectivegatecpm.com')) {
            return;
        }
        
        const errorInfo = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error caught:', errorInfo);
        }
        
        // Send to analytics (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': event.message,
                'fatal': false
            });
        }
        
        // Show user-friendly error message
        if (typeof showToast !== 'undefined') {
            showToast('Something went wrong. Please try again.', 'error', 5000);
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        // Don't log Adsterra rejections
        const reason = String(event.reason || '');
        if (reason.includes('effectivegatecpm.com')) {
            return;
        }
        
        const errorInfo = {
            reason: reason,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Unhandled rejection:', errorInfo);
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': `Unhandled rejection: ${reason}`,
                'fatal': false
            });
        }
    });
    
    // Network error handler
    function handleNetworkError(error) {
        if (typeof showToast !== 'undefined') {
            showToast('Network error. Please check your connection.', 'error', 5000);
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': 'Network error',
                'fatal': false
            });
        }
    }
    
    // File processing error handler
    function handleFileError(error, fileName) {
        let message = 'Failed to process file.';
        
        if (error.name === 'FileTooLargeError') {
            message = 'File is too large. Please choose a smaller file.';
        } else if (error.name === 'InvalidFileTypeError') {
            message = 'Invalid file type. Please choose a supported file format.';
        } else if (error.name === 'FileReadError') {
            message = 'Failed to read file. Please try again.';
        }
        
        if (typeof showToast !== 'undefined') {
            showToast(message, 'error', 5000);
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'file_error', {
                'event_category': 'Error',
                'event_label': error.name,
                'value': 1
            });
        }
    }
    
    // Export error handlers
    window.handleNetworkError = handleNetworkError;
    window.handleFileError = handleFileError;
    
    // Retry mechanism for failed operations
    function retryOperation(operation, maxRetries = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            function attempt() {
                attempts++;
                operation()
                    .then(resolve)
                    .catch(error => {
                        if (attempts < maxRetries) {
                            setTimeout(attempt, delay * attempts);
                        } else {
                            reject(error);
                        }
                    });
            }
            
            attempt();
        });
    }
    
    window.retryOperation = retryOperation;
})();

