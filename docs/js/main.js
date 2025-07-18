// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Tab functionality
    function initTabs() {
        const tabGroups = document.querySelectorAll('.tabs');
        
        tabGroups.forEach(tabGroup => {
            const tabs = tabGroup.querySelectorAll('.tab');
            const tabContent = tabGroup.closest('.comparison-tabs, .installation-tabs, .comparison-left').querySelector('.tab-content');
            const tabPanes = tabContent.querySelectorAll('.tab-pane');
            
            // Check if this is a comparison tab group (for description switching)
            const comparisonContainer = tabGroup.closest('.comparison-layout');
            const descriptions = comparisonContainer ? comparisonContainer.querySelectorAll('.description-content') : null;
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-tab');
                    
                    // Remove active class from all tabs and panes
                    tabs.forEach(t => t.classList.remove('tab--active'));
                    tabPanes.forEach(pane => pane.classList.remove('tab-pane--active'));
                    
                    // Add active class to clicked tab and corresponding pane
                    tab.classList.add('tab--active');
                    const targetPane = tabContent.querySelector(`#${targetId}`);
                    if (targetPane) {
                        targetPane.classList.add('tab-pane--active');
                    }
                    
                    // Handle description switching for comparison layout
                    if (descriptions) {
                        descriptions.forEach(desc => desc.classList.remove('description-content--active'));
                        const targetDescription = comparisonContainer.querySelector(`.description-content[data-format="${targetId}"]`);
                        if (targetDescription) {
                            targetDescription.classList.add('description-content--active');
                        }
                    }
                });
            });
        });
    }
    
    // Copy to clipboard functionality
    function initCopyButtons() {
        const copyButtons = document.querySelectorAll('.code-block__copy');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const codeBlock = button.closest('.code-block');
                const code = codeBlock.querySelector('.code-block__content code, .code-block__content').textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    
                    // Visual feedback
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.style.color = 'var(--color-success)';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = code;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                }
            });
        });
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#') return;
                
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Navigation scroll effect
    function initNavScrollEffect() {
        const nav = document.querySelector('.nav');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                nav.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                nav.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
            } else {
                nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                nav.style.boxShadow = 'none';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    // Intersection Observer for animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate on scroll
        const animatedElements = document.querySelectorAll('.feature-card, .doc-card, .section-header');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Code syntax highlighting simulation
    function initCodeHighlighting() {
        const codeBlocks = document.querySelectorAll('code');
        
        codeBlocks.forEach(block => {
            // Skip if already processed
            if (block.dataset.highlighted === 'true') return;
            
            let html = block.innerHTML;

            // Skip if already highlighted (more comprehensive check)
            if (html.includes('<span') || html.includes('style=') || html.includes('color:')) {
                block.dataset.highlighted = 'true';
                return;
            }

            // Convert HTML entities to actual characters for processing
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const decodedHtml = tempDiv.textContent || tempDiv.innerText || '';

            // JavaScript detection - has require, const, var, console, or Mark, but NOT if it's inside HTML script tags
            const hasScriptTags = decodedHtml.includes('<script') && decodedHtml.includes('</script');
            const isJavaScript = !hasScriptTags && (decodedHtml.includes('require(') || decodedHtml.includes('const ') || decodedHtml.includes('var ') || decodedHtml.includes('console.') || decodedHtml.includes('Mark(') || decodedHtml.includes('Mark.parse'));

            // JSON detection - has "type": pattern
            const isJson = decodedHtml.includes('"type":') && decodedHtml.includes('{') && !isJavaScript && !hasScriptTags;

            // Mark detection - has < but uses : for attributes (not =)
            const isMark = decodedHtml.includes('<') && !decodedHtml.includes('=') && !decodedHtml.includes('"type":') && decodedHtml.includes(':') && !isJavaScript && !hasScriptTags;

            // HTML/XML detection - has < and > with = signs for attributes OR has script tags
            const isHtmlXml = (decodedHtml.includes('<') && decodedHtml.includes('>') && (decodedHtml.includes('=') || hasScriptTags)) && !isMark && !isJson && !isJavaScript;

            let highlightedHtml;
            if (isJavaScript) {
                highlightedHtml = highlightJavaScript(decodedHtml);
            } else if (isMark) {
                highlightedHtml = highlightMarkNotation(decodedHtml);
            } else if (isHtmlXml) {
                highlightedHtml = highlightHtmlXml(decodedHtml);
            } else if (isJson) {
                highlightedHtml = highlightJson(decodedHtml);
            } else {
                // Generic highlighting for other code
                highlightedHtml = decodedHtml.replace(/(\w+):/g, '<span style="color: #34d399;">$1</span><span style="color: #f59e0b;">:</span>');
                highlightedHtml = highlightedHtml.replace(/"([^"]*)"/g, '<span style="color: #fbbf24;">"$1"</span>');
                highlightedHtml = highlightedHtml.replace(/'([^']*)'/g, '<span style="color: #fbbf24;">\'$1\'</span>');
            }

            block.innerHTML = highlightedHtml;
            block.dataset.highlighted = 'true';
        });
    }
    
    // Utility function to convert HTML entities back to display characters
    function decodeHtmlEntities(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    }
    
    // Utility function to escape HTML characters
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // JavaScript syntax highlighting using a simple parser
    function highlightJavaScript(html) {
        const tokens = [];
        let i = 0;
        
        while (i < html.length) {
            // Handle single-line comments
            if (html.substr(i, 2) === '//') {
                const start = i;
                while (i < html.length && html[i] !== '\n') {
                    i++;
                }
                tokens.push({ type: 'comment', value: html.substring(start, i) });
                continue;
            }
            
            // Handle template literals
            if (html[i] === '`') {
                const start = i;
                i++; // skip opening backtick
                while (i < html.length && html[i] !== '`') {
                    if (html[i] === '\\') i++; // skip escaped character
                    i++;
                }
                if (i < html.length) i++; // skip closing backtick
                
                // Special handling for Mark notation inside template literals
                const templateContent = html.substring(start, i);
                if (templateContent.includes('<') && templateContent.includes('>')) {
                    // Parse the template literal content for Mark notation
                    const beforeBacktick = html.substring(start, start + 1);
                    const afterBacktick = html.substring(i - 1, i);
                    const innerContent = html.substring(start + 1, i - 1);
                    
                    tokens.push({ type: 'template_start', value: '`' });
                    
                    // Highlight Mark notation inside the template
                    const markTokens = highlightMarkNotationInTemplate(innerContent);
                    tokens.push(...markTokens);
                    
                    tokens.push({ type: 'template_end', value: '`' });
                } else {
                    tokens.push({ type: 'template', value: templateContent });
                }
                continue;
            }
            
            // Handle quoted strings
            if (html[i] === '"' || html[i] === "'") {
                const quote = html[i];
                const start = i;
                i++; // skip opening quote
                while (i < html.length && html[i] !== quote) {
                    if (html[i] === '\\') i++; // skip escaped character
                    i++;
                }
                if (i < html.length) i++; // skip closing quote
                tokens.push({ type: 'string', value: html.substring(start, i) });
                continue;
            }
            
            // Handle keywords and identifiers
            if (/[a-zA-Z_$]/.test(html[i])) {
                const start = i;
                while (i < html.length && /[a-zA-Z0-9_$]/.test(html[i])) {
                    i++;
                }
                const word = html.substring(start, i);
                
                // Check if it's a keyword
                if (['const', 'var', 'let', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined'].includes(word)) {
                    tokens.push({ type: 'keyword', value: word });
                } else if (['require', 'console', 'Mark'].includes(word)) {
                    tokens.push({ type: 'builtin', value: word });
                } else {
                    tokens.push({ type: 'identifier', value: word });
                }
                continue;
            }
            
            // Handle operators and punctuation
            if ('(){}[];,.=+-*/<>!&|'.includes(html[i])) {
                tokens.push({ type: 'operator', value: html[i] });
                i++;
                continue;
            }
            
            // Handle numbers
            if (/[0-9]/.test(html[i])) {
                const start = i;
                while (i < html.length && /[0-9.]/.test(html[i])) {
                    i++;
                }
                tokens.push({ type: 'number', value: html.substring(start, i) });
                continue;
            }
            
            // Handle whitespace
            if (/\s/.test(html[i])) {
                const start = i;
                while (i < html.length && /\s/.test(html[i])) {
                    i++;
                }
                tokens.push({ type: 'whitespace', value: html.substring(start, i) });
                continue;
            }
            
            // Everything else
            tokens.push({ type: 'text', value: html[i] });
            i++;
        }
        
        // Convert tokens to highlighted HTML
        return tokens.map(token => {
            switch (token.type) {
                case 'comment':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'keyword':
                    return `<span style="color: #8b5cf6;">${token.value}</span>`;
                case 'builtin':
                    return `<span style="color: #10b981;">${token.value}</span>`;
                case 'string':
                case 'template':
                    return `<span style="color: #fbbf24;">${token.value}</span>`;
                case 'template_start':
                case 'template_end':
                    return `<span style="color: #fbbf24;">${token.value}</span>`;
                case 'number':
                    return `<span style="color: #fb7185;">${token.value}</span>`;
                case 'operator':
                    return `<span style="color: #f59e0b;">${token.value}</span>`;
                case 'mark_tag_open':
                case 'mark_tag_close':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'mark_tag_name':
                    return `<span style="color: #60a5fa;">${token.value}</span>`;
                case 'mark_string':
                    return `<span style="color: #d1fae5;">${token.value}</span>`;
                default:
                    return token.value;
            }
        }).join('');
    }
    
    // Helper function to highlight Mark notation inside template literals
    function highlightMarkNotationInTemplate(content) {
        const tokens = [];
        let i = 0;
        
        while (i < content.length) {
            // Handle Mark opening tags (<tagname)
            if (content.substr(i, 1) === '<') {
                const start = i;
                i += 1; // skip <
                const tagStart = i;
                while (i < content.length && /[a-zA-Z0-9_-]/.test(content[i])) {
                    i++;
                }
                if (i > tagStart) {
                    tokens.push({ type: 'mark_tag_open', value: '&lt;' });
                    tokens.push({ type: 'mark_tag_name', value: escapeHtml(content.substring(tagStart, i)) });
                } else {
                    tokens.push({ type: 'text', value: escapeHtml(content.substring(start, i)) });
                }
                continue;
            }
            
            // Handle Mark closing tags (>)
            if (content.substr(i, 1) === '>') {
                tokens.push({ type: 'mark_tag_close', value: '&gt;' });
                i += 1;
                continue;
            }
            
            // Handle quoted strings in Mark
            if (content[i] === '"') {
                const start = i;
                i++; // skip opening quote
                while (i < content.length && content[i] !== '"') {
                    i++;
                }
                if (i < content.length) i++; // skip closing quote
                tokens.push({ type: 'mark_string', value: escapeHtml(content.substring(start, i)) });
                continue;
            }
            
            // Everything else as text
            tokens.push({ type: 'text', value: escapeHtml(content[i]) });
            i++;
        }
        
        return tokens;
    }

    // JSON syntax highlighting using a simple parser
    function highlightJson(html) {
        const tokens = [];
        let i = 0;
        
        while (i < html.length) {
            // Handle quoted strings
            if (html[i] === '"') {
                const start = i;
                i++; // skip opening quote
                while (i < html.length && html[i] !== '"') {
                    if (html[i] === '\\') i++; // skip escaped character
                    i++;
                }
                if (i < html.length) i++; // skip closing quote
                
                // Check if this is a property name (followed by colon)
                let j = i;
                while (j < html.length && /\s/.test(html[j])) j++; // skip whitespace
                
                if (j < html.length && html[j] === ':') {
                    tokens.push({ type: 'property', value: html.substring(start, i) });
                } else {
                    tokens.push({ type: 'string', value: html.substring(start, i) });
                }
                continue;
            }
            
            // Handle colons
            if (html[i] === ':') {
                tokens.push({ type: 'colon', value: ':' });
                i++;
                continue;
            }
            
            // Handle braces
            if (html[i] === '{' || html[i] === '}') {
                tokens.push({ type: 'brace', value: html[i] });
                i++;
                continue;
            }
            
            // Handle brackets
            if (html[i] === '[' || html[i] === ']') {
                tokens.push({ type: 'bracket', value: html[i] });
                i++;
                continue;
            }
            
            // Handle commas
            if (html[i] === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }
            
            // Handle numbers
            if (/[0-9-]/.test(html[i])) {
                const start = i;
                if (html[i] === '-') i++;
                while (i < html.length && /[0-9.]/.test(html[i])) {
                    i++;
                }
                tokens.push({ type: 'number', value: html.substring(start, i) });
                continue;
            }
            
            // Handle keywords (true, false, null)
            if (/[a-z]/.test(html[i])) {
                const start = i;
                while (i < html.length && /[a-z]/.test(html[i])) {
                    i++;
                }
                const word = html.substring(start, i);
                if (['true', 'false', 'null'].includes(word)) {
                    tokens.push({ type: 'keyword', value: word });
                } else {
                    tokens.push({ type: 'text', value: word });
                }
                continue;
            }
            
            // Everything else as text
            tokens.push({ type: 'text', value: html[i] });
            i++;
        }
        
        // Convert tokens to highlighted HTML
        return tokens.map(token => {
            switch (token.type) {
                case 'property':
                    return `<span style="color: #34d399;">${token.value}</span>`;
                case 'string':
                    return `<span style="color: #fbbf24;">${token.value}</span>`;
                case 'colon':
                case 'comma':
                    return `<span style="color: #f59e0b;">${token.value}</span>`;
                case 'brace':
                    return `<span style="color: #60a5fa;">${token.value}</span>`;
                case 'bracket':
                    return `<span style="color: #a78bfa;">${token.value}</span>`;
                case 'number':
                case 'keyword':
                    return `<span style="color: #fb7185;">${token.value}</span>`;
                default:
                    return token.value;
            }
        }).join('');
    }

    // HTML/XML syntax highlighting using a simple parser
    function highlightHtmlXml(html) {
        const tokens = [];
        let i = 0;
        
        while (i < html.length) {
            // Handle comments (<!--...-->)
            if (html.substr(i, 4) === '<!--') {
                const start = i;
                const commentStart = i;
                i += 4; // skip <!--
                while (i < html.length && html.substr(i, 3) !== '-->') {
                    i++;
                }
                if (i < html.length) i += 3; // skip -->
                
                // Instead of escaping the whole thing, break it down into parts
                tokens.push({ type: 'comment_start', value: '&lt;!--' });
                const innerComment = html.substring(commentStart + 4, i - 3);
                if (innerComment) {
                    tokens.push({ type: 'comment_content', value: escapeHtml(innerComment) });
                }
                tokens.push({ type: 'comment_end', value: '--&gt;' });
                continue;
            }
            
            // Handle script tags specially
            if (html.substr(i, 7) === '<script') {
                // Find the closing > of the opening script tag
                const openTagEnd = html.indexOf('>', i);
                if (openTagEnd !== -1) {
                    // Parse the opening script tag
                    const openTag = html.substring(i, openTagEnd + 1);
                    const scriptTokens = parseScriptTag(openTag);
                    tokens.push(...scriptTokens);
                    i = openTagEnd + 1;
                    
                    // Find the closing script tag
                    const closeTagStart = html.indexOf('</script>', i);
                    if (closeTagStart !== -1) {
                        // Handle content between script tags as JavaScript
                        const scriptContent = html.substring(i, closeTagStart);
                        if (scriptContent.trim()) {
                            tokens.push({ type: 'script_content', value: scriptContent });
                        }
                        i = closeTagStart;
                        
                        // Parse the closing script tag
                        tokens.push({ type: 'tag_open', value: '&lt;/' });
                        tokens.push({ type: 'tag_name', value: 'script' });
                        tokens.push({ type: 'tag_close', value: '&gt;' });
                        i += 9; // length of </script>
                        continue;
                    }
                }
            }
            
            // Handle self-closing tags (<tag.../>)
            if (html.substr(i, 1) === '<') {
                const slashPos = html.indexOf('/>', i);
                const normalClosePos = html.indexOf('>', i);
                
                // Check if this is a self-closing tag
                if (slashPos !== -1 && (normalClosePos === -1 || slashPos < normalClosePos)) {
                    const tagContent = html.substring(i + 1, slashPos); // skip < and get content before />
                    
                    tokens.push({ type: 'tag_open', value: '&lt;' });
                    
                    // Parse tag name
                    let spacePos = tagContent.search(/\s/);
                    if (spacePos === -1) spacePos = tagContent.length;
                    const tagName = tagContent.substring(0, spacePos);
                    tokens.push({ type: 'tag_name', value: escapeHtml(tagName) });
                    
                    // Parse attributes
                    if (spacePos < tagContent.length) {
                        const attrString = tagContent.substring(spacePos);
                        tokens.push(...parseHtmlAttributes(attrString));
                    }
                    
                    tokens.push({ type: 'tag_close', value: '/&gt;' });
                    i = slashPos + 2;
                    continue;
                }
            }
            
            // Handle closing tags (</tag>)
            if (html.substr(i, 2) === '</') {
                const closePos = html.indexOf('>', i);
                if (closePos !== -1) {
                    const tagName = html.substring(i + 2, closePos);
                    tokens.push({ type: 'tag_open', value: '&lt;/' });
                    tokens.push({ type: 'tag_name', value: escapeHtml(tagName) });
                    tokens.push({ type: 'tag_close', value: '&gt;' });
                    i = closePos + 1;
                    continue;
                }
            }
            
            // Handle opening tags (<tag>)
            if (html.substr(i, 1) === '<') {
                const closePos = html.indexOf('>', i);
                if (closePos !== -1) {
                    const tagContent = html.substring(i + 1, closePos); // skip < and get content before >
                    
                    tokens.push({ type: 'tag_open', value: '&lt;' });
                    
                    // Parse tag name
                    let spacePos = tagContent.search(/\s/);
                    if (spacePos === -1) spacePos = tagContent.length;
                    const tagName = tagContent.substring(0, spacePos);
                    tokens.push({ type: 'tag_name', value: escapeHtml(tagName) });
                    
                    // Parse attributes
                    if (spacePos < tagContent.length) {
                        const attrString = tagContent.substring(spacePos);
                        tokens.push(...parseHtmlAttributes(attrString));
                    }
                    
                    tokens.push({ type: 'tag_close', value: '&gt;' });
                    i = closePos + 1;
                    continue;
                }
            }
            
            // Handle regular text content between tags
            const start = i;
            while (i < html.length && html.substr(i, 1) !== '<') {
                i++;
            }
            if (i > start) {
                const content = html.substring(start, i);
                // Only add non-whitespace content as text tokens
                if (content.trim().length > 0) {
                    tokens.push({ type: 'content', value: escapeHtml(content) });
                } else {
                    tokens.push({ type: 'whitespace', value: escapeHtml(content) });
                }
            }
        }
        
        // Convert tokens to highlighted HTML
        return tokens.map(token => {
            switch (token.type) {
                case 'comment':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'comment_start':
                case 'comment_end':
                case 'comment_content':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'tag_open':
                case 'tag_close':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'tag_name':
                    return `<span style="color: #60a5fa;">${token.value}</span>`;
                case 'attribute':
                    return `<span style="color: #34d399;">${token.value}</span>`;
                case 'equals':
                    return `<span style="color: #f59e0b;">${token.value}</span>`;
                case 'string':
                    return `<span style="color: #fbbf24;">${token.value}</span>`;
                case 'script_content':
                    return highlightJavaScript(token.value); // Highlight JavaScript inside script tags
                case 'content':
                    return token.value; // Regular text content - no coloring
                case 'whitespace':
                    return token.value; // Whitespace - no coloring
                default:
                    return token.value;
            }
        }).join('');
    }
    
    // Helper function to parse script tags
    function parseScriptTag(tagHtml) {
        const tokens = [];
        let i = 0;
        
        // Start with <
        tokens.push({ type: 'tag_open', value: '&lt;' });
        i += 1;
        
        // Parse tag name "script"
        const tagStart = i;
        while (i < tagHtml.length && /[a-zA-Z0-9_-]/.test(tagHtml[i])) {
            i++;
        }
        tokens.push({ type: 'tag_name', value: escapeHtml(tagHtml.substring(tagStart, i)) });
        
        // Parse any attributes
        const attrStart = i;
        const closePos = tagHtml.indexOf('>');
        if (closePos !== -1 && closePos > i) {
            const attrString = tagHtml.substring(attrStart, closePos);
            if (attrString.trim()) {
                tokens.push(...parseHtmlAttributes(attrString));
            }
        }
        
        // End with >
        tokens.push({ type: 'tag_close', value: '&gt;' });
        
        return tokens;
    }
    
    // Helper function to parse HTML attributes
    function parseHtmlAttributes(attrString) {
        const tokens = [];
        let i = 0;
        
        while (i < attrString.length) {
            // Skip whitespace
            if (/\s/.test(attrString[i])) {
                tokens.push({ type: 'text', value: attrString[i] });
                i++;
                continue;
            }
            
            // Parse attribute name
            if (/[a-zA-Z]/.test(attrString[i])) {
                const start = i;
                while (i < attrString.length && /[a-zA-Z0-9_-]/.test(attrString[i])) {
                    i++;
                }
                tokens.push({ type: 'attribute', value: escapeHtml(attrString.substring(start, i)) });
                continue;
            }
            
            // Parse equals sign
            if (attrString[i] === '=') {
                tokens.push({ type: 'equals', value: '=' });
                i++;
                continue;
            }
            
            // Parse quoted strings
            if (attrString[i] === '"' || attrString[i] === "'") {
                const quote = attrString[i];
                const start = i;
                i++; // skip opening quote
                while (i < attrString.length && attrString[i] !== quote) {
                    i++;
                }
                if (i < attrString.length) i++; // skip closing quote
                tokens.push({ type: 'string', value: escapeHtml(attrString.substring(start, i)) });
                continue;
            }
            
            // Everything else
            tokens.push({ type: 'text', value: escapeHtml(attrString[i]) });
            i++;
        }
        
        return tokens;
    }
    
    // Mark notation syntax highlighting using a simple parser
    function highlightMarkNotation(html) {
        const tokens = [];
        let i = 0;
        
        // Tokenize the input
        while (i < html.length) {
            // Handle comments (// style)
            if (html.substr(i, 2) === '//' || (i > 0 && html[i-1] === ' ' && html.substr(i, 2) === '//')) {
                const start = i;
                while (i < html.length && html[i] !== '\n') {
                    i++;
                }
                tokens.push({ type: 'comment', value: escapeHtml(html.substring(start, i)) });
                continue;
            }
            
            // Handle Mark comments (<'!--'...>)
            if (html.substr(i, 1) === '<' && html.substr(i + 1, 5) === "'!--'") {
                const start = i;
                i += 1; // skip <
                while (i < html.length && html.substr(i, 1) !== '>') {
                    i++;
                }
                if (i < html.length) i += 1; // skip >
                tokens.push({ type: 'comment', value: escapeHtml(html.substring(start, i)) });
                continue;
            }
            
            // Handle opening tags (<tagname)
            if (html.substr(i, 1) === '<') {
                const start = i;
                i += 1; // skip <
                const tagStart = i;
                while (i < html.length && /[a-zA-Z0-9_-]/.test(html[i])) {
                    i++;
                }
                if (i > tagStart) {
                    tokens.push({ type: 'tag_open', value: '&lt;' });
                    tokens.push({ type: 'tag_name', value: escapeHtml(html.substring(tagStart, i)) });
                } else {
                    tokens.push({ type: 'text', value: escapeHtml(html.substring(start, i)) });
                }
                continue;
            }
            
            // Handle closing tags (>)
            if (html.substr(i, 1) === '>') {
                tokens.push({ type: 'tag_close', value: '&gt;' });
                i += 1;
                continue;
            }
            
            // Handle quoted strings
            if (html[i] === '"') {
                const start = i;
                i++; // skip opening quote
                while (i < html.length && html[i] !== '"') {
                    i++;
                }
                if (i < html.length) i++; // skip closing quote
                tokens.push({ type: 'string', value: escapeHtml(html.substring(start, i)) });
                continue;
            }
            
            if (html[i] === "'") {
                const start = i;
                i++; // skip opening quote
                while (i < html.length && html[i] !== "'") {
                    i++;
                }
                if (i < html.length) i++; // skip closing quote
                tokens.push({ type: 'string', value: escapeHtml(html.substring(start, i)) });
                continue;
            }
            
            // Handle attributes (word followed by colon)
            if (/[a-zA-Z]/.test(html[i])) {
                const start = i;
                while (i < html.length && /[a-zA-Z0-9_-]/.test(html[i])) {
                    i++;
                }
                
                // Look ahead for colon
                let j = i;
                while (j < html.length && /\s/.test(html[j])) j++; // skip whitespace
                
                if (j < html.length && html[j] === ':') {
                    tokens.push({ type: 'attribute', value: escapeHtml(html.substring(start, i)) });
                    // Skip whitespace
                    while (i < html.length && /\s/.test(html[i])) {
                        i++;
                    }
                    // Add the colon
                    if (i < html.length && html[i] === ':') {
                        tokens.push({ type: 'colon', value: ':' });
                        i++;
                    }
                } else {
                    tokens.push({ type: 'text', value: escapeHtml(html.substring(start, i)) });
                }
                continue;
            }
            
            // Handle arrays
            if (html[i] === '[') {
                tokens.push({ type: 'array_open', value: '[' });
                i++;
                continue;
            }
            
            if (html[i] === ']') {
                tokens.push({ type: 'array_close', value: ']' });
                i++;
                continue;
            }
            
            // Handle punctuation
            if (html[i] === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }
            
            if (html[i] === ';') {
                tokens.push({ type: 'semicolon', value: ';' });
                i++;
                continue;
            }
            
            // Handle whitespace
            if (/\s/.test(html[i])) {
                const start = i;
                while (i < html.length && /\s/.test(html[i])) {
                    i++;
                }
                tokens.push({ type: 'whitespace', value: escapeHtml(html.substring(start, i)) });
                continue;
            }
            
            // Everything else as text
            tokens.push({ type: 'text', value: escapeHtml(html[i]) });
            i++;
        }
        
        // Convert tokens to highlighted HTML
        return tokens.map(token => {
            switch (token.type) {
                case 'comment':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'tag_open':
                case 'tag_close':
                    return `<span style="color: #6b7280;">${token.value}</span>`;
                case 'tag_name':
                    return `<span style="color: #60a5fa;">${token.value}</span>`;
                case 'attribute':
                    return `<span style="color: #34d399;">${token.value}</span>`;
                case 'colon':
                    return `<span style="color: #f59e0b;">${token.value}</span>`;
                case 'string':
                    return `<span style="color: #fbbf24;">${token.value}</span>`;
                case 'array_open':
                case 'array_close':
                    return `<span style="color: #a78bfa;">${token.value}</span>`;
                case 'comma':
                case 'semicolon':
                    return `<span style="color: #f59e0b;">${token.value}</span>`;
                default:
                    return token.value;
            }
        }).join('');
    }
    
    // Initialize all functionality
    initTabs();
    initCopyButtons();
    initSmoothScrolling();
    initNavScrollEffect();
    initScrollAnimations();
    initCodeHighlighting();
    
    // Add loading complete class to body
    document.body.classList.add('loaded');
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle resize events
window.addEventListener('resize', debounce(() => {
    // Recalculate any size-dependent functionality here
}, 250));
