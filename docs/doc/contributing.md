# Contributing to Mark Notation

Thank you for your interest in contributing to Mark Notation! This guide will help you get started with contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Getting Started

### Types of Contributions

We welcome many different types of contributions:

- **Bug reports**: Help us identify and fix issues
- **Feature requests**: Suggest new functionality
- **Code contributions**: Fix bugs or implement features
- **Documentation**: Improve or add documentation
- **Examples**: Add practical examples and use cases
- **Testing**: Improve test coverage and quality

### Where to Start

1. **Check existing issues**: Look at [open issues](https://github.com/henry-luo/mark/issues) for ideas
2. **Read the roadmap**: See planned features in our [project roadmap](https://github.com/henry-luo/mark/projects)
3. **Join discussions**: Participate in [GitHub Discussions](https://github.com/henry-luo/mark/discussions)
4. **Good first issues**: Look for issues labeled `good first issue`

## Development Setup

### Prerequisites

- Node.js 14 or higher
- npm 6 or higher
- Git

### Setup Instructions

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mark.git
   cd mark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Project Structure

```
mark/
├── src/                 # Source code
│   ├── parser/         # Parser implementation
│   ├── stringify/      # Stringify functionality
│   ├── utils/          # Utility functions
│   └── index.js        # Main entry point
├── test/               # Test files
├── docs/               # Documentation source
├── examples/           # Example code
├── dist/               # Built files
└── tools/              # Build and development tools
```

## Contributing Guidelines

### Before You Start

1. **Search existing issues** to avoid duplicates
2. **Create an issue** for major changes to discuss the approach
3. **Check the roadmap** to ensure alignment with project direction
4. **Read the documentation** to understand current functionality

### Making Changes

1. **Create a branch** from `main` with a descriptive name:
   ```bash
   git checkout -b feature/add-query-api
   git checkout -b fix/parsing-edge-case
   git checkout -b docs/improve-examples
   ```

2. **Make focused commits** with clear messages:
   ```bash
   git commit -m "Add CSS selector-like query API
   
   - Implement basic selector parsing
   - Add type, property, and descendant selectors
   - Include comprehensive tests
   - Update documentation with examples"
   ```

3. **Keep commits small** and focused on a single change

4. **Add tests** for new functionality or bug fixes

5. **Update documentation** as needed

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure tests pass**:
   ```bash
   npm test
   npm run lint
   ```

3. **Create a pull request** with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference to related issues
   - Screenshots or examples if applicable

4. **Respond to feedback** and make requested changes

5. **Squash commits** if requested before merging

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Related Issues
Fixes #(issue number)

## Additional Notes
Any additional information or context.
```

## Coding Standards

### JavaScript Style

We use ESLint and Prettier for code formatting. Key guidelines:

```javascript
// Use const/let, not var
const user = Mark.parse(`{user name:"Alice"}`);

// Use meaningful variable names
const userEmail = user.email;
const isActiveUser = user.active;

// Use JSDoc for public functions
/**
 * Parses a Mark notation string into a JavaScript object.
 * @param {string} markString - The Mark notation string to parse
 * @param {Object} options - Parsing options
 * @returns {Object} The parsed Mark object
 */
function parse(markString, options = {}) {
  // Implementation
}

// Use async/await over promises
async function loadConfig() {
  const data = await fs.readFile('config.mark', 'utf8');
  return Mark.parse(data);
}
```

### Error Handling

```javascript
// Provide detailed error messages
if (!isValidTypeName(typeName)) {
  throw new SyntaxError(
    `Invalid type name "${typeName}" at line ${line}, column ${column}`
  );
}

// Include context in errors
class MarkSyntaxError extends SyntaxError {
  constructor(message, line, column, source) {
    super(message);
    this.name = 'MarkSyntaxError';
    this.line = line;
    this.column = column;
    this.source = source;
  }
}
```

### Performance Considerations

```javascript
// Prefer efficient algorithms
function parseArray(tokens) {
  const result = [];
  // Process tokens efficiently
  return result;
}

// Avoid unnecessary object creation
function stringify(obj, options) {
  // Reuse string builders when possible
}

// Use appropriate data structures
const typeMap = new Map(); // For frequent lookups
const contentArray = []; // For ordered content
```

## Testing

### Test Requirements

- **Unit tests** for all public functions
- **Integration tests** for complex workflows
- **Edge case tests** for error conditions
- **Performance tests** for critical paths

### Writing Tests

```javascript
// Use descriptive test names
describe('Mark.parse()', () => {
  it('should parse simple objects with properties', () => {
    const result = Mark.parse(`{user name:"Alice" age:30}`);
    expect(result.constructor.name).toBe('user');
    expect(result.name).toBe('Alice');
    expect(result.age).toBe(30);
  });
  
  it('should handle nested objects correctly', () => {
    // Test implementation
  });
  
  it('should throw SyntaxError for invalid input', () => {
    expect(() => {
      Mark.parse(`{invalid`);
    }).toThrow(SyntaxError);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "parser"

# Run tests in watch mode
npm run test:watch
```

## Documentation

### Documentation Standards

1. **API documentation**: Use JSDoc for all public APIs
2. **Examples**: Include practical examples
3. **Guides**: Write step-by-step tutorials
4. **Reference**: Maintain comprehensive reference docs

### Writing Documentation

```markdown
# Use clear headings
## API Reference
### Mark.parse()

# Include code examples
```javascript
const obj = Mark.parse(`{user name:"Alice"}`);
```

# Add notes for important information
?> **Note**: This function modifies the original object.

# Use warnings for critical information
!> **Warning**: This operation is irreversible.
```

### Documentation Files

- **README.md**: Project overview and quick start
- **API.md**: Complete API reference
- **EXAMPLES.md**: Practical examples
- **MIGRATION.md**: Migration guides
- **FAQ.md**: Frequently asked questions

## Release Process

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build distribution files
5. Create GitHub release
6. Publish to npm
7. Update documentation

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussion
- **Email**: Direct communication with maintainers

### Asking Questions

When asking for help:

1. **Search existing issues** and discussions first
2. **Provide context**: What are you trying to achieve?
3. **Include code examples**: Show what you've tried
4. **Specify environment**: Node.js version, browser, etc.
5. **Include error messages**: Full stack traces help

### Getting Reviews

To get your pull request reviewed quickly:

1. **Keep it focused**: One feature or fix per PR
2. **Add tests**: Ensure good test coverage
3. **Update docs**: Include documentation updates
4. **Be responsive**: Address feedback promptly
5. **Be patient**: Maintainers are often volunteers

## Recognition

Contributors will be recognized in:

- **GitHub contributors list**
- **CHANGELOG.md** for significant contributions
- **Documentation credits**
- **Release notes** for major features

Thank you for contributing to Mark Notation! 🎉
