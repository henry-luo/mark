# Mark Notation Website

This is the official website for Mark Notation, built with modern HTML/CSS/JavaScript and Docsify for documentation.

## 🚀 GitHub Pages Deployment

This site is configured for GitHub Pages deployment. To deploy:

1. **Fork or clone this repository**
2. **Push the `site/` directory contents to your GitHub repository**
3. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)` if you moved site contents to root, or `/site` if using subdirectory

## 📁 File Structure

```
site/
├── index.html          # Main landing page
├── .nojekyll           # Prevents Jekyll processing
├── css/                # Stylesheets
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   └── layout.css
├── js/                 # JavaScript
│   └── main.js
└── doc/                # Documentation (Docsify)
    ├── index.html      # Docsify configuration
    ├── README.md       # Main documentation
    ├── _sidebar.md     # Sidebar navigation
    ├── _navbar.md      # Top navigation
    └── *.md            # Documentation pages
```

## 🎨 Features

- **Modern Design**: Clean, responsive design inspired by Zed.dev
- **Unified Styling**: Documentation seamlessly matches the main site design
- **Interactive Elements**: Syntax highlighting, copy-to-clipboard, smooth scrolling
- **Mobile Responsive**: Optimized for all device sizes
- **Fast Loading**: Optimized assets and minimal dependencies

## 🔧 Local Development

To run locally:

1. **Start a local server** (required for proper routing):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   Right-click index.html → "Open with Live Server"
   ```

2. **Open in browser**: `http://localhost:8000`

## 📚 Documentation

The documentation is powered by [Docsify](https://docsify.js.org/) and includes:

- Getting Started guide
- Complete syntax specification
- API reference
- FAQ and examples
- Contributing guidelines

## 🌐 Live Demo

Once deployed to GitHub Pages, your site will be available at:
- `https://yourusername.github.io/yourrepository/` (if using subdirectory)
- `https://yourusername.github.io/` (if using root deployment)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

---

**Mark Notation** - A unified notation for both object and markup data.
