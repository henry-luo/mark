# API Reference

Complete API documentation for the Mark.js library.

## Core Functions

The Mark.js library provides a simple API centered around parsing, stringifying, and constructing Mark objects.

### Mark()

The main constructor function for creating Mark objects.

```javascript
Mark(typeName, properties?, content?)
```

**Parameters:**
- `typeName` (string): The type name for the object
- `properties` (object, optional): Key-value pairs for object properties
- `content` (array, optional): Array of content items

**Returns:** Mark object

**Examples:**

```javascript
// Simple object
const greeting = Mark('greeting');

// Object with properties
const user = Mark('user', { name: 'Alice', age: 30 });

// Object with content
const list = Mark('list', null, ['item1', 'item2', 'item3']);

// Object with both properties and content
const div = Mark('div', { class: 'container' }, ['Hello, World!']);
```

## Parse API

### Mark.parse()

Parses a Mark notation string into a JavaScript object.

```javascript
Mark.parse(markString, options?)
```

**Parameters:**
- `markString` (string): The Mark notation string to parse
- `options` (object, optional): Parsing options

**Options:**
- `strict` (boolean): Enable strict parsing mode (default: false)
- `preserveComments` (boolean): Preserve comments in output (default: false)
- `maxDepth` (number): Maximum nesting depth (default: 100)

**Returns:** Mark object

**Throws:** `SyntaxError` if the input is invalid

**Examples:**

```javascript
// Basic parsing
const obj = Mark.parse(`{user name:"Alice" age:30}`);

// With options
const strict = Mark.parse(`{config port:3000}`, { strict: true });

// Complex structure
const form = Mark.parse(`{form
  {input type:text name:username}
  {input type:password name:password}
  {button type:submit "Login"}
}`);
```

### Error Handling

Parse errors include detailed information about the syntax issue:

```javascript
try {
  const obj = Mark.parse(`{invalid syntax`);
} catch (error) {
  console.log(error.message); // "Unexpected end of input"
  console.log(error.line); // 1
  console.log(error.column); // 16
}
```

## Stringify API

### Mark.stringify()

Converts a Mark object back to Mark notation string.

```javascript
Mark.stringify(markObject, options?)
```

**Parameters:**
- `markObject` (object): The Mark object to stringify
- `options` (object, optional): Stringification options

**Options:**
- `indent` (string|number): Indentation for pretty printing (default: null)
- `maxLineLength` (number): Maximum line length before wrapping (default: 80)
- `sortKeys` (boolean): Sort object keys alphabetically (default: false)
- `includeComments` (boolean): Include comments in output (default: false)

**Returns:** String representation of the Mark object

**Examples:**

```javascript
const obj = Mark('user', { name: 'Alice', age: 30 }, ['Hello']);

// Compact output
Mark.stringify(obj);
// Result: {user name:"Alice" age:30 "Hello"}

// Pretty printed
Mark.stringify(obj, { indent: 2 });
// Result:
// {user
//   name:"Alice"
//   age:30
//   "Hello"
// }

// With line length limit
Mark.stringify(obj, { indent: 2, maxLineLength: 40 });
```

## Constructor API

### Mark.create()

Alternative constructor with more explicit parameter handling.

```javascript
Mark.create(typeName, options?)
```

**Parameters:**
- `typeName` (string): The type name for the object
- `options` (object, optional): Configuration options

**Options:**
- `properties` (object): Object properties
- `content` (array): Object content
- `prototype` (object): Custom prototype (advanced)

**Returns:** Mark object

**Example:**

```javascript
const user = Mark.create('user', {
  properties: { name: 'Alice', age: 30 },
  content: ['Welcome message']
});
```

### Mark.extend()

Creates a new Mark object by extending an existing one.

```javascript
Mark.extend(baseObject, extensions?)
```

**Parameters:**
- `baseObject` (object): The base Mark object to extend
- `extensions` (object, optional): Properties and content to add

**Returns:** New Mark object with combined properties and content

**Example:**

```javascript
const base = Mark.parse(`{user name:"Alice"}`);
const extended = Mark.extend(base, {
  properties: { age: 30, role: 'admin' },
  content: ['Welcome back!']
});
```

## Utility Functions

### Mark.isMarkObject()

Checks if an object is a Mark object.

```javascript
Mark.isMarkObject(obj)
```

**Parameters:**
- `obj` (any): The object to test

**Returns:** Boolean indicating if the object is a Mark object

**Example:**

```javascript
const mark = Mark.parse(`{user}`);
const plain = { type: 'user' };

console.log(Mark.isMarkObject(mark)); // true
console.log(Mark.isMarkObject(plain)); // false
```

### Mark.getTypeName()

Gets the type name of a Mark object.

```javascript
Mark.getTypeName(markObject)
```

**Parameters:**
- `markObject` (object): The Mark object

**Returns:** String type name or null if not a Mark object

**Example:**

```javascript
const user = Mark.parse(`{user name:"Alice"}`);
console.log(Mark.getTypeName(user)); // "user"
```

### Mark.getProperties()

Extracts only the named properties from a Mark object.

```javascript
Mark.getProperties(markObject)
```

**Parameters:**
- `markObject` (object): The Mark object

**Returns:** Plain object containing only the named properties

**Example:**

```javascript
const obj = Mark.parse(`{user name:"Alice" age:30 "content"}`);
const props = Mark.getProperties(obj);
console.log(props); // { name: "Alice", age: 30 }
```

### Mark.getContent()

Extracts only the content from a Mark object.

```javascript
Mark.getContent(markObject)
```

**Parameters:**
- `markObject` (object): The Mark object

**Returns:** Array containing the content items

**Example:**

```javascript
const obj = Mark.parse(`{list "item1" "item2" {nested "item3"}}`);
const content = Mark.getContent(obj);
console.log(content); // ["item1", "item2", {nested object}]
```

### Mark.merge()

Merges multiple Mark objects of the same type.

```javascript
Mark.merge(target, ...sources)
```

**Parameters:**
- `target` (object): The target Mark object
- `sources` (...object): Source Mark objects to merge

**Returns:** New Mark object with merged properties and content

**Example:**

```javascript
const user1 = Mark.parse(`{user name:"Alice"}`);
const user2 = Mark.parse(`{user age:30 "bio text"}`);
const merged = Mark.merge(user1, user2);
// Result: {user name:"Alice" age:30 "bio text"}
```

### Mark.clone()

Creates a deep copy of a Mark object.

```javascript
Mark.clone(markObject)
```

**Parameters:**
- `markObject` (object): The Mark object to clone

**Returns:** Deep copy of the Mark object

**Example:**

```javascript
const original = Mark.parse(`{user name:"Alice" {profile bio:"Developer"}}`);
const copy = Mark.clone(original);

copy.name = "Bob"; // Doesn't affect original
console.log(original.name); // "Alice"
console.log(copy.name); // "Bob"
```

## Advanced API

### Mark.transform()

Transforms a Mark object using a visitor function.

```javascript
Mark.transform(markObject, visitor, options?)
```

**Parameters:**
- `markObject` (object): The Mark object to transform
- `visitor` (function): Function called for each object in the tree
- `options` (object, optional): Transformation options

**Visitor Function:**
```javascript
function visitor(object, typeName, parent, key) {
  // Return modified object or null to remove
  return object;
}
```

**Example:**

```javascript
const doc = Mark.parse(`{doc {p "Hello"} {p "World"}}`);

const uppercased = Mark.transform(doc, (obj, typeName) => {
  if (typeName === 'p') {
    // Uppercase all text content in paragraphs
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = obj[i].toUpperCase();
      }
    }
  }
  return obj;
});
```

### Mark.query()

Query Mark objects using CSS-like selectors.

```javascript
Mark.query(markObject, selector)
```

**Parameters:**
- `markObject` (object): The Mark object to query
- `selector` (string): CSS-like selector string

**Returns:** Array of matching Mark objects

**Selector Syntax:**
- `type` - Select by type name
- `[property]` - Select objects with property
- `[property="value"]` - Select objects with property value
- `type[property="value"]` - Combined selectors
- `parent > child` - Direct child selector
- `ancestor descendant` - Descendant selector

**Example:**

```javascript
const doc = Mark.parse(`{doc
  {section class:"main"
    {p "First paragraph"}
    {p class:"highlight" "Second paragraph"}
  }
  {footer {p "Footer text"}}
}`);

// Find all paragraphs
const paragraphs = Mark.query(doc, 'p');

// Find paragraphs with class="highlight"
const highlighted = Mark.query(doc, 'p[class="highlight"]');

// Find paragraphs in sections
const sectionParagraphs = Mark.query(doc, 'section > p');
```

## Error Handling

### Error Types

The Mark.js library throws specific error types for different situations:

```javascript
// SyntaxError - Invalid Mark notation syntax
// TypeError - Invalid function arguments
// RangeError - Exceeding limits (depth, size, etc.)
```

### Error Properties

Parse errors include additional properties for debugging:

```javascript
try {
  Mark.parse(`{invalid`);
} catch (error) {
  console.log(error.name);     // "SyntaxError"
  console.log(error.message);  // Human-readable error message
  console.log(error.line);     // Line number (1-based)
  console.log(error.column);   // Column number (1-based)
  console.log(error.offset);   // Character offset (0-based)
  console.log(error.source);   // Source text around error
}
```

## Browser Compatibility

### Module Formats

Mark.js is available in multiple formats:

```javascript
// ES modules
import Mark from 'mark-js';

// CommonJS
const Mark = require('mark-js');

// UMD (browser global)
// <script src="mark.js"></script>
// window.Mark
```

### Polyfills

For older browsers, you may need polyfills for:
- `Object.assign()` (IE)
- `Array.from()` (IE)
- `Symbol` (IE)

### Performance Considerations

- **Memory usage**: Mark objects are memory-efficient plain objects
- **Parse speed**: Optimized parser with minimal overhead
- **Large documents**: Streaming parser available for large files
- **Circular references**: Handled gracefully, but avoid in JSON serialization

?> **Note**: The API is designed to be familiar to developers who have used JSON.parse() and JSON.stringify(). Most functions follow similar patterns and conventions.
