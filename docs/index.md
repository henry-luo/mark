---
layout: home
title: Mark Notation - A unified notation for object and markup data
description: Mark Notation is a unified notation for both object and markup data, combining the best of JSON, HTML, and XML with a clean syntax.
---

<!-- Hero Section -->
<section class="hero">
    <div class="hero__container">
        <div class="hero__content">
            <h1 class="hero__title">
                The notation for <span class="hero__title-highlight">what's next</span>
            </h1>
            <p class="hero__subtitle">
                Mark Notation is a unified notation for both object and markup data, 
                combining the best of JSON, HTML, and XML with a clean, modern syntax.
            </p>
            <div class="hero__actions">
                <a href="{{ '/syntax/' | relative_url }}" class="btn btn--primary btn--large">Get Started</a>
                <a href="https://github.com/henry-luo/mark" class="btn btn--secondary btn--large" target="_blank">View on GitHub</a>
            </div>
            <div class="hero__badges">
                <span class="badge">Open Source</span>
                <span class="badge">JS-friendly</span>
                <span class="badge">Cross-platform</span>
            </div>
        </div>
        
        <div class="hero__demo">
            <div class="code-demo">
                <div class="code-demo__header">
                    <div class="code-demo__dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="code-demo__title">mark-example.mark</div>
                </div>
                <div class="code-demo__content">
                    <pre class="code-demo__code"><code>&lt;form                                 // element with name 'form'
  &lt;'!--'comment&gt;                      // HTML comment as special element
  &lt;div class:'form-group'             // nested child element
    &lt;label for:email                  // 'for' and its value, both unquoted
      "Email address:"                // text needs to be double quoted
    &gt;
    &lt;input type:email, id:email&gt;      // element without child
  &gt;
  &lt;div class:'form-group'             // 'form-group' is a quoted symbol
    &lt;label for:pwd; "Password"&gt;       // pwd is an unquoted symbol
    &lt;input type:password, id:pwd&gt;     // attrs separated by comma, like JSON
  &gt;
  &lt;button class:[btn, 'btn-info']     // attribute with complex values
    "Submit"                          // text quoted with double quote
  &gt;
&gt;</code></pre>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Grid -->
<section class="features" id="features">
    <div class="features__container">
        <div class="section-header">
            <h2 class="section-title">Why Mark Notation?</h2>
            <p class="section-subtitle">
                Mark combines the best features from popular data formats while eliminating their limitations.
            </p>
        </div>
        
        <div class="features__grid">
            <div class="feature-card">
                <div class="feature-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="feature-card__title">Clean Syntax</h3>
                <p class="feature-card__description">
                    Enjoy a fully-typed data model with clean, readable syntax that's more human-friendly than JSON or XML.
                </p>
            </div>
            
            <div class="feature-card">
                <div class="feature-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="feature-card__title">Mixed Content Support</h3>
                <p class="feature-card__description">
                    Built-in support for mixed content, making it perfect for document-oriented data that's awkward in JSON.
                </p>
            </div>
            
            <div class="feature-card">
                <div class="feature-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                        <rect x="9" y="9" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <h3 class="feature-card__title">Generic & Extensible</h3>
                <p class="feature-card__description">
                    Unlike HTML's specialized format, Mark is generic and extensible for any data representation needs.
                </p>
            </div>
            
            <div class="feature-card">
                <div class="feature-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.46 9-11V7l-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="feature-card__title">Type Safety</h3>
                <p class="feature-card__description">
                    Every Mark object has a type name, eliminating the anonymous object problem that exists in JSON.
                </p>
            </div>
            
            <div class="feature-card">
                <div class="feature-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="feature-card__title">No Whitespace Ambiguity</h3>
                <p class="feature-card__description">
                    Text objects are explicitly quoted, so Mark can be minified or prettified without changing content.
                </p>
            </div>
            
            <div class="feature-card">
                <div class="feature-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="feature-card__title">JavaScript-Friendly</h3>
                <p class="feature-card__description">
                    Maps directly to plain JavaScript objects, making it ideal for web and Node.js environments.
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Syntax Comparison -->
<section class="syntax-comparison" id="syntax">
    <div class="syntax-comparison__container">
        <div class="section-header">
            <h2 class="section-title">See the Difference</h2>
            <p class="section-subtitle">
                Compare how the same data structure looks in different formats.
            </p>
        </div>
        
        <div class="comparison-tabs">
            <div class="tabs">
                <button class="tab tab--active" data-tab="mark">Mark</button>
                <button class="tab" data-tab="json">JSON</button>
                <button class="tab" data-tab="html">HTML</button>
            </div>
            
            <div class="tab-content">
                <div class="tab-pane tab-pane--active" id="mark">
                    <div class="code-block">
                        <pre class="code-block__content"><code>&lt;form method:post, action:'/submit'
  &lt;div class:'form-group'
    &lt;label for:email; "Email"&gt;
    &lt;input type:email, id:email, required&gt;
  &gt;
  &lt;div class:'form-group'
    &lt;label for:message; "Message"&gt;
    &lt;textarea id:message, rows:4&gt;&lt;/textarea&gt;
  &gt;
  &lt;button type:submit; "Send Message"&gt;
&gt;</code></pre>
                    </div>
                </div>
                
                <div class="tab-pane" id="json">
                    <div class="code-block">
                        <pre class="code-block__content"><code>{
  "form": {
    "method": "post",
    "action": "/submit",
    "children": [
      {
        "div": {
          "class": "form-group",
          "children": [
            {"label": {"for": "email", "text": "Email"}},
            {"input": {"type": "email", "id": "email", "required": true}}
          ]
        }
      },
      {
        "div": {
          "class": "form-group", 
          "children": [
            {"label": {"for": "message", "text": "Message"}},
            {"textarea": {"id": "message", "rows": 4}}
          ]
        }
      },
      {"button": {"type": "submit", "text": "Send Message"}}
    ]
  }
}</code></pre>
                    </div>
                </div>
                
                <div class="tab-pane" id="html">
                    <div class="code-block">
                        <pre class="code-block__content"><code>&lt;form method="post" action="/submit"&gt;
  &lt;div class="form-group"&gt;
    &lt;label for="email"&gt;Email&lt;/label&gt;
    &lt;input type="email" id="email" required&gt;
  &lt;/div&gt;
  &lt;div class="form-group"&gt;
    &lt;label for="message"&gt;Message&lt;/label&gt;
    &lt;textarea id="message" rows="4"&gt;&lt;/textarea&gt;
  &lt;/div&gt;
  &lt;button type="submit"&gt;Send Message&lt;/button&gt;
&lt;/form&gt;</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Get Started -->
<section class="get-started" id="get-started">
    <div class="get-started__container">
        <div class="section-header">
            <h2 class="section-title">Get Started with Mark</h2>
            <p class="section-subtitle">
                Start using Mark Notation in your projects today.
            </p>
        </div>
        
        <div class="installation-tabs">
            <div class="tabs">
                <button class="tab tab--active" data-tab="npm">npm</button>
                <button class="tab" data-tab="browser">Browser</button>
                <button class="tab" data-tab="cdn">CDN</button>
            </div>
            
            <div class="tab-content">
                <div class="tab-pane tab-pane--active" id="npm">
                    <div class="code-block">
                        <div class="code-block__header">
                            <span class="code-block__label">Install via npm</span>
                            <button class="code-block__copy">Copy</button>
                        </div>
                        <pre class="code-block__content"><code>npm install mark-js --save</code></pre>
                    </div>
                    <br>
                    <div class="code-block">
                        <div class="code-block__header">
                            <span class="code-block__label">Usage in Node.js</span>
                            <button class="code-block__copy">Copy</button>
                        </div>
                        <pre class="code-block__content"><code>const Mark = require('mark-js');
var obj = Mark.parse(`&lt;div &lt;span "Hello World!"&gt;&gt;`);
console.log("Greeting from Mark: " + Mark.stringify(obj));</code></pre>
                    </div>
                </div>
                
                <div class="tab-pane" id="browser">
                    <div class="code-block">
                        <div class="code-block__header">
                            <span class="code-block__label">Download and include</span>
                            <button class="code-block__copy">Copy</button>
                        </div>
                        <pre class="code-block__content"><code>&lt;script src='dist/mark.js'&gt;&lt;/script&gt;
&lt;script&gt;
var obj = Mark(`&lt;div &lt;span "Hello World!"&gt;&gt;`);  // using a shorthand
console.log("Greeting from Mark: " + Mark.stringify(obj));
&lt;/script&gt;</code></pre>
                    </div>
                </div>
                
                <div class="tab-pane" id="cdn">
                    <div class="code-block">
                        <div class="code-block__header">
                            <span class="code-block__label">Include from CDN</span>
                            <button class="code-block__copy">Copy</button>
                        </div>
                        <pre class="code-block__content"><code>&lt;script src='https://cdn.jsdelivr.net/npm/mark-js@1.0.0/dist/mark.js'&gt;&lt;/script&gt;
&lt;script&gt;
var obj = Mark(`&lt;div &lt;span "Hello World!"&gt;&gt;`);  // using a shorthand
console.log("Greeting from Mark: " + Mark.stringify(obj));
&lt;/script&gt;</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Documentation -->
<section class="documentation" id="documentation">
    <div class="documentation__container">
        <div class="section-header">
            <h2 class="section-title">Documentation & Resources</h2>
            <p class="section-subtitle">
                Everything you need to master Mark Notation.
            </p>
        </div>
        
        <div class="docs-grid">
            <div class="doc-card">
                <div class="doc-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="doc-card__title">Syntax Specification</h3>
                <p class="doc-card__description">
                    Complete syntax reference with examples and best practices.
                </p>
                <a href="{{ '/syntax/' | relative_url }}" class="doc-card__link">Read the spec →</a>
            </div>
            
            <div class="doc-card">
                <div class="doc-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3 class="doc-card__title">API Reference</h3>
                <p class="doc-card__description">
                    Detailed API documentation for all mark.js functions and methods.
                </p>
                <a href="{{ '/api/' | relative_url }}" class="doc-card__link">View API docs →</a>
            </div>
            
            <div class="doc-card">
                <div class="doc-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="doc-card__title">FAQ</h3>
                <p class="doc-card__description">
                    Frequently asked questions about Mark Notation and its usage.
                </p>
                <a href="{{ '/faq/' | relative_url }}" class="doc-card__link">Read FAQ →</a>
            </div>
            
            <div class="doc-card">
                <div class="doc-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3c0 .552.448 1 1 1h18z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 12v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="doc-card__title">Data Model</h3>
                <p class="doc-card__description">
                    Understanding Mark's fully-typed data model and how it extends JSON.
                </p>
                <a href="{{ '/data-model/' | relative_url }}" class="doc-card__link">Learn the model →</a>
            </div>
        </div>
    </div>
</section>

<!-- JavaScript -->
<script src="{{ '/js/main.js' | relative_url }}"></script>
