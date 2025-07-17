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

## Syntax Questions

### Can I use comments in Mark?

Yes! Mark supports both single-line and multi-line comments:

```mark
{config
  // Single line comment
  host:"localhost"
  
  /*
   * Multi-line comment
   * with detailed explanation
   */
  port:3000
}
```

### Are commas required?

No, commas are optional in Mark:

```mark
{object
  prop1:"value1"
  prop2:"value2"
  "content1"
  "content2"
}
```

You can use commas if you prefer:

```mark
{object
  prop1:"value1",
  prop2:"value2",
  "content1",
  "content2"
}
```

### How do I handle special characters in property names?

Quote property names that contain special characters:

```mark
{element
  "data-id":"123"
  "aria-label":"Accessible label"
  "my-custom-attr":"value"
}
```

### Can property values be complex objects?

Yes, property values can be any valid JavaScript value:

```mark
{config
  database:{host:"localhost" port:5432}
  features:["auth" "logging" "caching"]
  limits:{max:100 timeout:5000}
  enabled:true
}
```

### How do I represent empty objects?

Simply use the type name with no content:

```mark
{empty}
{placeholder}
{br}
```

## JavaScript Integration

### How do I access properties and content?

Properties are accessed like regular object properties, content is accessed like array elements:

```javascript
const obj = Mark.parse(`{user name:"Alice" age:30 "Welcome!" {message "Hello"}}`);

// Properties
console.log(obj.name); // "Alice"
console.log(obj.age); // 30

// Content
console.log(obj[0]); // "Welcome!"
console.log(obj[1].constructor.name); // "message"
console.log(obj.length); // 2
```

### Can I use array methods on Mark objects?

Yes, since Mark objects are array-like for their content:

```javascript
const list = Mark.parse(`{list "item1" "item2" "item3"}`);

// Array methods work
list.forEach(item => console.log(item));
list.push("item4");
const filtered = Array.from(list).filter(item => item.includes("1"));
```

### How do I check if an object is a Mark object?

Use the `Mark.isMarkObject()` utility function:

```javascript
const mark = Mark.parse(`{user}`);
const plain = {name: "Alice"};

console.log(Mark.isMarkObject(mark)); // true
console.log(Mark.isMarkObject(plain)); // false
```

### Can I serialize Mark objects with JSON.stringify()?

Yes, but type information will be lost:

```javascript
const mark = Mark.parse(`{user name:"Alice" "content"}`);
const json = JSON.stringify(mark);
// Result: {"0":"content","name":"Alice"}

// To preserve type information, use Mark.stringify()
const markString = Mark.stringify(mark);
// Result: {user name:"Alice" "content"}
```

## Performance Questions

### How does Mark performance compare to JSON?

Mark parsing is generally comparable to JSON parsing for simple structures, but may be slightly slower for complex nested objects due to the additional type information processing. However, Mark objects are more memory-efficient than equivalent JSON representations with explicit type properties.

### Can I use Mark for large datasets?

Yes, but consider these factors:

- **Streaming**: For very large files, use streaming parsers
- **Memory**: Mark objects are plain JavaScript objects, so memory usage is efficient
- **Caching**: Cache parsed results when possible
- **Chunking**: Process large datasets in chunks

### Is Mark suitable for real-time applications?

Mark is suitable for most real-time applications. The parsing overhead is minimal, and the plain object representation is efficient for manipulation and serialization.

## Browser and Node.js Support

### Which browsers support Mark?

Mark.js supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 10.1+
- Edge 79+

For older browsers (including IE11), use the ES5 build and include necessary polyfills.

### Does Mark work in Node.js?

Yes, Mark.js works in Node.js 12+ and includes TypeScript definitions.

### How do I include Mark in my project?

**Node.js:**
```bash
npm install mark-js
```

**Browser (CDN):**
```html
<script src="https://cdn.jsdelivr.net/npm/mark-js/dist/mark.js"></script>
```

**ES Modules:**
```javascript
import Mark from 'mark-js';
```

## Advanced Usage

### Can I extend Mark with custom syntax?

The core Mark syntax is fixed, but you can:

1. **Add custom types** with specific behavior
2. **Use pragma comments** for metadata
3. **Create higher-level abstractions** on top of Mark
4. **Build custom parsers** for domain-specific extensions

### How do I handle circular references?

Mark objects can contain circular references when created programmatically:

```javascript
const parent = Mark('parent');
const child = Mark('child');
parent.child = child;
child.parent = parent;

// Note: This will cause issues with Mark.stringify()
// Use a custom serializer for circular references
```

### Can I use Mark for configuration files?

Yes, Mark is excellent for configuration files:

```mark
{config
  // Development settings
  development:{
    debug:true
    database:"sqlite::memory:"
  }
  
  // Production settings
  production:{
    debug:false
    database:"postgresql://prod.db.com/app"
  }
}
```

### How do I validate Mark data?

You can create validation functions:

```javascript
function validateUser(user) {
  if (user.constructor.name !== 'user') {
    throw new Error('Expected user object');
  }
  
  if (typeof user.name !== 'string') {
    throw new Error('User name must be a string');
  }
  
  if (typeof user.age !== 'number' || user.age < 0) {
    throw new Error('User age must be a positive number');
  }
}
```

Or use JSON Schema-like validation libraries adapted for Mark.

## Migration Questions

### How do I migrate from JSON to Mark?

See the [Migration Guide](migration.md#from-json) for detailed instructions. The basic process is:

1. Remove explicit "type" properties
2. Use type names as object names
3. Convert "children" arrays to content
4. Simplify nested structures

### Can I convert HTML to Mark?

Yes, HTML can be converted to Mark:

```javascript
function htmlToMark(element) {
  // Convert HTML elements to Mark objects
  // See migration guide for complete implementation
}
```

### How do I handle existing JSON APIs?

You can use Mark internally while maintaining JSON API compatibility:

```javascript
// API endpoint
app.get('/users', (req, res) => {
  const users = getUsers(); // Returns Mark objects
  res.json(users); // Automatically converts to JSON
});

// Client-side
const response = await fetch('/users');
const jsonUsers = await response.json();
const markUsers = jsonUsers.map(user => Mark('user', user));
```

## Troubleshooting

### Common parsing errors

1. **Unmatched braces**: Ensure all `{` have corresponding `}`
2. **Missing colons**: Property syntax requires `key:value`
3. **Unquoted strings**: Text content must be quoted
4. **Invalid type names**: Type names must start with letter/underscore

### Debug parsing issues

Use the error information provided by parse errors:

```javascript
try {
  Mark.parse(`{invalid syntax`);
} catch (error) {
  console.log(`Error at line ${error.line}, column ${error.column}: ${error.message}`);
}
```

### Performance troubleshooting

1. **Profile parsing time** for large documents
2. **Check memory usage** with developer tools
3. **Use streaming parsers** for very large files
4. **Cache parsed results** when possible

?> **Need more help?** Check the [GitHub discussions](https://github.com/henry-luo/mark/discussions) or [file an issue](https://github.com/henry-luo/mark/issues) for specific questions not covered here.
