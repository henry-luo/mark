# Frequently Asked Questions

## General Questions

### What is Mark Notation?

Mark Notation is a unified notation for both object and markup data. It extends JSON with a type name and mixed content support, while maintaining a clean and readable syntax. Think of it as combining the best features of JSON (structured data), HTML (mixed content), and XML (extensibility) into a single format.

### How is Mark different from JSON?

| Feature | JSON | Mark |
|---------|------|------|
| Type information | Must use "type" property | Built-in type name |
| Mixed content | Requires arrays | Native support |
| Comments | Not supported | Supported |
| Property keys | Must be quoted | Can be unquoted |
| Syntax | Verbose for markup | Concise and clean |

### How is Mark different from HTML/XML?

| Feature | HTML/XML | Mark |
|---------|----------|------|
| Data types | Strings only | Full JavaScript types |
| Property values | Quoted strings | Objects, arrays, etc. |
| Whitespace | Significant | Explicit text quoting |
| Parsing | Complex rules | Simple grammar |
| JavaScript integration | Requires DOM API | Plain objects |

### Is Mark a replacement for JSON/HTML/XML?

Mark is designed to be a superset that can represent anything JSON, HTML, or XML can represent, but more efficiently. However, it's not necessarily a replacement:

- **Use Mark** for configuration files, templates, document markup, and data exchange where you need both structure and content
- **Keep JSON** for simple API responses and configuration where wide compatibility is important
- **Keep HTML** for web pages that need to be parsed by browsers
- **Keep XML** for legacy systems and standards that require XML

## Compatibility Questions

### Is JSON a strict subset of Mark?

Yes. Mark is carefully designed to have JSON as a strict subset. Any valid JSON source should be accepted as valid Mark input, except one corner case.

JSON accept empty string "" as key. Mark does not accept that. E.g. `{"":123}` is valid under JSON, but not under Mark.

### Is Mark a subset of JavaScript?

No. Mark has introduced many syntax extensions to JSON, and its syntax is no longer valid in JavaScript.

But Mark has a clean data model that is a subset of JS data model.

<div align="center">
<img src='../data-model.png' width='300'>
</div>

## Syntax Questions

### Can I use comments in Mark?

Yes! Mark supports both single-line and multi-line comments:

```mark
<config
  // Single line comment
  host:"localhost"
  
  /*
   * Multi-line comment
   * with detailed explanation
   */
  port:3000
>
```

**Note**: Mark block comments can be nested, unlike JavaScript block comments.

### How does Mark handle whitespace?

Mark handles whitespace intelligently:

- **Between tokens**: Whitespace is ignored for parsing
- **In strings**: All whitespace is preserved exactly as written
- **Formatting**: You can format Mark for readability without affecting the data

Example:
```mark
<article
  title:"My Article"
  
  "This text preserves
   all whitespace exactly."
  
  <p "But element structure ignores formatting.">
>
```

### Can I use trailing commas?

Yes! Mark allows trailing commas in both properties and content:

```mark
<object
  prop1:"value1",
  prop2:"value2",
  "content1",
  "content2",
>
```

## Security Questions

### Is Mark secure?

Security has been taken seriously when designing and implementing Mark. It is implemented to be as secure as possible.

During parsing and serialization, Mark does not call any custom code. Objects and their constructors are constructed from scratch, not calling any custom code.

Standard `JSON.stringify()` implementation calls `toJSON()` method if it is defined on the object, before stringifying the value. Such invocation might not be secure, and is not supported under Mark.

JSON.parse() and JSON.stringify() also accept an optional parameter of a reviver and a replacer function. There are neither structured nor secure way to serialize and deserialize custom data types, thus no longer supported under Mark.

Mark shall support serialize and deserialize custom data types under a separate project Mark Schema.

### Can Mark represent circular references?

No, like JSON, Mark does not support circular references in its serialized form. The data structure must be a tree or DAG (Directed Acyclic Graph).

However, you can work around this by using references or IDs:

```mark
<document
  <person id:"person1" name:"Alice">
  <person id:"person2" name:"Bob" manager:"person1">
>
```

## Usage Questions

### Can Mark be used in languages other than JS?

Yes. Mark is designed to be a generalized data format, like JSON and XML. It is no meant just for JavaScript.

However, due to limited resource, the Mark handling library is currently only implemented in JS. But as Mark has a very simple syntax and data model, it should not be hard to port it to other languages.

### Can I use Mark for configuration files?

Absolutely! Mark is excellent for configuration files because:

- Clean, readable syntax
- Support for comments
- Rich data types (including dates and binary data)
- Hierarchical structure
- Type safety

Example configuration:
```mark
<config
  // Database settings
  <database
    host:"localhost"
    port:5432
    ssl:true
    timeout:t'2025-01-01T00:05:00Z'
  >
  
  // Feature flags
  <features
    logging:true
    debug:false
    experimental:["feature-a" "feature-b"]
  >
>
```

### How do I handle errors in Mark parsing?

The Mark.js library provides detailed error information:

```javascript
try {
  const obj = Mark.parse('<invalid syntax>');
} catch (error) {
  console.log(error.message);  // Human-readable error
  console.log(error.line);     // Line number
  console.log(error.column);   // Column number
}
```

### Is there syntax highlighting support?

Yes! There are several options:

- **VS Code**: [Mark VSC Extension](https://marketplace.visualstudio.com/items?itemName=henryluo.mark-vsce)
- **Other editors**: Community contributions for various editors

## Comparison Questions

### How does Mark compare to YAML?

| Feature | Mark | YAML |
|---------|------|------|
| Syntax clarity | Clean, unambiguous | Simple but can be ambiguous |
| Mixed content | Native support | Limited |
| Type system | Rich (includes symbols, dates, binary) | Basic |
| Comments | Yes | Yes |
| Multiline strings | Yes | Yes |
| Performance | Fast parsing | Slower parsing |
| Wide adoption | Growing | Established |

### How does Mark compare to JSX?

| Feature | Mark | JSX |
|---------|------|------|
| Purpose | Data format | UI components |
| JavaScript integration | Data objects | React elements |
| Mixed content | Native | Yes (in JavaScript) |
| Standalone usage | Yes | Requires transpilation |
| Type safety | Built-in | Through TypeScript |

## Development Questions

### What is Mark's roadmap?

Like JSON, Mark 1.0's syntax and data model is designed to be stable. Thus the mark.js library shall remain stable as well.

However, for Mark to be useful, a lot need to be developed on top of the basic Mark syntax and data model. And those activities shall happen in separate projects (like Mark Template, Mark Schema), without changing the Mark syntax and data model.

### Is mark.js production-ready?

Almost. The Mark syntax and data model has stabilized, and I don't foresee any changes soon.

The core Mark APIs have been thoroughly tested, and shall remain stable as well.

mark.convert.js which provides conversion between XML/HTML and Mark, and mark.selector.js which provides query function on Mark data using CSS selector, are fully functional, and carefully tested as well. However, due to the complex nature of XML/HTML/CSS, there might be corner cases not properly supported. And they'll be fixed through on-going maintenance.

So you can start using mark.js in production environment already. For any critical data or usage, always test carefully and thoroughly before you cut over.

### Can I extend Mark with custom types?

The core Mark specification is stable and doesn't support custom types directly. However, you can:

1. **Use conventional type names** that your application recognizes
2. **Wait for Mark Schema** (planned future project for custom types)
3. **Use properties** to add type information

Example:
```mark
<custom-widget type:"date-picker" format:"YYYY-MM-DD" value:"2025-01-01">
```

### Where can I get help?

- Check this FAQ
- Read the [documentation](README.md)
- Search or create [GitHub issues](https://github.com/henry-luo/mark/issues)
- Join [GitHub discussions](https://github.com/henry-luo/mark/discussions)
- Browse the [examples](examples.md)
