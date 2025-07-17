# Mark Notation Logo Assets

This directory contains the official SVG logo assets for Mark Notation.

## 📁 Available Logos

### **Main Logo** - `mark-notation-logo.svg`
- **Size**: 120x40px
- **Usage**: Primary logo for headers, business cards, documents
- **Colors**: Gradient from green (#10b981) to blue (#3b82f6)
- **Background**: Transparent, suitable for light backgrounds

### **Icon Version** - `mark-notation-icon.svg`
- **Size**: 40x40px (square)
- **Usage**: Favicons, app icons, social media profiles
- **Colors**: Gradient braces with subtle background
- **Features**: Centered design with unified data representation

### **Banner Version** - `mark-notation-banner.svg`
- **Size**: 300x80px
- **Usage**: Website headers, presentations, marketing materials
- **Features**: Full tagline "UNIFIED DATA NOTATION"
- **Colors**: Extended gradient with purple accents

### **Monochrome Version** - `mark-notation-logo-mono.svg`
- **Size**: 120x40px
- **Usage**: Single-color printing, embossing, watermarks
- **Colors**: Blue (#2563eb) with gray text
- **Background**: Transparent

### **Dark Version** - `mark-notation-logo-dark.svg`
- **Size**: 120x40px
- **Usage**: Dark backgrounds, dark mode interfaces
- **Colors**: Bright gradient with light text
- **Features**: High contrast for dark themes

## 🎨 Design Elements

### **Brand Symbol**
- **Braces `{ }`**: Represent the unified notation concept
- **Dots**: Symbolize data points and information flow
- **Gradients**: Modern, tech-forward aesthetic

### **Typography**
- **Font**: Inter (web-safe fallback to system fonts)
- **Weights**: Bold for "Mark", Regular for "Notation"
- **Hierarchy**: Clear distinction between brand name and descriptor

### **Color Palette**
- **Primary Green**: #10b981 (emerald-500)
- **Primary Blue**: #3b82f6 (blue-500)
- **Accent Purple**: #8b5cf6 (violet-500)
- **Text Dark**: #1e293b (slate-800)
- **Text Light**: #64748b (slate-500)

## 📏 Usage Guidelines

### **Minimum Size**
- Logo: 80px width minimum
- Icon: 16px minimum
- Maintain aspect ratio

### **Clear Space**
- Minimum clear space: 1x the height of the braces
- Keep logos uncluttered

### **Don'ts**
- ❌ Don't stretch or distort
- ❌ Don't change colors arbitrarily
- ❌ Don't add drop shadows or effects
- ❌ Don't place on busy backgrounds without sufficient contrast

### **File Formats**
- **SVG**: Preferred for web and scalable applications
- **Vector**: Infinitely scalable without quality loss
- **Web-ready**: Optimized file sizes

## 🚀 Implementation

### **HTML Usage**
```html
<!-- Inline SVG -->
<img src="mark-notation-logo.svg" alt="Mark Notation" width="120" height="40">

<!-- As favicon -->
<link rel="icon" type="image/svg+xml" href="mark-notation-icon.svg">
```

### **CSS Background**
```css
.logo {
  background-image: url('mark-notation-logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
}
```

### **React/Vue Components**
```jsx
import Logo from './mark-notation-logo.svg';

<img src={Logo} alt="Mark Notation" />
```

## 📐 Technical Specifications

- **Format**: SVG (Scalable Vector Graphics)
- **Color Space**: sRGB
- **Optimization**: Minified paths, optimized gradients
- **Compatibility**: All modern browsers, print-ready
- **Accessibility**: Includes proper titles and descriptions

---

**Mark Notation** - A unified notation for both object and markup data.
