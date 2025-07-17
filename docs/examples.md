---
layout: page
title: Examples
description: Practical examples of using Mark Notation in various scenarios
permalink: /examples/
---

Practical examples of using Mark Notation in various scenarios.

## Basic Usage

### Simple Object Creation

```javascript
const Mark = require('mark-js');

// Create a simple greeting
const greeting = Mark('greeting', { lang: 'en' }, ['Hello, World!']);
console.log(Mark.stringify(greeting));
// Output: <greeting lang:"en"; "Hello, World!">

// Parse it back
const parsed = Mark.parse(`<greeting lang:"en"; "Hello, World!">`);
console.log(parsed.lang); // "en"
console.log(parsed[0]); // "Hello, World!"
```

### Working with Properties

```javascript
// Configuration object
const config = Mark.parse(`<config
  <database
    host:"localhost",
    port:5432,
    ssl:true
  >
  <api
    version:"v1",
    timeout:5000
  >
>`);

// Access nested properties
console.log(config.database.host); // "localhost"
console.log(config.api.version); // "v1"
```

## HTML Forms

### Contact Form

```javascript
const contactForm = Mark.parse(`<form
  method:"POST",
  action:"/contact"
  
  <fieldset
    <legend "Contact Information">
    
    <div class:"form-group"
      <label for:name; "Full Name *">
      <input
        type:text,
        id:name,
        name:name,
        required:true
      >
    >
    
    <div class:"form-group"
      <label for:email; "Email Address *">
      <input
        type:email,
        id:email,
        name:email,
        required:true
      >
    >
    
    <div class:"form-actions"
      <button type:submit; "Send Message">
      <button type:reset; "Clear Form">
    >
  >
>`);

// Access form elements
console.log(contactForm.method); // "POST"
console.log(contactForm.action); // "/contact"
```

### Dynamic Form Generation

```javascript
// Form schema
const formSchema = Mark.parse(`<'form-schema'
  title:"User Registration"
  <field name:"username", type:"text", label:"Username", required:true>
  <field name:"email", type:"email", label:"Email Address", required:true>
>`);

// Generate form from schema
function generateForm(schema) {
  const form = Mark('form');
  
  if (schema.title) {
    form.push(Mark('h2', null, [schema.title]));
  }
  
  for (let i = 0; i < schema.length; i++) {
    const field = schema[i];
    if (field.constructor.name === 'field') {
      const formGroup = Mark('div', { class: 'form-group' });
      formGroup.push(Mark('label', { for: field.name }, [field.label]));
      
      const input = Mark('input', {
        type: field.type,
        id: field.name,
        name: field.name,
        required: field.required
      });
      
      formGroup.push(input);
      form.push(formGroup);
    }
  }
  
  form.push(Mark('button', { type: 'submit' }, ['Register']));
  return form;
}
```

## Configuration Files

### Application Configuration

```javascript
const appConfig = Mark.parse(`<config
  <app
    name:"MyApp",
    version:"1.2.3",
    environment:"production",
    debug:false
  >
  
  <server
    host:"0.0.0.0",
    port:8080
    <ssl
      enabled:true,
      cert:"/path/to/cert.pem",
      key:"/path/to/key.pem"
    >
  >
  
  <database
    type:"postgresql",
    host:"db.example.com",
    port:5432,
    name:"myapp_prod"
    <credentials
      username:"app_user",
      password:"secure_password"
    >
  >
>`);

// Access configuration values
console.log(appConfig.app.name); // "MyApp"
console.log(appConfig.server.port); // 8080
```

### Build Configuration

```javascript
const buildConfig = Mark.parse(`<build
  input:"src/index.js"
  <output
    path:"dist",
    filename:"bundle.js"
  >
  
  <plugins
    <babel
      presets:["@babel/preset-env"]
    >
    
    <webpack
      mode:"production"
      <optimization
        minimize:true,
        splitChunks:true
      >
    >
  >
>`);
```

## Document Markup

### Article with Mixed Content

```javascript
const article = Mark.parse(`<article
  <header
    <h1 "Getting Started with Mark Notation">
    <meta
      author:"Jane Developer",
      published:"2025-01-15",
      tags:["tutorial", "markup", "javascript"]
    >
  >
  
  <section class:"introduction"
    <p
      "Mark Notation is a " <em "unified notation"> " for both object and markup data. "
      "Unlike " <code "JSON"> ", which is limited to object data, Mark provides a " 
      <strong "generic solution"> " that combines the best of both worlds."
    >
  >
  
  <section class:"features"
    <h2 "Key Features">
    
    <ul
      <li <strong "Type Safety"> " - Every object has a meaningful type name">
      <li <strong "Mixed Content"> " - Combine structured data with text">
      <li <strong "Clean Syntax"> " - More readable than JSON or XML">
    >
  >
>`);

// Extract metadata
function extractMetadata(article) {
  const meta = article.header.meta;
  return {
    title: article.header.h1[0],
    author: meta.author,
    published: meta.published,
    tags: meta.tags
  };
}
```

## Template Examples

### Email Template

```javascript
const emailTemplate = Mark.parse(`<email
  <header
    from:"noreply@example.com",
    to:"{{user.email}}",
    subject:"Welcome to {{app.name}}, {{user.name}}!"
  >
  
  <body
    <div class:"container"
      <h1 "Welcome {{user.name}}!">
      
      <p "Thank you for signing up for " <strong "{{app.name}}"> ". "
         "We're excited to have you on board!">
      
      <div class:"cta"
        <a href:"{{app.url}}/dashboard", class:"button primary"; "Get Started">
      >
    >
  >
>`);

// Template rendering function
function renderTemplate(template, data) {
  const rendered = Mark.stringify(template);
  return rendered.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.split('.');
    let value = data;
    for (let key of keys) {
      value = value && value[key];
    }
    return value || match;
  });
}

// Render with data
const emailData = {
  user: { name: 'Alice', email: 'alice@example.com' },
  app: { name: 'MyApp', url: 'https://myapp.com' }
};

const renderedEmail = renderTemplate(emailTemplate, emailData);
```
