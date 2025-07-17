---
layout: page
title: Getting Started
description: Getting Started with Mark Notation
permalink: /getting-started/
---
# Getting Started

This guide will help you get started with Mark Notation quickly and easily.

## Installation

### Node.js / npm

Install Mark.js from npm:

```bash
npm install mark-js --save
```

For TypeScript projects, the package includes type definitions:

```bash
npm install mark-js @types/mark-js --save
```

### Browser

#### Via CDN

Include Mark.js directly from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/mark-js/dist/mark.js"></script>
```

#### Download

Download the latest release from [GitHub](https://github.com/henry-luo/mark/releases) and include it in your project:

```html
<script src="path/to/mark.js"></script>
```

## Quick Start

### Basic Parsing

```javascript
const Mark = require('mark-js');

// Parse a simple Mark object
const obj = Mark.parse(`<greeting "Hello, World!">`);

console.log(obj.constructor.name); // "greeting"
console.log(obj[0]); // "Hello, World!"
```

### Creating Mark Objects

```javascript
// Using the constructor function
const greeting = Mark('greeting', { lang: 'en' }, ['Hello, World!']);

// Convert to Mark notation string
console.log(Mark.stringify(greeting));
// Output: <greeting lang:en "Hello, World!">
```

### Working with Properties

```javascript
const element = Mark.parse(`<div class:"container" id:main>`);

console.log(element.class); // "container"
console.log(element.id); // "main"
```

## Basic Examples

### Simple HTML-like Structure

```javascript
const form = Mark.parse(`<form
  <div class:"form-group"
    <label for:email "Email:">
    <input type:email id:email required:true>
  >
  <div class:"form-group"
    <label for:password "Password:">
    <input type:password id:password>
  >
  <button type:submit "Sign In">
>`);

// Access form elements
console.log(form[0].constructor.name); // "div"
console.log(form[0].class); // "form-group"
```

### Configuration Data

```javascript
const config = Mark.parse(`<config
  <database
    host:"localhost"
    port:5432
    name:"myapp"
    <credentials
      username:"admin"
      password:"secret"
    >
  >
  <features
    logging:true
    debug:false
    <cache ttl:3600 size:1000>
  >
>`);

// Access configuration values
console.log(config.database.host); // "localhost"
console.log(config.features.logging); // true
```

### Mixed Content Document

```javascript
const article = Mark.parse(`<article
  <header
    <h1 "Getting Started with Mark">
    <meta author:"John Doe" date:"2025-01-01">
  >
  <section
    <p "Mark Notation combines the " <em "best features"> " of JSON, HTML, and XML.">
    <code lang:javascript "const obj = Mark.parse('<greeting>');>
    <p "This makes it ideal for configuration files and document markup.">
  >
>`);

// Navigate the document structure
console.log(article.header.h1[0]); // "Getting Started with Mark"
console.log(article.section.p[1].constructor.name); // "em"
```

## Key Concepts

### Type Names

Every Mark object has a type name that identifies what kind of data it represents:

```javascript
const obj = Mark.parse(`<user name:"Alice">`);
console.log(obj.constructor.name); // "user"
```

### Properties vs Content

Mark objects can have both properties (key-value pairs) and content (ordered list):

```javascript
const element = Mark.parse(`<div class:"container" "Some text" <span "nested">>`);

// Properties
console.log(element.class); // "container"

// Content (indexed properties)
console.log(element[0]); // "Some text"
console.log(element[1].constructor.name); // "span"
```

### JavaScript Integration

Mark objects are plain JavaScript objects, so you can use standard JavaScript methods:

```javascript
const list = Mark.parse(`<list "item1" "item2" "item3">`);

// Use array methods on content
console.log(list.length); // 3
list.forEach((item, index) => {
  console.log(`${index}: ${item}`);
});

// Add new content
list.push("item4");
```

## Next Steps

- Learn about the complete [Syntax Reference](syntax.md)
- Understand the [Data Model](data-model.md)
- Explore the [API Reference](api.md)
- See more [Examples](examples.md)

?> **Tip**: Mark Notation is designed to be intuitive. If you're familiar with JSON or HTML, you'll find Mark easy to learn and use.
