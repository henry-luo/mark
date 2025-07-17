# Migration Guide

This guide helps you migrate from other data formats to Mark Notation.

## From JSON

JSON is the most common migration scenario since Mark is a superset of JSON's capabilities.

### Basic Object Migration

**JSON:**
```json
{
  "type": "user",
  "name": "Alice",
  "age": 30,
  "active": true
}
```

**Mark:**
```mark
{user name:"Alice" age:30 active:true}
```

### Key Differences

| Aspect | JSON | Mark | Migration Notes |
|--------|------|------|-----------------|
| Type information | Requires "type" property | Built-in type name | Remove "type" property, use as object name |
| Property keys | Must be quoted | Can be unquoted | Remove quotes from simple keys |
| String values | Double quotes only | Single or double quotes | Choose preferred quote style |
| Comments | Not supported | Supported | Add documentation comments |
| Mixed content | Requires arrays | Native support | Simplify nested structures |

### Automated Migration

```javascript
function jsonToMark(jsonObj) {
  // Handle primitive values
  if (typeof jsonObj !== 'object' || jsonObj === null) {
    return jsonObj;
  }
  
  // Handle arrays
  if (Array.isArray(jsonObj)) {
    return jsonObj.map(jsonToMark);
  }
  
  // Handle objects
  const typeName = jsonObj.type || 'object';
  const properties = {};
  const content = [];
  
  for (let [key, value] of Object.entries(jsonObj)) {
    if (key === 'type') continue; // Skip type property
    
    if (key === 'children' && Array.isArray(value)) {
      // Convert children array to content
      content.push(...value.map(jsonToMark));
    } else {
      properties[key] = jsonToMark(value);
    }
  }
  
  return Mark(typeName, properties, content);
}

// Example usage
const jsonData = {
  "type": "form",
  "method": "POST",
  "children": [
    {
      "type": "input",
      "name": "username",
      "required": true
    }
  ]
};

const markObj = jsonToMark(jsonData);
console.log(Mark.stringify(markObj));
// Output: {form method:"POST" {input name:"username" required:true}}
```

### Complex JSON Migration

**JSON (complex structure):**
```json
{
  "document": {
    "title": "My Blog Post",
    "metadata": {
      "author": "John Doe",
      "tags": ["javascript", "tutorial"]
    },
    "content": [
      {
        "type": "paragraph",
        "text": "Welcome to my blog!"
      },
      {
        "type": "code",
        "language": "javascript",
        "content": "console.log('Hello World');"
      }
    ]
  }
}
```

**Mark (equivalent):**
```mark
{document title:"My Blog Post"
  {metadata
    author:"John Doe"
    tags:["javascript" "tutorial"]
  }
  {paragraph "Welcome to my blog!"}
  {code language:"javascript" "console.log('Hello World');"}
}
```

## From HTML

HTML migration focuses on converting markup to Mark's object representation.

### Basic HTML Elements

**HTML:**
```html
<div class="container" id="main">
  <h1>Welcome</h1>
  <p>Hello, <strong>world</strong>!</p>
</div>
```

**Mark:**
```mark
{div class:"container" id:"main"
  {h1 "Welcome"}
  {p "Hello, " {strong "world"} "!"}
}
```

### HTML to Mark Conversion

```javascript
function htmlToMark(htmlElement) {
  const tagName = htmlElement.tagName.toLowerCase();
  const properties = {};
  const content = [];
  
  // Convert attributes to properties
  for (let attr of htmlElement.attributes) {
    properties[attr.name] = attr.value;
  }
  
  // Convert child nodes to content
  for (let child of htmlElement.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) content.push(text);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      content.push(htmlToMark(child));
    }
  }
  
  return Mark(tagName, properties, content);
}

// Usage with DOM parser
const parser = new DOMParser();
const doc = parser.parseFromString('<div class="test">Hello</div>', 'text/html');
const markObj = htmlToMark(doc.body.firstElementChild);
```

### Form Migration

**HTML Form:**
```html
<form method="POST" action="/submit">
  <fieldset>
    <legend>Personal Info</legend>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email">
  </fieldset>
  <button type="submit">Submit</button>
</form>
```

**Mark Form:**
```mark
{form method:"POST" action:"/submit"
  {fieldset
    {legend "Personal Info"}
    {label for:"name" "Name:"}
    {input type:"text" id:"name" name:"name" required:true}
    {label for:"email" "Email:"}
    {input type:"email" id:"email" name:"email"}
  }
  {button type:"submit" "Submit"}
}
```

### Self-Closing Tags

HTML self-closing tags become Mark objects without content:

**HTML:**
```html
<img src="image.jpg" alt="Description">
<br>
<input type="text" name="username">
```

**Mark:**
```mark
{img src:"image.jpg" alt:"Description"}
{br}
{input type:"text" name:"username"}
```

## From XML

XML migration is similar to HTML but with more flexible naming.

### Basic XML Document

**XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <database host="localhost" port="5432">
    <credentials>
      <username>admin</username>
      <password>secret</password>
    </credentials>
  </database>
  <features>
    <feature name="logging" enabled="true"/>
    <feature name="caching" enabled="false"/>
  </features>
</configuration>
```

**Mark:**
```mark
{configuration
  {database host:"localhost" port:"5432"
    {credentials
      {username "admin"}
      {password "secret"}
    }
  }
  {features
    {feature name:"logging" enabled:true}
    {feature name:"caching" enabled:false}
  }
}
```

### XML Attributes vs Mark Properties

XML attributes directly map to Mark properties:

**XML:**
```xml
<book isbn="978-0123456789" year="2023" available="true">
  <title>Learning Mark Notation</title>
  <author>Jane Smith</author>
</book>
```

**Mark:**
```mark
{book isbn:"978-0123456789" year:2023 available:true
  {title "Learning Mark Notation"}
  {author "Jane Smith"}
}
```

### XML Namespaces

XML namespaces can be preserved in Mark type names:

**XML:**
```xml
<html:div xmlns:html="http://www.w3.org/1999/xhtml">
  <html:p>Content</html:p>
</html:div>
```

**Mark:**
```mark
{html:div
  {html:p "Content"}
}
```

## Best Practices

### Property Naming

1. **Use camelCase for JavaScript compatibility:**
   ```mark
   {user firstName:"Alice" lastName:"Smith"}
   ```

2. **Quote property names with special characters:**
   ```mark
   {element "data-id":"123" "aria-label":"Button"}
   ```

3. **Use meaningful type names:**
   ```mark
   {userProfile}  // Good
   {obj}          // Avoid
   ```

### Content Organization

1. **Group related properties:**
   ```mark
   {user
     // Identity
     name:"Alice" email:"alice@example.com"
     
     // Preferences  
     theme:"dark" language:"en"
     
     // Content
     "Welcome message"
   }
   ```

2. **Use consistent nesting patterns:**
   ```mark
   {document
     {header {title "Page Title"}}
     {main {content "Body text"}}
     {footer {copyright "2025"}}
   }
   ```

### Migration Strategy

1. **Start with simple structures** and gradually migrate complex ones
2. **Validate migrated data** using Mark.parse() and Mark.stringify()
3. **Create utility functions** for common migration patterns
4. **Test edge cases** like empty objects, special characters, and deep nesting
5. **Document migration decisions** for team consistency

### Common Migration Tools

```javascript
// Generic migration utility
class MarkMigrator {
  constructor(options = {}) {
    this.options = {
      preserveComments: false,
      camelCaseProperties: true,
      ...options
    };
  }
  
  migrate(data, format) {
    switch (format) {
      case 'json': return this.fromJSON(data);
      case 'html': return this.fromHTML(data);
      case 'xml': return this.fromXML(data);
      default: throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  fromJSON(jsonData) {
    // Implementation based on previous examples
  }
  
  fromHTML(htmlString) {
    // Implementation for HTML parsing
  }
  
  fromXML(xmlString) {
    // Implementation for XML parsing
  }
}

// Usage
const migrator = new MarkMigrator();
const markData = migrator.migrate(jsonData, 'json');
```

### Testing Migration

```javascript
// Test migration accuracy
function testMigration(original, migrated, format) {
  // Test that all data is preserved
  if (format === 'json') {
    assert.equal(migrated.constructor.name, original.type);
    for (let key in original) {
      if (key !== 'type' && key !== 'children') {
        assert.deepEqual(migrated[key], original[key]);
      }
    }
  }
  
  // Test round-trip conversion
  const stringified = Mark.stringify(migrated);
  const reparsed = Mark.parse(stringified);
  assert.deepEqual(migrated, reparsed);
}
```

### Performance Considerations

1. **Batch migrations** for large datasets
2. **Use streaming parsers** for huge files
3. **Cache migration results** when possible
4. **Profile memory usage** for complex structures

?> **Migration Tip**: Start with a small subset of your data to validate the migration approach before processing large datasets. Always keep backups of original data during migration.
