# Mark Notation Documentation

> A unified notation for both object and markup data

Mark Notation, or simply Mark, is a new unified notation for both object and markup data. The notation is a superset of what can be represented by JSON, HTML and XML, but overcomes many limitations of these popular data formats, yet still having a very clean syntax and simple data model.

## Features

- **Clean syntax** with fully-typed data model (like JSON or even better)
- **Generic and extensible** (like XML or even better)
- **Built-in mixed content support** (like HTML5 or even better)
- **High-order composition** (like S-expressions or even better)

## Quick Start

Install Mark.js from npm:

```bash
npm install mark-js --save
```

Basic usage:

```javascript
const Mark = require('mark-js');

// Parse Mark notation
var obj = Mark.parse(`{div {span 'Hello World!'}}`);

// Convert back to string
console.log(Mark.stringify(obj));
```

## Comparison with Other Formats

| Feature | Mark | JSON | HTML5 | XML | S-expr | YAML |
|---------|------|------|-------|-----|--------|------|
| Clean syntax | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Fully-typed | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Generic | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Mixed content support | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| High-order composition | ✅ | ⚠️ | ❌ | ❌ | ✅ | ⚠️ |
| Wide adoption | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |

## Documentation Sections

- **[Getting Started](getting-started.md)** - Installation and basic usage
- **[Syntax Reference](syntax.md)** - Complete syntax specification
- **[Data Model](data-model.md)** - Understanding Mark's data model
- **[API Reference](api.md)** - JavaScript API documentation
- **[Examples](examples.md)** - Practical examples and use cases
- **[Migration Guide](migration.md)** - Migrating from other formats
- **[FAQ](faq.md)** - Frequently asked questions

## Community

- **GitHub Repository**: [henry-luo/mark](https://github.com/henry-luo/mark)
- **Issues**: [Report bugs or request features](https://github.com/henry-luo/mark/issues)
- **Discussions**: [Community discussions](https://github.com/henry-luo/mark/discussions)

## License

Mark Notation is open source and available under the [MIT License](https://github.com/henry-luo/mark/blob/master/LICENSE).
