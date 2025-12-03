// Newsletter & Email Collection Enhancements
(function() {
    'use strict';
    
    // Newsletter form handler
    function initNewsletterForm() {
        const forms = document.querySelectorAll('#newsletterForm, .newsletter-form, form[data-newsletter]');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput?.value.trim();
                
                if (!email || !isValidEmail(email)) {
                    if (typeof showToast !== 'undefined') {
                        showToast('Please enter a valid email address.', 'error');
                    }
                    return;
                }
                
                // Show loading state
                const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                const originalText = submitButton?.textContent || 'Subscribe';
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Subscribing...';
                }
                
                try {
                    // In production, this would send to your backend/email service
                    // For now, we'll store in localStorage and track analytics
                    
                    // Store subscription
                    const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
                    if (!subscriptions.includes(email)) {
                        subscriptions.push({
                            email: email,
                            date: new Date().toISOString(),
                            source: window.location.pathname
                        });
                        localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
                    }
                    
                    // Track analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'newsletter_signup', {
                            'event_category': 'Engagement',
                            'event_label': 'Newsletter Subscription',
                            'value': 1
                        });
                    }
                    
                    // Success message
                    if (typeof showToast !== 'undefined') {
                        showToast('Successfully subscribed! Check your email.', 'success');
                    }
                    
                    // Reset form
                    form.reset();
                    
                    // Show thank you message
                    const thankYou = document.createElement('div');
                    thankYou.className = 'newsletter-thank-you';
                    thankYou.style.cssText = `
                        padding: 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        border-radius: 8px;
                        color: #10b981;
                        text-align: center;
                        margin-top: 1rem;
                    `;
                    thankYou.textContent = '✓ Thank you for subscribing!';
                    form.appendChild(thankYou);
                    
                    setTimeout(() => {
                        thankYou.remove();
                    }, 5000);
                    
                } catch (error) {
                    if (typeof showToast !== 'undefined') {
                        showToast('Subscription failed. Please try again.', 'error');
                    }
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }
                }
            });
        });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Exit intent newsletter popup (optional, can be enabled)
    function initExitIntentPopup() {
        let exitIntentShown = false;
        const shownKey = 'exit_intent_newsletter_shown';
        const shownDate = localStorage.getItem(shownKey);
        
        // Don't show if already shown today
        if (shownDate && new Date(shownDate).toDateString() === new Date().toDateString()) {
            return;
        }
        
        document.addEventListener('mouseout', (e) => {
            if (!exitIntentShown && e.clientY < 0) {
                exitIntentShown = true;
                localStorage.setItem(shownKey, new Date().toISOString());
                
                // Show newsletter popup (you can customize this)
                showNewsletterPopup();
            }
        });
    }
    
    function showNewsletterPopup() {
        const popup = document.createElement('div');
        popup.className = 'newsletter-popup';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s;
        `;
        
        popup.innerHTML = `
            <div style="
                background: var(--bg-card);
                padding: 2rem;
                border-radius: 20px;
                max-width: 400px;
                width: 90%;
                position: relative;
                animation: slideUp 0.3s;
            ">
                <button onclick="this.closest('.newsletter-popup').remove()" 
                        style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">
                    ×
                </button>
                <h3 style="margin-top: 0; margin-bottom: 1rem;">📧 Stay Updated!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Get weekly updates on new tools and productivity tips.
                </p>
                <form id="popupNewsletterForm" class="newsletter-form">
                    <input type="email" placeholder="Enter your email" required 
                           style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem; background: var(--bg); color: var(--text-primary);">
                    <button type="submit" 
                            style="width: 100%; padding: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Subscribe
                    </button>
                </form>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Initialize form
        setTimeout(() => {
            initNewsletterForm();
        }, 100);
        
        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        initNewsletterForm();
        // Uncomment to enable exit intent popup
        // initExitIntentPopup();
    });
})();

