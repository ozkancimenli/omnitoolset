// Security Enhancements
(function() {
    'use strict';
    
    // Content Security Policy helper
    function validateContentSecurity() {
        // Check for inline scripts (should be minimized)
        const inlineScripts = document.querySelectorAll('script:not([src])');
        if (inlineScripts.length > 10 && window.location.hostname !== 'localhost') {
            console.warn('Many inline scripts detected. Consider externalizing them.');
        }
    }
    
    // XSS Protection - Sanitize user input
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    // Validate file types
    function validateFileType(file, allowedTypes) {
        const fileType = file.type || '';
        const fileName = file.name || '';
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        
        const allowedExtensions = allowedTypes.map(type => {
            if (type.includes('/')) {
                return type.split('/')[1];
            }
            return type;
        });
        
        return allowedTypes.includes(fileType) || 
               allowedExtensions.includes(extension) ||
               fileType.startsWith('application/');
    }
    
    // File size validation
    function validateFileSize(file, maxSizeMB = 100) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }
    
    // Secure file handling
    function handleFileSecurely(file, callback) {
        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'application/json',
            'text/html',
            'text/css',
            'application/javascript'
        ];
        
        if (!validateFileType(file, allowedTypes)) {
            if (typeof showToast !== 'undefined') {
                showToast('Invalid file type. Please choose a supported file.', 'error');
            }
            return;
        }
        
        // Validate file size
        if (!validateFileSize(file, 100)) {
            if (typeof showToast !== 'undefined') {
                showToast('File is too large. Maximum size is 100MB.', 'error');
            }
            return;
        }
        
        // Process file
        if (callback) {
            callback(file);
        }
    }
    
    // Protect against clickjacking
    function preventClickjacking() {
        // Check if site is in iframe
        if (window.self !== window.top) {
            // Allow iframe embedding from same origin or trusted domains
            const allowedOrigins = [
                window.location.origin,
                'https://www.omnitoolset.com',
                'https://omnitoolset.com'
            ];
            
            const parentOrigin = window.parent.location.origin;
            if (!allowedOrigins.includes(parentOrigin)) {
                window.top.location = window.self.location;
            }
        }
    }
    
    // Rate limiting helper (client-side)
    function createRateLimiter(maxRequests, windowMs) {
        const requests = [];
        
        return function() {
            const now = Date.now();
            
            // Remove old requests
            while (requests.length > 0 && requests[0] < now - windowMs) {
                requests.shift();
            }
            
            if (requests.length >= maxRequests) {
                return false; // Rate limit exceeded
            }
            
            requests.push(now);
            return true; // Request allowed
        };
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        validateContentSecurity();
        preventClickjacking();
    });
    
    // Export functions
    window.sanitizeInput = sanitizeInput;
    window.validateFileType = validateFileType;
    window.validateFileSize = validateFileSize;
    window.handleFileSecurely = handleFileSecurely;
    window.createRateLimiter = createRateLimiter;
})();

