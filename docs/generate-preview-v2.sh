#!/bin/bash

# Generate Preview Script for Jekyll Pages
# This script converts Jekyll markdown files to static HTML for preview

set -e

echo "🔧 Generating preview versions of Jekyll pages..."

# Define base directory
DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Working directory: $DOCS_DIR${NC}"

# Function to extract front matter value
extract_front_matter() {
    local file="$1"
    local key="$2"
    
    sed -n '/^---$/,/^---$/p' "$file" | grep "^$key:" | sed "s/^$key: *//" | sed 's/^"//' | sed 's/"$//'
}

# Function to extract content after front matter
extract_content() {
    local file="$1"
    
    awk '/^---$/{if(++count==2) {getline; print_rest=1}} print_rest' "$file"
}

# Function to generate sidebar with active state
generate_sidebar() {
    local current_page="$1"
    local syntax_class="" data_model_class="" api_class="" faq_class="" grammar_class=""
    
    case "$current_page" in
        "syntax") syntax_class="sidebar__link--active" ;;
        "data-model") data_model_class="sidebar__link--active" ;;
        "api") api_class="sidebar__link--active" ;;
        "faq") faq_class="sidebar__link--active" ;;
        "grammar") grammar_class="sidebar__link--active" ;;
    esac
    
    cat << EOF
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar__content">
                <h3 class="sidebar__title">Documentation</h3>
                <nav class="sidebar__nav">
                    <ul class="sidebar__menu">
                        <li class="sidebar__menu-item">
                            <a href="./syntax-preview.html" class="sidebar__link $syntax_class">
                                Mark Syntax
                            </a>
                        </li>
                        <li class="sidebar__menu-item">
                            <a href="./data-model-preview.html" class="sidebar__link $data_model_class">
                                Data Model
                            </a>
                        </li>
                        <li class="sidebar__menu-item">
                            <a href="./api-preview.html" class="sidebar__link $api_class">
                                JavaScript API
                            </a>
                        </li>
                        <li class="sidebar__menu-item">
                            <a href="./faq-preview.html" class="sidebar__link $faq_class">
                                FAQ
                            </a>
                        </li>
                        <li class="sidebar__menu-item">
                            <a href="./grammar-preview.html" class="sidebar__link $grammar_class">
                                Grammar Reference
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
EOF
}

# Function to generate complete HTML page
generate_page() {
    local md_file="$1"
    local output_file="$2"
    local page_id="$3"
    
    if [ ! -f "$md_file" ]; then
        echo -e "${GREEN}⚠️  Warning: $md_file not found${NC}"
        return
    fi
    
    local title=$(extract_front_matter "$md_file" "title")
    local description=$(extract_front_matter "$md_file" "description")
    local content=$(extract_content "$md_file")
    
    # Simple markdown to HTML conversion
    local html_content=$(echo "$content" | \
        sed 's/^# \(.*\)/<h1>\1<\/h1>/g' | \
        sed 's/^## \(.*\)/<h2>\1<\/h2>/g' | \
        sed 's/^### \(.*\)/<h3>\1<\/h3>/g' | \
        sed 's/^#### \(.*\)/<h4>\1<\/h4>/g' | \
        sed 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' | \
        sed 's/\*\([^*]*\)\*/<em>\1<\/em>/g' | \
        sed 's/`\([^`]*\)`/<code>\1<\/code>/g' | \
        sed 's/\[\([^]]*\)\](\([^)]*\))/<a href="\2">\1<\/a>/g' | \
        sed 's/^$/<br>/g' | \
        sed 's/^\([^<].*[^>]\)$/<p>\1<\/p>/g')
    
    cat > "$output_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title - Mark Notation</title>
    <meta name="description" content="$description">
    
    <!-- CSS -->
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/variables.css">
    <link rel="stylesheet" href="./css/base.css">
    <link rel="stylesheet" href="./css/components.css">
    <link rel="stylesheet" href="./css/layout.css">
    <link rel="stylesheet" href="./css/jekyll-theme.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&lt; &gt;</text></svg>">
</head>
<body class="layout-page">
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav__container">
            <div class="nav__brand">
                <a href="./index-preview.html" class="nav__logo">
                    <span class="nav__logo-icon">&lt;</span>
                    <span class="nav__logo-text" style="margin-left:-3px; margin-right:-5px;">Mark</span>
                    <span class="nav__logo-icon">&gt;</span>
                </a>
            </div>
            
            <div class="nav__menu">
                <a href="./index-preview.html#features" class="nav__link">Features</a>
                <a href="./index-preview.html#syntax" class="nav__link">Syntax</a>
                <a href="./syntax-preview.html" class="nav__link">Documentation</a>
                <a href="./index-preview.html#examples" class="nav__link">Examples</a>
                <a href="https://github.com/henry-luo/mark" class="nav__link nav__link--external" target="_blank">GitHub</a>
            </div>
            
            <div class="nav__actions">
                <a href="./syntax-preview.html" class="btn btn--primary">Get Started</a>
            </div>
        </div>
    </nav>

    <!-- Main Layout -->
    <div class="main-layout">
$(generate_sidebar "$page_id")

        <!-- Main Content -->
        <main class="content content--with-sidebar">
            <div class="content__header">
                <h1 class="content__title">$title</h1>
                <p class="content__description">$description</p>
            </div>
            
            <div class="content__body">
                $html_content
            </div>
        </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer__container">
            <div class="footer__content">
                <div class="footer__brand">
                    <div class="footer__logo">
                        <span class="footer__logo-icon">&lt;</span>
                        <span class="footer__logo-text">Mark</span>
                        <span class="footer__logo-icon">&gt;</span>
                    </div>
                    <p class="footer__description">
                        A unified notation for both object and markup data.
                    </p>
                </div>
                
                <div class="footer__links">
                    <div class="footer__column">
                        <h4 class="footer__column-title">Documentation</h4>
                        <ul class="footer__column-links">
                            <li><a href="./syntax-preview.html">Syntax</a></li>
                            <li><a href="./data-model-preview.html">Data Model</a></li>
                            <li><a href="./api-preview.html">JavaScript API</a></li>
                            <li><a href="./faq-preview.html">FAQ</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer__column">
                        <h4 class="footer__column-title">Resources</h4>
                        <ul class="footer__column-links">
                            <li><a href="https://github.com/henry-luo/mark" target="_blank">GitHub</a></li>
                            <li><a href="https://www.npmjs.com/package/mark-js" target="_blank">npm Package</a></li>
                            <li><a href="./grammar-preview.html">Grammar Reference</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="footer__bottom">
                <p class="footer__copyright">
                    © 2025 Mark Notation. Released under the MIT License.
                </p>
            </div>
        </div>
    </footer>
</body>
</html>
EOF
}

# Generate all documentation pages
echo -e "${BLUE}📄 Generating documentation pages...${NC}"

generate_page "$DOCS_DIR/syntax.md" "$DOCS_DIR/syntax-preview.html" "syntax"
echo -e "${GREEN}✅ Generated syntax-preview.html${NC}"

generate_page "$DOCS_DIR/data-model.md" "$DOCS_DIR/data-model-preview.html" "data-model"
echo -e "${GREEN}✅ Generated data-model-preview.html${NC}"

generate_page "$DOCS_DIR/api.md" "$DOCS_DIR/api-preview.html" "api"
echo -e "${GREEN}✅ Generated api-preview.html${NC}"

generate_page "$DOCS_DIR/faq-jekyll.md" "$DOCS_DIR/faq-preview.html" "faq"
echo -e "${GREEN}✅ Generated faq-preview.html${NC}"

generate_page "$DOCS_DIR/grammar.md" "$DOCS_DIR/grammar-preview.html" "grammar"
echo -e "${GREEN}✅ Generated grammar-preview.html${NC}"

# Generate navigation index
echo -e "${BLUE}📄 Generating preview navigation...${NC}"
cat > "$DOCS_DIR/preview-index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jekyll Preview Pages - Mark Notation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #2563eb; margin-bottom: 10px; }
        .subtitle { color: #64748b; margin-bottom: 30px; font-size: 18px; }
        .page-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 30px; }
        .page-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; transition: all 0.2s; }
        .page-card:hover { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(37, 99, 235, 0.1); }
        .page-card h3 { margin: 0 0 12px 0; color: #1e293b; font-size: 18px; }
        .page-card p { color: #64748b; margin: 0 0 16px 0; font-size: 14px; }
        .page-card a { color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px; }
        .page-card a:hover { text-decoration: underline; }
        .status { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .status.ready { background: #dcfce7; color: #166534; }
        .note { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 8px; }
        .note strong { color: #1e293b; }
        .server-info { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .server-info strong { color: #92400e; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Jekyll Preview Pages</h1>
        <p class="subtitle">Static HTML preview versions of your Jekyll documentation pages</p>
        
        <div class="server-info">
            <strong>💡 Quick Start:</strong> Make sure your development server is running with <code>python3 -m http.server 8000</code>
        </div>
        
        <div class="note">
            <strong>Note:</strong> These are static HTML preview versions of your Jekyll pages. 
            They show how your custom template will look with simplified markdown rendering.
            For the full Jekyll experience, push to GitHub Pages or set up local Jekyll development.
        </div>
        
        <div class="page-grid">
            <div class="page-card">
                <h3>🏠 Home Page</h3>
                <p>Landing page with hero section, features, and examples</p>
                <a href="./index-preview.html">View Home Page →</a>
                <span class="status ready">Ready</span>
            </div>
            
            <div class="page-card">
                <h3>📖 Mark Syntax</h3>
                <p>Complete syntax guide and grammar reference</p>
                <a href="./syntax-preview.html">View Syntax →</a>
                <span class="status ready">Ready</span>
            </div>
            
            <div class="page-card">
                <h3>🗂️ Data Model</h3>
                <p>Understanding Mark's data types and structure</p>
                <a href="./data-model-preview.html">View Data Model →</a>
                <span class="status ready">Ready</span>
            </div>
            
            <div class="page-card">
                <h3>⚙️ JavaScript API</h3>
                <p>Complete API reference for mark.js library</p>
                <a href="./api-preview.html">View API →</a>
                <span class="status ready">Ready</span>
            </div>
            
            <div class="page-card">
                <h3>❓ FAQ</h3>
                <p>Frequently asked questions about Mark Notation</p>
                <a href="./faq-preview.html">View FAQ →</a>
                <span class="status ready">Ready</span>
            </div>
            
            <div class="page-card">
                <h3>📋 Grammar Reference</h3>
                <p>BNF grammar specification and railroad diagrams</p>
                <a href="./grammar-preview.html">View Grammar →</a>
                <span class="status ready">Ready</span>
            </div>
        </div>
        
        <div style="margin-top: 50px; padding: 30px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; text-align: center; color: white;">
            <h3 style="margin: 0 0 10px 0; color: white;">🚀 Ready for Production?</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.9;">Push your changes to GitHub to see the real Jekyll-processed version</p>
            <code style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; font-family: 'SF Mono', Monaco, monospace;">https://mark.js.org</code>
        </div>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}✅ Generated preview-index.html${NC}"

echo ""
echo -e "${GREEN}🎉 All preview pages generated successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Available preview pages:${NC}"
echo "   • http://localhost:8000/preview-index.html (📍 Start here)"
echo "   • http://localhost:8000/index-preview.html (🏠 Home)"
echo "   • http://localhost:8000/syntax-preview.html (📖 Syntax)"
echo "   • http://localhost:8000/data-model-preview.html (🗂️ Data Model)"
echo "   • http://localhost:8000/api-preview.html (⚙️ API)"
echo "   • http://localhost:8000/faq-preview.html (❓ FAQ)"
echo "   • http://localhost:8000/grammar-preview.html (📋 Grammar)"
echo ""
echo -e "${BLUE}💡 Pro tip: Run this script whenever you update your Jekyll markdown files!${NC}"
