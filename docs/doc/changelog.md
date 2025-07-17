# Changelog

All notable changes to Mark Notation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New documentation site with comprehensive examples
- TypeScript definitions for better IDE support
- Streaming parser for large documents
- CSS selector-like query API
- Performance optimizations for large objects

### Changed
- Improved error messages with line/column information
- Better memory efficiency for nested objects
- Enhanced browser compatibility

### Fixed
- Edge cases in property parsing
- Memory leaks in circular reference handling
- Unicode character support in strings

## [2.1.0] - 2024-12-15

### Added
- Multi-line comment support
- Pragma comment syntax for metadata
- Optional comma syntax
- Trailing comma support
- Template literal strings (experimental)

### Changed
- Improved parsing performance by 25%
- Better error reporting with context
- Enhanced TypeScript definitions

### Fixed
- Issue with escaped quotes in strings
- Circular reference detection
- Memory usage in large arrays

## [2.0.0] - 2024-09-20

### Added
- Complete rewrite of the parser
- Native browser support without polyfills
- Comprehensive test suite
- Documentation website
- Migration tools from JSON/HTML/XML

### Changed
- **BREAKING**: API changes for better consistency
- **BREAKING**: Different property enumeration behavior
- Improved performance and memory usage
- Better error handling

### Removed
- **BREAKING**: Deprecated `Mark.create()` method
- **BREAKING**: Old-style property access patterns

### Fixed
- Numerous parsing edge cases
- Memory leaks in complex nested structures
- Browser compatibility issues

## [1.5.2] - 2024-06-10

### Fixed
- Critical bug in nested object parsing
- Memory leak in stringify function
- Edge case with empty objects

## [1.5.1] - 2024-05-22

### Fixed
- TypeScript definition errors
- Package.json main field correction
- Documentation typos

## [1.5.0] - 2024-05-15

### Added
- TypeScript definitions
- ES modules support
- Minified browser build
- Basic validation utilities

### Changed
- Improved stringify formatting options
- Better error messages
- Performance optimizations

### Fixed
- Issue with boolean property values
- Array content handling
- Whitespace preservation in strings

## [1.4.0] - 2024-03-12

### Added
- Comment support in Mark notation
- Pretty printing options
- Basic query functionality
- Node.js 18+ support

### Changed
- Improved parser error reporting
- Better handling of special characters
- Enhanced documentation

### Fixed
- Edge cases in property parsing
- Issue with nested arrays
- Memory usage improvements

## [1.3.1] - 2024-01-08

### Fixed
- Critical parsing bug with nested objects
- Issue with boolean values
- Memory leak in large documents

## [1.3.0] - 2023-12-05

### Added
- Support for template literals
- Enhanced property value types
- Better debugging information

### Changed
- Improved performance for large documents
- Better error handling
- Enhanced API documentation

### Fixed
- Issues with special characters in property names
- Memory usage optimization
- Edge cases in content parsing

## [1.2.0] - 2023-10-18

### Added
- Browser compatibility improvements
- CDN distribution
- Enhanced examples and documentation

### Changed
- Simplified API for common use cases
- Better integration with JavaScript
- Improved test coverage

### Fixed
- Parsing issues with complex nested structures
- Memory leaks in certain scenarios
- Edge cases in stringify function

## [1.1.0] - 2023-08-25

### Added
- Mixed content support improvements
- Better array handling
- Enhanced property access

### Changed
- Improved parsing performance
- Better error messages
- Enhanced documentation

### Fixed
- Issues with empty objects
- Property enumeration problems
- Edge cases in content handling

## [1.0.0] - 2023-07-01

### Added
- Initial stable release
- Complete Mark notation parser
- JavaScript object integration
- Basic stringify functionality
- Core API functions
- Documentation and examples

### Changed
- Finalized API design
- Improved performance
- Better error handling

### Fixed
- All major parsing issues
- Memory usage optimization
- Edge cases in object creation

## [0.9.0] - 2023-05-15

### Added
- Beta release with core functionality
- Basic parsing and stringify
- Initial documentation
- Test suite

### Changed
- API refinements based on feedback
- Performance improvements
- Better error handling

### Fixed
- Major parsing bugs
- Memory leaks
- Edge cases in object handling

## [0.8.0] - 2023-04-01

### Added
- Alpha release
- Initial implementation
- Basic functionality
- Proof of concept

---

## Migration Notes

### Upgrading from 1.x to 2.x

The 2.0 release includes breaking changes. See the [Migration Guide](migration.md) for detailed upgrade instructions.

**Key changes:**
- API method names have changed
- Property enumeration behavior is different
- Some deprecated methods have been removed
- Error handling has been improved

### Upgrading from 0.x to 1.x

The 1.0 release stabilized the API. Most 0.x code should work with minimal changes, but some advanced features may require updates.

## Support

- **Current version**: 2.1.0
- **Supported versions**: 2.x (security updates), 1.x (critical fixes only)
- **End of life**: 0.x versions are no longer supported

For support, please:
1. Check the [FAQ](faq.md) for common questions
2. Search [existing issues](https://github.com/henry-luo/mark/issues)
3. Create a new issue if needed
4. Join the [discussions](https://github.com/henry-luo/mark/discussions)
