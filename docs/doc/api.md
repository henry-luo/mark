# API Reference

Complete API documentation for the Mark.js library.

## Core Functions

The Mark.js library provides a simple API centered around parsing, stringifying, and constructing Mark objects.

### Mark()

The main constructor function for creating Mark objects.

**Constructor Signatures:**

```javascript
Mark(source)  // shorthand for Mark.parse(source)
Mark(typeName, properties?, content?)  // object constructor
```

**Parameters for parse shorthand:**
- `source` (string): Mark notation string that must start with '<', '{', '[', or '('

**Parameters for object constructor:**
- `typeName` (string): The type name for the object (must not start with '{')
- `properties` (object, optional): Key-value pairs for object properties (numeric keys ignored)
- `content` (array, optional): Array of content items (null values skipped, primitives converted to strings, arrays flattened, consecutive strings merged)

**Returns:** Mark object (POJO with special properties)

**Examples:**

```javascript
// Parse shorthand
const obj = Mark('<user name:"Alice">');

// Object constructor - simple object
const greeting = Mark('greeting');

// Object with properties
const user = Mark('user', { name: 'Alice', age: 30 });

// Object with content
const list = Mark('list', null, ['item1', 'item2', 'item3']);

// Object with both properties and content
const div = Mark('div', { class: 'container' }, ['Hello, World!']);
```

## Mark Object Structure

The constructed Mark object is a simple POJO (Plain Old JavaScript Object) with these special characteristics:

### Accessing Data

- **Type name**: Access through `markObj.constructor.name`
- **Properties**: Access through `markObj.prop` or `markObj['prop']` for non-identifier names
- **Content**: Access through `markObj[index]` (array-like indexed properties)

**Examples:**

```javascript
const element = Mark.parse('<div class:"container" id:main "Hello" "World">');

// Type name
console.log(element.constructor.name); // "div"

// Properties
console.log(element.class); // "container"
console.log(element.id); // "main"

// Content (array-like access)
console.log(element[0]); // "Hello"
console.log(element[1]); // "World"
console.log(element.length); // 2
```

### Enumeration

- **Properties**: Use `for...in` loop (content items are non-enumerable)
- **Content**: Use `for...of` loop or array-like iteration

```javascript
const obj = Mark.parse('<user name:"Alice" age:30 "bio text" "more info">');

// Iterate properties
for (let prop in obj) {
  console.log(`${prop}: ${obj[prop]}`);
}
// Output: name: Alice, age: 30

// Iterate content
for (let item of obj) {
  console.log(item);
}
// Output: "bio text", "more info"
```

## Instance Methods

### Core Methods

#### .length

```javascript
obj.length
```

Returns the number of content items. If a `length` property is defined on the object, returns that value instead. Use `Mark.lengthOf()` to always get content length.

#### .contents()

```javascript
obj.contents()
```

Returns an array of all content items stored in the Mark object.

#### .parent()

```javascript
obj.parent()
```

Returns the parent object of the current Mark object.

#### .source(options)

```javascript
obj.source(options?)
```

Shorthand for stringifying the current Mark object. Same as `Mark.stringify(obj, options)`.

#### .text()

```javascript
obj.text()
```

Returns a string which is the concatenation of all descendant text content items.

### Array-like Methods

Mark objects support most array methods for working with content:

```javascript
// Functional array methods
obj.filter(callback, thisArg?)
obj.map(callback, thisArg?)
obj.reduce(callback, initialValue?)
obj.every(callback, thisArg?)
obj.some(callback, thisArg?)
obj.each(callback, thisArg?)       // alias for forEach
obj.forEach(callback, thisArg?)

// Search methods
obj.includes(searchElement, fromIndex?)
obj.indexOf(searchElement, fromIndex?)
obj.lastIndexOf(searchElement, fromIndex?)

// Slice method
obj.slice(begin?, end?)
```

**Example:**

```javascript
const list = Mark.parse('<list "apple" "banana" "cherry">');

// Filter content
const filtered = list.filter(item => item.includes('a'));
console.log(filtered); // ["apple", "banana"]

// Map content
const lengths = list.map(item => item.length);
console.log(lengths); // [5, 6, 6]

// Check if all items are strings
const allStrings = list.every(item => typeof item === 'string');
console.log(allStrings); // true
```

**Note:** When these methods are overridden by properties of the same name, you can still call them from the prototype: `Mark.prototype.contents.call(markObj)`.

## Parse API

### Mark.parse()

Parses a Mark notation string into a JavaScript object.

```javascript
Mark.parse(markString, options?)
```

**Parameters:**
- `markString` (string): The Mark notation string to parse
- `options` (object, optional): Parsing options

**Returns:** Mark object

**Throws:** `SyntaxError` if the input is invalid

**Examples:**

```javascript
// Basic parsing
const obj = Mark.parse('<user name:"Alice" age:30>');

// Complex structure
const form = Mark.parse(`<form
  <input type:text name:username>
  <input type:password name:password>
  <button type:submit "Login">
>`);

// Mixed content
const article = Mark.parse(`<article
  <h1 "Title">
  <p "This is " <em "emphasized"> " text.">
>`);
```

### Error Handling

Parse errors include detailed information about the syntax issue:

```javascript
try {
  const obj = Mark.parse('<invalid syntax');
} catch (error) {
  console.log(error.message); // Error description
  console.log(error.line);    // Line number (if available)
  console.log(error.column);  // Column number (if available)
}
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
- `space` (string|number): Indentation for pretty printing. If number, indicates spaces per level (max 10). If string, uses that string for indentation (max 10 characters).

**Returns:** String representation of the Mark object

**Examples:**

```javascript
const obj = Mark('user', { name: 'Alice', age: 30 }, ['Hello']);

// Compact output
Mark.stringify(obj);
// Result: <user name:"Alice" age:30 "Hello">

// Pretty printed with 2 spaces
Mark.stringify(obj, { space: 2 });
// Result:
// <user
//   name:"Alice"
//   age:30
//   "Hello"
// >

// Pretty printed with custom indentation
Mark.stringify(obj, { space: '\t' });
// Uses tabs for indentation
```

**Note:** Mark does not support `reviver` function (like `JSON.parse()`) or `replacer` function (like `JSON.stringify()`). These are not structured nor secure ways to serialize and deserialize custom data types.

## Static Methods

### Mark.lengthOf()

Returns the content length of a Mark object, even when the object has a `length` property.

```javascript
Mark.lengthOf(markObject)
```

**Parameters:**
- `markObject` (object): The Mark object to measure

**Returns:** Number of content items

**Example:**

```javascript
const obj = Mark.parse('<list length:5 "a" "b" "c">');
console.log(obj.length);           // 5 (property value)
console.log(Mark.lengthOf(obj));   // 3 (actual content length)
```

## Mutative API

Mutative API functions are in the separate sub-module `mark.mutate.js`. These allow modification of Mark objects and can be excluded if using Mark in a purely functional manner.

### .set()

Sets a property or content item on a Mark object.

```javascript
obj.set(key, value)
```

**Parameters:**
- `key` (string|number): Property name or content index
- `value` (any): Value to set

**Returns:** The Mark object (for chaining)

**Examples:**

```javascript
const obj = Mark.parse('<user name:"Alice">');

// Set property
obj.set('age', 30);

// Set content (numeric key)
obj.set(0, 'Hello, Alice!');

console.log(Mark.stringify(obj));
// Result: <user name:"Alice" age:30 "Hello, Alice!">
```

### .push()

Adds one or more items to the end of the content.

```javascript
obj.push(item1, item2, ...)
```

**Parameters:**
- `item1, item2, ...` (any): Items to add

**Returns:** The Mark object (for chaining, unlike Array.push which returns length)

**Example:**

```javascript
const list = Mark.parse('<list "a" "b">');
list.push('c', 'd');
console.log(Mark.stringify(list));
// Result: <list "a" "b" "c" "d">
```

### .pop()

Removes and returns the last content item.

```javascript
obj.pop()
```

**Returns:** The removed item

**Example:**

```javascript
const list = Mark.parse('<list "a" "b" "c">');
const last = list.pop();
console.log(last); // "c"
console.log(Mark.stringify(list)); // <list "a" "b">
```

### .splice()

Changes content by removing existing items and/or adding new items.

```javascript
obj.splice(index, deleteCount, item1, item2, ...)
```

**Parameters:**
- `index` (number): Start index
- `deleteCount` (number): Number of items to remove
- `item1, item2, ...` (any): Items to add

**Returns:** Array of removed items

**Example:**

```javascript
const list = Mark.parse('<list "a" "b" "c" "d">');
const removed = list.splice(1, 2, 'x', 'y');
console.log(removed); // ["b", "c"]
console.log(Mark.stringify(list)); // <list "a" "x" "y" "d">
```

## Pragma API

For Mark pragma objects (special metadata comments):

### .set() (Pragma)

Sets the content of a pragma object.

```javascript
pragma.set(value)
```

**Parameters:**
- `value` (any): Value to set

**Returns:** The pragma object

## Converter API

Additional functions in `mark.convert.js` for converting Mark to other formats:

### .html()

Converts a Mark object to HTML string.

```javascript
obj.html(options?)
```

**Parameters:**
- `options` (object, optional): Same as `Mark.stringify()` options

**Returns:** HTML string

**Example:**

```javascript
const element = Mark.parse('<div class:"container" <p "Hello World">>');
console.log(element.html());
// Result: <div class="container"><p>Hello World</p></div>
```

### .xml()

Converts a Mark object to XML string.

```javascript
obj.xml(options?)
```

**Parameters:**
- `options` (object, optional): Same as `Mark.stringify()` options

**Returns:** XML string

**Example:**

```javascript
const element = Mark.parse('<book title:"My Book" <author "John Doe">>');
console.log(element.xml());
// Result: <book title="My Book"><author>John Doe</author></book>
```

## Selector API

Additional functions in `mark.selector.js` for CSS-like querying:

### .matches()

Tests whether the Mark object matches a CSS selector.

```javascript
obj.matches(selector)
```

**Parameters:**
- `selector` (string): CSS selector string

**Returns:** Boolean

**Example:**

```javascript
const element = Mark.parse('<div class:"container" id:main>');
console.log(element.matches('.container')); // true
console.log(element.matches('#main'));      // true
console.log(element.matches('span'));       // false
```

### .find()

Finds child or descendant elements that match a CSS selector.

```javascript
obj.find(selector)
```

**Parameters:**
- `selector` (string): CSS selector string

**Returns:** Array of matching Mark objects

**Example:**

```javascript
const doc = Mark.parse(`<document
  <div class:"container"
    <p "First paragraph">
    <p "Second paragraph">
  >
  <span "Some text">
>`);

const paragraphs = doc.find('p');
console.log(paragraphs.length); // 2

const container = doc.find('.container');
console.log(container.length); // 1
```

## Type Checking

### Mark.isMark()

Checks if an object is a Mark object.

```javascript
Mark.isMark(obj)
```

**Parameters:**
- `obj` (any): Object to test

**Returns:** Boolean

**Example:**

```javascript
const mark = Mark.parse('<test>');
const plain = { test: true };

console.log(Mark.isMark(mark));  // true
console.log(Mark.isMark(plain)); // false
```

## Best Practices

### Memory Management

Mark objects are plain JavaScript objects, so they follow normal garbage collection rules:

```javascript
// Objects are automatically cleaned up when no longer referenced
function processData() {
  const obj = Mark.parse('<data "large content">');
  // Process obj...
  // obj will be garbage collected when function exits
}
```

### Performance Considerations

- Use `Mark.stringify()` sparingly for large objects
- Consider using mutative API for building large structures
- Cache parsed objects when possible

### Error Handling

Always wrap parsing in try-catch blocks:

```javascript
function safeParseMarkup(markup) {
  try {
    return Mark.parse(markup);
  } catch (error) {
    console.error('Mark parsing failed:', error.message);
    return null;
  }
}
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
