// Social Sharing Functions
function shareOnTwitter(text, url) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
}

function shareOnFacebook(url) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
}

function shareOnLinkedIn(url, title) {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
}

function shareOnReddit(url, title) {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(redditUrl, '_blank', 'width=550,height=420');
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link copied to clipboard!');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
    }
}

// Create social sharing buttons
function createSocialSharingButtons(pageTitle, pageUrl) {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-sharing';
    shareContainer.style.cssText = 'margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border-radius: 12px; text-align: center; border: 1px solid var(--border-color);';
    
    shareContainer.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.1rem;">Share this page</h3>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="shareOnTwitter('${pageTitle}', '${pageUrl}')" style="padding: 0.75rem 1.5rem; background: #1DA1F2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🐦 Twitter</button>
            <button onclick="shareOnFacebook('${pageUrl}')" style="padding: 0.75rem 1.5rem; background: #1877F2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📘 Facebook</button>
            <button onclick="shareOnLinkedIn('${pageUrl}', '${pageTitle}')" style="padding: 0.75rem 1.5rem; background: #0077B5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">💼 LinkedIn</button>
            <button onclick="shareOnReddit('${pageUrl}', '${pageTitle}')" style="padding: 0.75rem 1.5rem; background: #FF4500; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🔴 Reddit</button>
            <button onclick="copyToClipboard('${pageUrl}')" style="padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📋 Copy Link</button>
        </div>
    `;
    
    return shareContainer;
}

// Auto-add social sharing to pages
document.addEventListener('DOMContentLoaded', function() {
    const pageTitle = document.title || 'OmniToolset';
    const pageUrl = window.location.href;
    
    // Find a good place to insert social sharing (before footer or after main content)
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    
    if (main && !document.querySelector('.social-sharing')) {
        const shareButtons = createSocialSharingButtons(pageTitle, pageUrl);
        if (footer) {
            footer.parentNode.insertBefore(shareButtons, footer);
        } else if (main) {
            main.appendChild(shareButtons);
        }
    }
});

