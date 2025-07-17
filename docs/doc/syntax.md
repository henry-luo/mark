# Syntax Reference

This section provides a complete reference for Mark Notation syntax.

## Overview

Mark Notation extends JSON with a type name and mixed content support, while maintaining a clean and readable syntax.

### Basic Structure

```mark
{type-name property:value property2:value2 "content1" "content2" {nested-object}}
```

## Object Syntax

### Type Names

Every Mark object starts with a type name enclosed in curly braces:

```mark
{greeting}
{user}
{html-element}
{my_custom_type}
```

**Rules for type names:**
- Must start with a letter or underscore
- Can contain letters, numbers, underscores, and hyphens
- Case-sensitive
- Cannot be empty

### Empty Objects

Objects can be empty (no properties or content):

```mark
{empty}
{br}
{spacer}
```

## Properties

Properties are key-value pairs that provide attributes for the object.

### Basic Properties

```mark
{user name:"Alice" age:30 active:true}
{div class:"container" id:main-content}
```

### Property Keys

Property keys can be quoted or unquoted:

```mark
{object
  key1:"value1"           // unquoted key
  "key-2":"value2"        // quoted key (required for special characters)
  'key3':"value3"         // single-quoted key
}
```

### Property Values

#### Strings

```mark
{object
  name:"Alice"            // double quotes
  title:'Software Engineer' // single quotes
  description:`Multi-line
    string content`       // template literals (if supported)
}
```

#### Numbers

```mark
{object
  age:30                  // integer
  score:95.5              // float
  count:-10               // negative
  scientific:1.23e-4      // scientific notation
}
```

#### Booleans

```mark
{object
  active:true
  hidden:false
}
```

#### Arrays

```mark
{object
  tags:["javascript" "tutorial" "beginner"]
  coordinates:[10 20 30]
  mixed:[true 42 "text"]
}
```

#### Objects

```mark
{object
  config:{timeout:5000 retries:3}
  nested:{deep:{value:"here"}}
}
```

#### Null Values

```mark
{object
  optional:null
  empty:null
}
```

## Content

Content is an ordered list of items that can be strings, numbers, booleans, or nested objects.

### Mixed Content

```mark
{paragraph
  "This is a "
  {strong "bold"}
  " word in a sentence."
}
```

### Multiple Content Items

```mark
{list
  "First item"
  "Second item"
  {item special:true "Third item"}
}
```

### Content with Properties

```mark
{article title:"My Article" author:"John"
  {h1 "Introduction"}
  {p "This is the first paragraph."}
  {p "This is the second paragraph."}
}
```

## Comments

Mark supports comments for documentation:

### Single-line Comments

```mark
{config
  // This is a comment
  host:"localhost"        // End-of-line comment
  port:3000
}
```

### Multi-line Comments

```mark
{config
  /*
   * Multi-line comment
   * with detailed explanation
   */
  host:"localhost"
  port:3000
}
```

### Pragma Comments

Special comment syntax for metadata:

```mark
{document
  (?version 1.0?)
  (?encoding utf-8?)
  {content "Document body"}
}
```

## Data Types

### Primitive Types

| Type | Syntax | Example |
|------|--------|---------|
| String | `"text"` or `'text'` | `"Hello World"` |
| Integer | `123` | `42` |
| Float | `123.45` | `3.14159` |
| Boolean | `true` or `false` | `true` |
| Null | `null` | `null` |

### Complex Types

#### Arrays

```mark
{data
  numbers:[1 2 3 4 5]
  strings:["a" "b" "c"]
  mixed:[true 42 "text" null]
  nested:[[1 2] [3 4]]
}
```

#### Nested Objects

```mark
{user
  name:"Alice"
  profile:{
    bio:"Software developer"
    location:{
      city:"San Francisco"
      country:"USA"
    }
  }
}
```

## Special Syntax Features

### Optional Commas

Commas between properties and content items are optional:

```mark
{object
  prop1:"value1"
  prop2:"value2"
  "content1"
  "content2"
}
```

### Trailing Commas

Trailing commas are allowed:

```mark
{object
  prop1:"value1",
  prop2:"value2",
  "content1",
  "content2",
}
```

### Multiline Support

Objects can span multiple lines for readability:

```mark
{form
  method:"POST"
  action:"/submit"
  
  {fieldset
    {legend "Personal Information"}
    
    {div class:"field"
      {label for:name "Name:"}
      {input type:text id:name required:true}
    }
    
    {div class:"field"
      {label for:email "Email:"}
      {input type:email id:email}
    }
  }
  
  {button type:submit "Submit"}
}
```

### Whitespace Rules

- Whitespace between tokens is ignored
- Newlines are treated as whitespace
- Indentation is for readability only
- String content preserves internal whitespace

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
{user name:"Alice"
  {post title:"Hello World" "This is my first post."}
}
```

### Mark vs HTML

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
