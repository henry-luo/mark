# Examples

This section provides practical examples of using Mark Notation in various scenarios.

## Basic Usage

### Simple Object Creation

```javascript
const Mark = require('mark-js');

// Create a simple greeting
const greeting = Mark('greeting', { lang: 'en' }, ['Hello, World!']);
console.log(Mark.stringify(greeting));
// Output: {greeting lang:"en" "Hello, World!"}

// Parse it back
const parsed = Mark.parse(`{greeting lang:"en" "Hello, World!"}`);
console.log(parsed.lang); // "en"
console.log(parsed[0]); // "Hello, World!"
```

### Working with Properties

```javascript
// Configuration object
const config = Mark.parse(`{config
  database:{
    host:"localhost"
    port:5432
    ssl:true
  }
  api:{
    version:"v1"
    timeout:5000
  }
}`);

// Access nested properties
console.log(config.database.host); // "localhost"
console.log(config.api.version); // "v1"

// Modify properties
config.database.host = "production.db.com";
config.api.timeout = 10000;
```

## HTML Forms

### Contact Form

```javascript
const contactForm = Mark.parse(`{form
  method:"POST"
  action:"/contact"
  class:"contact-form"
  
  {fieldset
    {legend "Contact Information"}
    
    {div class:"form-group"
      {label for:name "Full Name *"}
      {input
        type:text
        id:name
        name:name
        required:true
        placeholder:"Enter your full name"
      }
    }
    
    {div class:"form-group"
      {label for:email "Email Address *"}
      {input
        type:email
        id:email
        name:email
        required:true
        placeholder:"your.email@example.com"
      }
    }
    
    {div class:"form-group"
      {label for:subject "Subject"}
      {select id:subject name:subject
        {option value:"" "Select a subject"}
        {option value:"general" "General Inquiry"}
        {option value:"support" "Technical Support"}
        {option value:"billing" "Billing Question"}
      }
    }
    
    {div class:"form-group"
      {label for:message "Message *"}
      {textarea
        id:message
        name:message
        rows:5
        required:true
        placeholder:"Type your message here..."
      }
    }
    
    {div class:"form-actions"
      {button type:submit class:"btn btn-primary" "Send Message"}
      {button type:reset class:"btn btn-secondary" "Clear Form"}
    }
  }
}`);

// Convert to HTML-like structure
function toHTML(markObj) {
  if (typeof markObj === 'string') return markObj;
  
  const typeName = markObj.constructor.name;
  const props = Mark.getProperties(markObj);
  const content = Mark.getContent(markObj);
  
  let html = `<${typeName}`;
  for (let [key, value] of Object.entries(props)) {
    html += ` ${key}="${value}"`;
  }
  html += '>';
  
  content.forEach(item => {
    html += toHTML(item);
  });
  
  html += `</${typeName}>`;
  return html;
}
```

### Dynamic Form Generation

```javascript
// Form schema
const formSchema = Mark.parse(`{form-schema
  title:"User Registration"
  {field
    name:username
    type:text
    label:"Username"
    required:true
    validation:{minLength:3 maxLength:20}
  }
  {field
    name:email
    type:email
    label:"Email Address"
    required:true
  }
  {field
    name:password
    type:password
    label:"Password"
    required:true
    validation:{minLength:8}
  }
  {field
    name:confirm
    type:password
    label:"Confirm Password"
    required:true
    validation:{matches:"password"}
  }
}`);

// Generate form from schema
function generateForm(schema) {
  const form = Mark('form');
  
  // Add title
  if (schema.title) {
    form.push(Mark('h2', null, [schema.title]));
  }
  
  // Generate fields
  for (let i = 0; i < schema.length; i++) {
    const field = schema[i];
    if (field.constructor.name === 'field') {
      const formGroup = Mark('div', { class: 'form-group' });
      
      // Label
      formGroup.push(Mark('label', { for: field.name }, [field.label]));
      
      // Input
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
  
  // Submit button
  form.push(Mark('button', { type: 'submit' }, ['Register']));
  
  return form;
}

const dynamicForm = generateForm(formSchema);
```

## Configuration Files

### Application Configuration

```javascript
const appConfig = Mark.parse(`{config
  app:{
    name:"MyApp"
    version:"1.2.3"
    environment:"production"
    debug:false
  }
  
  server:{
    host:"0.0.0.0"
    port:8080
    ssl:{
      enabled:true
      cert:"/path/to/cert.pem"
      key:"/path/to/key.pem"
    }
  }
  
  database:{
    type:"postgresql"
    host:"db.example.com"
    port:5432
    name:"myapp_prod"
    pool:{
      min:2
      max:10
      idle:30000
    }
    {credentials
      username:"app_user"
      password:"secure_password"
    }
  }
  
  redis:{
    host:"cache.example.com"
    port:6379
    db:0
    ttl:3600
  }
  
  logging:{
    level:"info"
    format:"json"
    {outputs
      {console enabled:true}
      {file enabled:true path:"/var/log/myapp.log"}
      {syslog enabled:false}
    }
  }
  
  features:{
    user_registration:true
    email_verification:true
    password_reset:true
    two_factor_auth:false
  }
}`);

// Access configuration values
console.log(appConfig.app.name); // "MyApp"
console.log(appConfig.server.port); // 8080
console.log(appConfig.database.pool.max); // 10

// Environment-specific overrides
function applyEnvironmentConfig(config, env) {
  if (env === 'development') {
    config.app.debug = true;
    config.server.host = 'localhost';
    config.logging.level = 'debug';
  }
  return config;
}
```

### Build Configuration

```javascript
const buildConfig = Mark.parse(`{build
  input:"src/index.js"
  output:{
    path:"dist"
    filename:"bundle.js"
  }
  
  {plugins
    {babel
      presets:["@babel/preset-env"]
      plugins:["@babel/plugin-transform-runtime"]
    }
    
    {webpack
      mode:"production"
      optimization:{
        minimize:true
        splitChunks:true
      }
    }
    
    {postcss
      plugins:["autoprefixer" "cssnano"]
    }
  }
  
  {targets
    browsers:["> 1%" "last 2 versions"]
    node:"14"
  }
  
  dev:{
    port:3000
    hot:true
    open:true
  }
}`);

// Convert to webpack config
function toWebpackConfig(markConfig) {
  return {
    entry: markConfig.input,
    output: {
      path: markConfig.output.path,
      filename: markConfig.output.filename
    },
    mode: markConfig.plugins.webpack.mode,
    optimization: markConfig.plugins.webpack.optimization,
    devServer: markConfig.dev
  };
}
```

## Document Markup

### Article with Mixed Content

```javascript
const article = Mark.parse(`{article
  {header
    {h1 "Getting Started with Mark Notation"}
    {meta
      author:"Jane Developer"
      published:"2025-01-15"
      tags:["tutorial" "markup" "javascript"]
    }
  }
  
  {section class:"introduction"
    {p
      "Mark Notation is a " {em "unified notation"} " for both object and markup data. "
      "Unlike " {code "JSON"} ", which is limited to object data, or " {code "HTML"} ", "
      "which is specialized for web content, Mark provides a " {strong "generic solution"} 
      " that combines the best of both worlds."
    }
    
    {blockquote cite:"https://mark.js.org"
      "Mark overcomes many limitations of popular data formats while maintaining "
      "a clean syntax and simple data model."
    }
  }
  
  {section class:"syntax-examples"
    {h2 "Syntax Examples"}
    
    {p "Here's how the same data looks in different formats:"}
    
    {div class:"code-comparison"
      {div class:"example"
        {h3 "Mark Notation"}
        {pre {code lang:"mark" 
          "{user name:\"Alice\" age:30\\n  {profile bio:\"Developer\"}\\n}"
        }}
      }
      
      {div class:"example"
        {h3 "JSON"}
        {pre {code lang:"json"
          "{\\n  \"type\": \"user\",\\n  \"name\": \"Alice\",\\n  \"age\": 30,\\n  \"profile\": {\\n    \"type\": \"profile\",\\n    \"bio\": \"Developer\"\\n  }\\n}"
        }}
      }
    }
  }
  
  {section class:"features"
    {h2 "Key Features"}
    
    {ul
      {li {strong "Type Safety"} " - Every object has a meaningful type name"}
      {li {strong "Mixed Content"} " - Combine structured data with text"}
      {li {strong "Clean Syntax"} " - More readable than JSON or XML"}
      {li {strong "JavaScript Native"} " - Maps directly to plain objects"}
    }
  }
  
  {footer
    {p "Last updated: " {time datetime:"2025-01-15" "January 15, 2025"}}
    {p {a href:"#top" "Back to top"}}
  }
}`);

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

const metadata = extractMetadata(article);
console.log(metadata);
// {
//   title: "Getting Started with Mark Notation",
//   author: "Jane Developer", 
//   published: "2025-01-15",
//   tags: ["tutorial", "markup", "javascript"]
// }
```

### Documentation with Code Examples

```javascript
const documentation = Mark.parse(`{documentation
  {section id:"installation"
    {h2 "Installation"}
    
    {p "Install Mark.js using npm:"}
    
    {pre {code lang:"bash" "npm install mark-js --save"}}
    
    {p "Or include it directly in your HTML:"}
    
    {pre {code lang:"html"
      "<script src=\"https://cdn.jsdelivr.net/npm/mark-js/dist/mark.js\"></script>"
    }}
  }
  
  {section id:"usage"
    {h2 "Basic Usage"}
    
    {p "Parse a Mark string:"}
    
    {pre {code lang:"javascript"
      "const Mark = require('mark-js');\\n"
      "const obj = Mark.parse('{user name:\"Alice\"}');\\n"
      "console.log(obj.name); // \"Alice\""
    }}
    
    {div class:"tip"
      {p {strong "Tip:"} " Mark objects are plain JavaScript objects, "
         "so you can use all standard object methods and properties."}
    }
  }
  
  {section id:"advanced"
    {h2 "Advanced Features"}
    
    {h3 "Nested Objects"}
    {p "Mark supports arbitrary nesting:"}
    
    {pre {code lang:"mark"
      "{config\\n"
      "  database:{\\n"
      "    host:\"localhost\"\\n"
      "    credentials:{\\n"
      "      username:\"admin\"\\n"
      "      password:\"secret\"\\n"
      "    }\\n"
      "  }\\n"
      "}"
    }}
    
    {h3 "Mixed Content"}
    {p "Combine text and objects seamlessly:"}
    
    {pre {code lang:"mark"
      "{paragraph\\n"
      "  \"This is \" {em \"emphasized\"} \" text.\"\\n"
      "}"
    }}
  }
}`);

// Generate table of contents
function generateTOC(doc) {
  const toc = Mark('nav', { class: 'table-of-contents' });
  const list = Mark('ul');
  
  for (let i = 0; i < doc.length; i++) {
    const section = doc[i];
    if (section.constructor.name === 'section' && section.id) {
      const heading = section.h2 || section.h3;
      if (heading) {
        const link = Mark('a', { href: `#${section.id}` }, [heading[0]]);
        const item = Mark('li', null, [link]);
        list.push(item);
      }
    }
  }
  
  toc.push(list);
  return toc;
}
```

## Template Examples

### Email Template

```javascript
const emailTemplate = Mark.parse(`{email
  {header
    from:"noreply@example.com"
    to:"{{user.email}}"
    subject:"Welcome to {{app.name}}, {{user.name}}!"
  }
  
  {body
    {div class:"container"
      {div class:"header"
        {img src:"{{app.logo}}" alt:"{{app.name}} Logo"}
        {h1 "Welcome {{user.name}}!"}
      }
      
      {div class:"content"
        {p "Thank you for signing up for " {strong "{{app.name}}"} ". "
           "We're excited to have you on board!"}
        
        {p "Here's what you can do next:"}
        
        {ul
          {li "Complete your profile"}
          {li "Explore our features"}
          {li "Connect with other users"}
        }
        
        {div class:"cta"
          {a href:"{{app.url}}/dashboard" class:"button primary"
            "Get Started"
          }
        }
      }
      
      {div class:"footer"
        {p "If you have any questions, feel free to " 
           {a href:"mailto:support@example.com" "contact us"} "."}
        
        {p class:"unsubscribe"
          {a href:"{{unsubscribe.url}}" "Unsubscribe from these emails"}
        }
      }
    }
  }
}`);

// Template rendering function
function renderTemplate(template, data) {
  const rendered = Mark.clone(template);
  
  function replaceVariables(obj) {
    if (typeof obj === 'string') {
      return obj.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const keys = path.split('.');
        let value = data;
        for (let key of keys) {
          value = value && value[key];
        }
        return value || match;
      });
    }
    
    if (obj && typeof obj === 'object') {
      // Replace in properties
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = replaceVariables(obj[key]);
        } else if (typeof obj[key] === 'object') {
          replaceVariables(obj[key]);
        }
      }
    }
    
    return obj;
  }
  
  return replaceVariables(rendered);
}

// Render with data
const emailData = {
  user: { name: 'Alice', email: 'alice@example.com' },
  app: { name: 'MyApp', logo: '/logo.png', url: 'https://myapp.com' },
  unsubscribe: { url: 'https://myapp.com/unsubscribe?token=abc123' }
};

const renderedEmail = renderTemplate(emailTemplate, emailData);
```

### Component Template

```javascript
const componentTemplate = Mark.parse(`{component name:"UserCard"
  {props
    {prop name:user type:object required:true}
    {prop name:showEmail type:boolean default:false}
    {prop name:size type:string default:"medium"}
  }
  
  {template
    {div class:"user-card user-card--{{size}}"
      {div class:"user-card__avatar"
        {img src:"{{user.avatar}}" alt:"{{user.name}}"}
      }
      
      {div class:"user-card__info"
        {h3 class:"user-card__name" "{{user.name}}"}
        {p class:"user-card__title" "{{user.title}}"}
        
        {if condition:"{{showEmail}}"
          {p class:"user-card__email" "{{user.email}}"}
        }
        
        {div class:"user-card__stats"
          {span "{{user.posts}} posts"}
          {span "{{user.followers}} followers"}
        }
      }
    }
  }
  
  {styles
    ".user-card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; }"
    ".user-card--small { padding: 8px; }"
    ".user-card--large { padding: 24px; }"
    ".user-card__avatar img { width: 64px; height: 64px; border-radius: 50%; }"
  }
}`);

// Component instance
const userCardInstance = Mark.parse(`{UserCard
  user:{
    name:"Alice Johnson"
    title:"Senior Developer"
    email:"alice@example.com"
    avatar:"/avatars/alice.jpg"
    posts:42
    followers:156
  }
  showEmail:true
  size:"large"
}`);
```

?> **Performance Note**: These examples demonstrate Mark's flexibility for various use cases. For production applications, consider implementing caching for parsed templates and optimizing rendering functions for your specific needs.
