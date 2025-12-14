// PWA Installer and Service Worker Registration
(function() {
    'use strict';
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                if (confirm('New version available! Reload to update?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
    
    // PWA Install Prompt
    let deferredPrompt;
    const installButton = document.createElement('button');
    installButton.textContent = '📱 Install App';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        z-index: 1000;
        display: none;
        transition: all 0.3s ease;
    `;
    
    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'scale(1.05)';
        installButton.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
    });
    
    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'scale(1)';
        installButton.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
    });
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('User choice:', outcome);
            deferredPrompt = null;
            installButton.style.display = 'none';
        }
    });
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.style.display = 'block';
        document.body.appendChild(installButton);
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed');
        installButton.style.display = 'none';
        deferredPrompt = null;
    });
})();



