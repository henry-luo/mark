# Data Model

Understanding Mark's data model is essential for effectively working with Mark objects in JavaScript.

## Overview

Mark has a simple and fully-typed data model where each Mark object has three facets:

1. **Type name** - identifies what the object represents
2. **Properties** - key-value pairs stored as named properties
3. **Content** - ordered list stored as indexed properties

## Type System

### Type Names

Every Mark object has a type name that maps to `object.constructor.name` in JavaScript:

```javascript
const user = Mark.parse(`{user name:"Alice"}`);
console.log(user.constructor.name); // "user"
console.log(typeof user); // "object"
```

### Dynamic Types

Type names are determined at parse time and create dynamic constructor functions:

```javascript
const blog = Mark.parse(`{blog title:"My Blog"}`);
console.log(blog instanceof Object); // true
console.log(blog.constructor.name); // "blog"
```

## Object Structure

### Dual Nature: Named and Indexed Properties

Mark objects are unique because they combine both object and array characteristics:

```javascript
const element = Mark.parse(`{div class:"container" "Text content" {span "nested"}}`);

// Named properties (object-like)
console.log(element.class); // "container"

// Indexed properties (array-like)
console.log(element[0]); // "Text content"
console.log(element[1].constructor.name); // "span"
console.log(element.length); // 2
```

### Property Access

Properties can be accessed using dot notation or bracket notation:

```javascript
const obj = Mark.parse(`{config host:"localhost" port:3000}`);

// Dot notation
console.log(obj.host); // "localhost"
console.log(obj.port); // 3000

// Bracket notation
console.log(obj["host"]); // "localhost"
console.log(obj["port"]); // 3000
```

### Content Access

Content is accessed using array-like indexing:

```javascript
const list = Mark.parse(`{list "item1" "item2" "item3"}`);

// Array-like access
console.log(list[0]); // "item1"
console.log(list[1]); // "item2"
console.log(list[2]); // "item3"
console.log(list.length); // 3

// Array methods work
list.forEach((item, index) => {
  console.log(`${index}: ${item}`);
});
```

## JavaScript Mapping

### Plain Old JavaScript Objects (POJOs)

Mark objects are plain JavaScript objects, not instances of special classes:

```javascript
const obj = Mark.parse(`{user name:"Alice" age:30}`);

console.log(obj.constructor === Object); // false (dynamic constructor)
console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true
```

### Serialization Compatibility

Mark objects work seamlessly with JSON serialization:

```javascript
const mark = Mark.parse(`{user name:"Alice" posts:["post1" "post2"]}`);

// JSON serialization
const json = JSON.stringify(mark);
console.log(json); // {"0":"post1","1":"post2","name":"Alice","posts":["post1","post2"]}

// JSON deserialization
const restored = JSON.parse(json);
// Note: type information is lost in JSON
```

### Object Enumeration

Properties and content can be enumerated using standard JavaScript methods:

```javascript
const obj = Mark.parse(`{config debug:true port:3000 "item1" "item2"}`);

// Enumerate all properties (including indexed)
Object.keys(obj); // ["0", "1", "debug", "port"]

// Enumerate only named properties
Object.keys(obj).filter(key => isNaN(key)); // ["debug", "port"]

// Enumerate only content
Object.keys(obj).filter(key => !isNaN(key)); // ["0", "1"]
```

## Memory Layout

### Efficient Storage

Mark objects store both properties and content in a single JavaScript object:

```javascript
const element = Mark.parse(`{div id:"main" class:"container" "Text" {span "nested"}}`);

// Internal structure (conceptual):
// {
//   "constructor": { name: "div" },
//   "id": "main",
//   "class": "container",
//   "0": "Text",
//   "1": { constructor: { name: "span" }, "0": "nested", length: 1 },
//   "length": 2
// }
```

### Performance Characteristics

- **Memory efficient**: Single object instead of separate properties/content containers
- **Fast property access**: Direct JavaScript property lookup
- **Fast content access**: Direct array-like indexing
- **Minimal overhead**: No wrapper classes or proxies

## Type Coercion and Compatibility

### Automatic Type Conversion

Mark objects participate in JavaScript's type coercion:

```javascript
const num = Mark.parse(`{number 42}`);
console.log(num + 8); // "42" + 8 = "428" (string concatenation)
console.log(+num[0] + 8); // 42 + 8 = 50 (numeric addition)
```

### Truthiness

Mark objects are always truthy:

```javascript
const empty = Mark.parse(`{empty}`);
const withContent = Mark.parse(`{item "content"}`);

console.log(!!empty); // true
console.log(!!withContent); // true
```

### Array-like Behavior

Mark objects with content behave like arrays for many operations:

```javascript
const list = Mark.parse(`{list "a" "b" "c"}`);

// Array methods
console.log(Array.from(list)); // ["a", "b", "c"]
console.log([...list]); // ["a", "b", "c"] (spread operator)

// Array destructuring
const [first, second, third] = list;
console.log(first); // "a"
```

## Nested Object Handling

### Deep Nesting

Mark supports arbitrary nesting depth:

```javascript
const deep = Mark.parse(`{level1 {level2 {level3 {level4 "deep value"}}}}`);

console.log(deep.level2.level3.level4[0]); // "deep value"
```

### Circular References

Mark objects can contain circular references (created programmatically):

```javascript
const parent = Mark('parent');
const child = Mark('child');

parent.child = child;
child.parent = parent; // Circular reference

// Note: Circular references will cause issues with JSON.stringify
```

## Data Model Comparison

### Mark vs JSON Data Model

| Aspect | Mark | JSON |
|--------|------|------|
| Type information | ✅ Preserved | ❌ Lost |
| Mixed content | ✅ Native support | ❌ Requires arrays |
| Object structure | Single object | Nested objects |
| Memory efficiency | High | Lower |
| JavaScript integration | Seamless | Good |

### Mark vs DOM Data Model

| Aspect | Mark | DOM |
|--------|------|-----|
| Object type | Plain objects | Element nodes |
| Property access | Direct | getAttribute() |
| Content access | Array-like | childNodes |
| Memory usage | Efficient | Higher overhead |
| Manipulation | JavaScript native | DOM APIs |

## Best Practices

### Working with Properties

```javascript
// Good: Check property existence
const obj = Mark.parse(`{config port:3000}`);
if ('host' in obj) {
  console.log(obj.host);
}

// Good: Provide defaults
const host = obj.host || 'localhost';
```

### Working with Content

```javascript
// Good: Check content length
const list = Mark.parse(`{list "item1" "item2"}`);
if (list.length > 0) {
  console.log(list[0]);
}

// Good: Use array methods safely
const items = Array.from(list);
```

### Type Checking

```javascript
// Good: Check constructor name
function isMarkType(obj, typeName) {
  return obj && obj.constructor && obj.constructor.name === typeName;
}

const user = Mark.parse(`{user name:"Alice"}`);
console.log(isMarkType(user, 'user')); // true
```

?> **Performance Tip**: Mark objects are optimized for read access. If you need to frequently modify content, consider using array methods like `push()`, `pop()`, `splice()` which maintain the `length` property automatically.
