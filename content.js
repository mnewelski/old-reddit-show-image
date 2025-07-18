// Old Reddit Show Image Chrome Extension
// Replaces <image> links with actual images and adds toggle replies button

(function() {
    'use strict';
    
    // Inject CSS styles
    const cssStyles = `
        .toggle-replies-btn {
            background-color: #0079d3;
            color: white;
            border: none;
            padding: 4px 8px;
            margin-left: 10px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            transition: background-color 0.2s ease;
        }
        
        .toggle-replies-btn:hover {
            background-color: #0060a8;
            text-decoration: none;
        }
        
        .toggle-replies-btn:active {
            background-color: #004d85;
        }
        
        .toggle-replies-btn + img {
            max-width: 500px !important;
            height: auto !important;
            display: block !important;
        }
        
        a img {
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        a img:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    `;
    
    // Add CSS to page
    const styleSheet = document.createElement('style');
    styleSheet.textContent = cssStyles;
    document.head.appendChild(styleSheet);
    
    let repliesVisible = true;
    
    // Function to replace <image> links with actual images
    function replaceImageLinks() {
        const imageLinks = document.querySelectorAll('a[href*="redd.it"], a[href*="imgur.com"], a[href*="i.redd.it"]');
        
        imageLinks.forEach(link => {
            // Check if the link text is "<image>" and hasn't been processed yet
            if (link.textContent.trim() === '<image>' && !link.querySelector('img')) {
                const href = link.getAttribute('href');
                
                // Create img element
                const img = document.createElement('img');
                img.src = href;
                img.style.maxWidth = '500px';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.marginTop = '10px';
                
                // Add error handling
                img.onerror = function() {
                    this.style.display = 'none';
                    link.textContent = '<image>';
                };
                
                // Replace the link text with the image
                link.innerHTML = '';
                link.appendChild(img);
                
                // Prevent the link from opening when clicking the image
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                });
            }
        });
    }
    
    // Function to toggle replies visibility
    function toggleReplies() {
        const childDivs = document.querySelectorAll('.child');
        
        childDivs.forEach(child => {
            if (repliesVisible) {
                child.style.display = 'none';
            } else {
                child.style.display = '';
            }
        });
        
        repliesVisible = !repliesVisible;
        
        // Update button text
        const toggleButton = document.querySelector('#toggle-replies-btn');
        if (toggleButton) {
            toggleButton.textContent = repliesVisible ? 'Hide Replies' : 'Show Replies';
        }
    }
    
    // Function to add toggle replies button
    function addToggleButton() {
        const panestackTitle = document.querySelector('.panestack-title');
        
        if (panestackTitle && !document.querySelector('#toggle-replies-btn')) {
            const toggleButton = document.createElement('button');
            toggleButton.id = 'toggle-replies-btn';
            toggleButton.textContent = 'Hide Replies';
            toggleButton.className = 'title-button toggle-replies-btn';
            
            toggleButton.addEventListener('click', toggleReplies);
            
            panestackTitle.appendChild(toggleButton);
        }
    }
    
    // Function to observe DOM changes for dynamically loaded content
    function observeChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if new nodes contain image links or comments
                    const hasImageLinks = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === Node.ELEMENT_NODE && 
                        (node.querySelector && node.querySelector('a[href*="redd.it"], a[href*="imgur.com"], a[href*="i.redd.it"]'))
                    );
                    
                    const hasComments = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === Node.ELEMENT_NODE && 
                        (node.classList && node.classList.contains('child'))
                    );
                    
                    if (hasImageLinks) {
                        setTimeout(replaceImageLinks, 100);
                    }
                    
                    if (hasComments) {
                        // Apply current visibility state to new comments
                        const newChildDivs = Array.from(mutation.addedNodes).filter(node => 
                            node.nodeType === Node.ELEMENT_NODE && 
                            node.classList && node.classList.contains('child')
                        );
                        
                        newChildDivs.forEach(child => {
                            if (!repliesVisible) {
                                child.style.display = 'none';
                            }
                        });
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Initialize the extension
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(init, 500);
            });
            return;
        }
        
        // Replace existing image links
        replaceImageLinks();
        
        // Add toggle button
        addToggleButton();
        
        // Start observing for dynamic content
        observeChanges();
        
        // Periodically check for new content (fallback)
        setInterval(function() {
            replaceImageLinks();
            if (!document.querySelector('#toggle-replies-btn')) {
                addToggleButton();
            }
        }, 2000);
    }
    
    // Start the extension
    init();
})();