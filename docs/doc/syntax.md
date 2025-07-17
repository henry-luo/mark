# Syntax Reference

Mark syntax is a superset of JSON. The primary extension that Mark makes to JSON is the introduction of a new element notation to support markup data, commonly seen in HTML and XML.

## Overview

Mark Notation extends JSON with a type name and mixed content support, while maintaining a clean and readable syntax.

### Basic Structure

```mark
<type-name property:value property2:value2 "content1" "content2" <nested-object>>
```

## Mark Element

Below are the key grammar rules for the new Mark element in BNF notation:

```BNF
element ::= '<' type_name properties contents '>'

type_name ::= identifier | symbol
```

*(Note: for clarity, whitespace rules are omitted in the grammar above. You can refer to the [formal BNF](../mark.bnf).)*

Comparing to a JSON object, a Mark element has two extensions:

- A **type name**, which corresponds to class name or type name of an object. In JavaScript, that is `obj.constructor.name`. In HTML and XML, that's the element name.
- Optional list of **content** values following the named properties, which corresponds to child nodes in markup documents like HTML and XML.

## Object Syntax

### Type Names

Every Mark object starts with a type name enclosed in angle brackets:

```mark
<greeting>
<user>
<html-element>
<my_custom_type>
```

**Rules for type names:**
- Must start with a letter or underscore
- Can contain letters, numbers, underscores, and hyphens
- Case-sensitive
- Cannot be empty

### Empty Objects

Objects can be empty (no properties or content):

```mark
<empty>
<br>
<spacer>
```

## Properties

Properties are key-value pairs that provide attributes for the object.

### Element Properties

```BNF
properties ::= (property ','?)*

property ::= key ':' value

identifier ::= begin_identifier continue_identifier*

begin_identifier ::= [a-zA-Z] | '_' | '$'

continue_identifier ::= begin_identifier | digit | '-' | '.'
```

- Property key and value can be unquoted if they're valid identifiers. JS reserved keywords (like `default`) are valid unquoted keys in Mark. However, it is recommended that you avoid using JS keywords, or JS and Mark object prototype function names as property keys, as they could cause confusion, inconvenience and even errors (as the underlying functions are overridden).
- Comparing to JS identifier, Mark identifier allows dash '-' and dot '.' in it. These two special characters are added as they are commonly used in markup formats, like HTML, CSS, XML.
- Property keys and values can be single, double or triple quoted.
- Property keys can be any string **except a number**, which is reserved for Mark object contents. (This restriction does not apply to JSON properties.)
- Property keys are **case-sensitive**.
- Property keys **must be unique** (for both Mark and JSON object).
- Comma between properties is optional, and last property can have trailing comma.

### Basic Properties

```mark
<user name:"Alice" age:30 active:true>
<div class:"container" id:main-content>
```

### Property Keys

Property keys can be quoted or unquoted:

```mark
<object
  key1:"value1"           // unquoted key
  "key-2":"value2"        // quoted key (required for special characters)
  'key3':"value3"         // single-quoted key
>
```

### Property Values

#### Strings

```mark
<object
  name:"Alice"            // double quotes
  title:'Software Engineer' // single quotes (symbol)
  description:"Multi-line
    string content"       // strings can span multiple lines
>
```

#### Numbers

```mark
<object
  age:30                  // integer
  score:95.5              // float
  count:-10               // negative
  scientific:1.23e-4      // scientific notation
  bigint:123n             // big integer
>
```

#### Booleans

```mark
<object
  active:true
  hidden:false
>
```

#### Arrays

```mark
<object
  tags:["javascript" "tutorial" "beginner"]
  coordinates:[10 20 30]
  mixed:[true 42 "text"]
>
```

#### Objects

```mark
<object
  config:{timeout:5000 retries:3}
  nested:{deep:{value:"here"}}
>
```

#### Null Values

```mark
<object
  optional:null
  empty:null
>
```

## Content

Content is an ordered list of items that follows the properties in a Mark element.

### Element Contents

```BNF
contents ::= (text | binary | json_object | mark_object | mark_pragma)*
```

- To better support mixed content, not all Mark values are allowed in the contents of a Mark object. Array, number, boolean and null values are not allowed in content.
- Consecutive text values are merged into a single text value.

### Mixed Content

```mark
<paragraph
  "This is a "
  <strong "bold">
  " word in a sentence."
>
```

### Multiple Content Items

```mark
<list
  "First item"
  "Second item"
  <item special:true "Third item">
>
```

### Content with Properties

```mark
<article title:"My Article" author:"John"
  <h1 "Introduction">
  <p "This is the first paragraph.">
  <p "This is the second paragraph.">
>
```

## Comments

Mark supports comments for documentation:

### Single-line Comments

```mark
<config
  // This is a comment
  host:"localhost"        // End-of-line comment
  port:3000
>
```

### Multi-line Comments

```mark
<config
  /*
   * Multi-line comment
   * with detailed explanation
   */
  host:"localhost"
  port:3000
>
```

**Note**: Mark block comments can be nested, unlike JavaScript block comments.

### Pragma Comments

Special comment syntax for metadata:

```mark
<document
  (?version 1.0?)
  (?encoding utf-8?)
  <content "Document body">
>
```

## Data Types

### Primitive Types

| Type | Syntax | Example | Note |
|------|--------|---------|------|
| String | `"text"` | `"Hello World"` | Double quotes only |
| Symbol | `'text'` or `identifier` | `'hello'` or `hello` | Single quotes or unquoted |
| Integer | `123` | `42` | Standard integers |
| Float | `123.45` | `3.14159` | Decimal numbers |
| BigInt | `123n` | `9007199254740991n` | Large integers |
| Boolean | `true` or `false` | `true` | Boolean values |
| Null | `null` | `null` | Null value |

### Special Types

#### Datetime

ISO 8601 datetime strings quoted in `t'...'`:

```mark
<event
  start:t'2025-01-01T10:00:00Z'
  end:t'2025-01-01 15:30:00-08:00'
>
```

#### Binary Data

Binary data encoded in hex or base64:

```mark
<data
  hex:b'\x48656c6c6f'           // "Hello" in hex
  base64:b'\64SGVsbG8='         // "Hello" in base64
>
```

### Complex Types

#### Arrays

```mark
<data
  numbers:[1 2 3 4 5]
  strings:["a" "b" "c"]
  mixed:[true 42 "text" null]
  nested:[[1 2] [3 4]]
>
```

#### JSON Objects

Regular JSON objects (without type names):

```mark
<user
  name:"Alice"
  profile:{
    bio:"Software developer"
    location:{
      city:"San Francisco"
      country:"USA"
    }
  }
>
```

## Other Syntax Extensions to JSON

### Root Level

JSON allows only one value at root-level.

Mark allows multiple values at root-level, separated by ';' or line break.

### String Enhancements

- Strings under Mark can only be double quoted. (Single quoted is for *symbol* under Mark.)
- Strings can span across multiple lines.
- Unlike JSON string, control characters, like Tab and Line Feed, are allowed in Mark string. Actually, all Unicode characters are allowed in Mark string, just like JS string. Only double-quote ("), and back-slash (\\) need to be escaped.

### Number Enhancements

- Numbers can begin or end with a (leading or trailing) decimal point.
- Numbers can include `inf`, `-inf`, `nan`, and `-nan`.
- Numbers can begin with an explicit plus sign.
- Mark supports big *decimal* number. It is a integer or decimal number postfixed with 'N' or 'n', e.g. 123n.

## Special Syntax Features

### Optional Commas

Commas between properties and content items are optional:

```mark
<object
  prop1:"value1"
  prop2:"value2"
  "content1"
  "content2"
>
```

### Trailing Commas

Trailing commas are allowed:

```mark
<object
  prop1:"value1",
  prop2:"value2",
  "content1",
  "content2",
>
```

### Multiline Support

Objects can span multiple lines for readability:

```mark
<form
  method:"POST"
  action:"/submit"
  
  <fieldset
    <legend "Personal Information">
    
    <div class:"field"
      <label for:name "Name:">
      <input type:text id:name required:true>
    >
    
    <div class:"field"
      <label for:email "Email:">
      <input type:email id:email>
    >
  >
  
  <button type:submit "Submit">
>
```

### Whitespace Rules

- Whitespace between tokens is ignored
- Newlines are treated as whitespace
- Indentation is for readability only
- String content preserves internal whitespace

## Full Grammar Specification

The formal grammar specification in BNF is available [here](../mark.bnf).

Following the JSON convention, a [railroad diagram](../mark-grammar.html) of the entire grammar is also provided to help you visualize the grammar. You can click on the grammar terms to navigate around.

## Syntax Comparison

### Mark vs JSON

**JSON:**
```json
{
  "type": "user",
  "name": "Alice",
  "posts": [
    {
      "type": "post",
      "title": "Hello World",
      "content": "This is my first post."
    }
  ]
}
```

**Mark:**
```mark
<user name:"Alice"
  <post title:"Hello World" "This is my first post.">
>
```

### Mark vs HTML

**HTML:**
```html
<form method="POST" action="/submit">
  <div class="form-group">
    <label for="email">Email:</label>
    <input type="email" id="email" required>
  </div>
  <button type="submit">Submit</button>
</form>
```

**Mark:**
```mark
<form method:"POST" action:"/submit"
  <div class:"form-group"
    <label for:email "Email:">
    <input type:email id:email required:true>
  >
  <button type:submit "Submit">
>
```

### Mark vs XML

**XML:**
```xml
<book id="123" category="fiction">
  <title>The Great Novel</title>
  <author>Jane Doe</author>
  <price currency="USD">29.99</price>
</book>
```

**Mark:**
```mark
<book id:123 category:fiction
  <title "The Great Novel">
  <author "Jane Doe">
  <price currency:"USD" 29.99>
>
```

## Best Practices

1. **Use consistent indentation** for readability
2. **Prefer unquoted keys** when possible for cleaner syntax
3. **Group related properties** together
4. **Use meaningful type names** that describe the data
5. **Leverage mixed content** for document-oriented data
6. **Add comments** to explain complex structures

**HTML:**
```html
<div class="container">
  <h1>Welcome</h1>
  <p>Hello, <strong>world</strong>!</p>
</div>
```

**Mark:**
```mark
{div class:"container"
  {h1 "Welcome"}
  {p "Hello, " {strong "world"} "!"}
}
```

## Error Handling

### Common Syntax Errors

1. **Missing closing brace:**
```mark
{object property:"value"  // Error: missing }
```

2. **Invalid property syntax:**
```mark
{object "key""value"}     // Error: missing colon
```

3. **Unmatched quotes:**
```mark
{object text:"unclosed}   // Error: unmatched quote
```

4. **Invalid type name:**
```mark
{123invalid}              // Error: type name can't start with number
```

### Best Practices

1. **Use consistent indentation** for readability
2. **Quote property keys** with special characters
3. **Add comments** for complex structures
4. **Group related properties** together
5. **Use meaningful type names**

!> **Important**: Mark parsers should provide clear error messages with line and column information to help debug syntax issues.
