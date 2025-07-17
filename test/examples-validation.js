const test = require('tape');
const Mark = require('./../mark.js');

// Helper function to find child element by type name
function findChild(parent, typeName) {
    for (let i = 0; i < parent.length; i++) {
        if (parent[i] && parent[i].constructor.name === typeName) {
            return parent[i];
        }
    }
    return null;
}

// Helper function to create a property-like access for children
function createProxy(obj) {
    const proxy = Object.create(obj);
    
    return new Proxy(proxy, {
        get(target, prop) {
            // First try normal property access
            if (prop in target) {
                return target[prop];
            }
            
            // Then try to find child by constructor name
            const child = findChild(target, prop);
            return child ? createProxy(child) : undefined;
        }
    });
}

// Test all examples from examples.md to ensure they work properly
test('Examples.md - Basic Usage - Simple Object Creation', function(assert) {
    try {
        // Create a simple greeting
        const greeting = Mark('greeting', { lang: 'en' }, ['Hello, World!']);
        const stringified = Mark.stringify(greeting);
        assert.equal(stringified, '<greeting lang:"en"; "Hello, World!">', 'Should stringify greeting correctly');

        // Parse it back
        const parsed = Mark.parse(`<greeting lang:"en"; "Hello, World!">`);
        assert.equal(parsed.lang, 'en', 'Should parse lang property correctly');
        assert.equal(parsed[0], 'Hello, World!', 'Should parse text content correctly');
        
        assert.end();
    } catch (error) {
        assert.fail(`Simple Object Creation example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - Basic Usage - Working with Properties', function(assert) {
    try {
        // Configuration object
        const config = createProxy(Mark.parse(`<config
  <database
    host:"localhost",
    port:5432,
    ssl:true
  >
  <api
    version:"v1",
    timeout:5000
  >
>`));

        // Access nested properties
        assert.equal(config.database.host, 'localhost', 'Should access nested database host');
        assert.equal(config.api.version, 'v1', 'Should access nested api version');
        assert.equal(config.database.port, 5432, 'Should parse port as number');
        assert.equal(config.database.ssl, true, 'Should parse ssl as boolean');
        assert.equal(config.api.timeout, 5000, 'Should parse timeout as number');
        
        assert.end();
    } catch (error) {
        assert.fail(`Working with Properties example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - HTML Forms - Contact Form', function(assert) {
    try {
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
        assert.equal(contactForm.method, 'POST', 'Should parse form method');
        assert.equal(contactForm.action, '/contact', 'Should parse form action');
        assert.equal(contactForm.constructor.name, 'form', 'Should have form constructor name');
        
        assert.end();
    } catch (error) {
        assert.fail(`Contact Form example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - HTML Forms - Dynamic Form Generation', function(assert) {
    try {
        // Form schema - need to quote the field names to get strings instead of symbols
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

        // Test the schema parsing
        assert.equal(formSchema.title, 'User Registration', 'Should parse schema title');
        assert.equal(formSchema.length, 2, 'Should have 2 fields');
        assert.equal(formSchema[0].name, 'username', 'Should parse first field name');
        assert.equal(formSchema[1].name, 'email', 'Should parse second field name');

        // Test form generation
        const generatedForm = generateForm(formSchema);
        assert.equal(generatedForm.constructor.name, 'form', 'Should generate form object');
        assert.ok(generatedForm.length >= 3, 'Generated form should have multiple elements');
        
        assert.end();
    } catch (error) {
        assert.fail(`Dynamic Form Generation example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - Configuration Files - Application Configuration', function(assert) {
    try {
        const appConfig = createProxy(Mark.parse(`<config
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
>`));

        // Access configuration values
        assert.equal(appConfig.app.name, 'MyApp', 'Should parse app name');
        assert.equal(appConfig.server.port, 8080, 'Should parse server port');
        assert.equal(appConfig.app.version, '1.2.3', 'Should parse app version');
        assert.equal(appConfig.app.environment, 'production', 'Should parse environment');
        assert.equal(appConfig.app.debug, false, 'Should parse debug flag');
        assert.equal(appConfig.server.ssl.enabled, true, 'Should parse SSL enabled');
        assert.equal(appConfig.database.credentials.username, 'app_user', 'Should parse nested credentials');
        
        assert.end();
    } catch (error) {
        assert.fail(`Application Configuration example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - Configuration Files - Build Configuration', function(assert) {
    try {
        const buildConfig = createProxy(Mark.parse(`<build
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
>`));

        // Test build configuration parsing
        assert.equal(buildConfig.input, 'src/index.js', 'Should parse input path');
        assert.equal(buildConfig.output.path, 'dist', 'Should parse output path');
        assert.equal(buildConfig.output.filename, 'bundle.js', 'Should parse output filename');
        assert.equal(buildConfig.plugins.webpack.mode, 'production', 'Should parse webpack mode');
        assert.equal(buildConfig.plugins.webpack.optimization.minimize, true, 'Should parse optimization settings');
        assert.deepEqual(buildConfig.plugins.babel.presets, ['@babel/preset-env'], 'Should parse babel presets array');
        
        assert.end();
    } catch (error) {
        assert.fail(`Build Configuration example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - Document Markup - Article with Mixed Content', function(assert) {
    try {
        const article = createProxy(Mark.parse(`<article
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
>`));

        // Extract metadata function from example
        function extractMetadata(article) {
            const meta = article.header.meta;
            return {
                title: article.header.h1[0],
                author: meta.author,
                published: meta.published,
                tags: meta.tags
            };
        }

        // Test article structure
        assert.equal(article.constructor.name, 'article', 'Should have article constructor');
        assert.equal(article.header.h1[0], 'Getting Started with Mark Notation', 'Should parse article title');
        assert.equal(article.header.meta.author, 'Jane Developer', 'Should parse article author');
        assert.deepEqual(article.header.meta.tags, ['tutorial', 'markup', 'javascript'], 'Should parse tags array');
        
        // Test metadata extraction
        const metadata = extractMetadata(article);
        assert.equal(metadata.title, 'Getting Started with Mark Notation', 'Should extract title');
        assert.equal(metadata.author, 'Jane Developer', 'Should extract author');
        assert.deepEqual(metadata.tags, ['tutorial', 'markup', 'javascript'], 'Should extract tags');
        
        assert.end();
    } catch (error) {
        assert.fail(`Article with Mixed Content example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - Template Examples - Email Template', function(assert) {
    try {
        const emailTemplate = createProxy(Mark.parse(`<email
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
>`));

        // Template rendering function from example
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

        // Test template parsing
        assert.equal(emailTemplate.constructor.name, 'email', 'Should have email constructor');
        assert.equal(emailTemplate.header.from, 'noreply@example.com', 'Should parse from address');
        assert.equal(emailTemplate.header.to, '{{user.email}}', 'Should parse template variables');

        // Test template rendering
        const emailData = {
            user: { name: 'Alice', email: 'alice@example.com' },
            app: { name: 'MyApp', url: 'https://myapp.com' }
        };

        const renderedEmail = renderTemplate(emailTemplate, emailData);
        assert.ok(renderedEmail.includes('alice@example.com'), 'Should replace user email template');
        assert.ok(renderedEmail.includes('Welcome Alice!'), 'Should replace user name template');
        assert.ok(renderedEmail.includes('MyApp'), 'Should replace app name template');
        
        assert.end();
    } catch (error) {
        assert.fail(`Email Template example failed: ${error.message}`);
        assert.end();
    }
});

test('Examples.md - Edge Cases and Error Handling', function(assert) {
    try {
        // Test empty parsing
        assert.equal(Mark.parse(''), null, 'Should handle empty string');
        
        // Test null and undefined handling in Mark construction
        const testObj = Mark('test', null, []);
        assert.equal(testObj.constructor.name, 'test', 'Should create object with null properties');
        
        // Test array handling
        const list = Mark.parse('["a", "b", "c"]');
        assert.deepEqual(list, ['a', 'b', 'c'], 'Should parse arrays correctly');
        
        assert.end();
    } catch (error) {
        assert.fail(`Edge Cases test failed: ${error.message}`);
        assert.end();
    }
});

// Integration test - combine multiple examples
test('Examples.md - Integration Test', function(assert) {
    try {
        // Create a complex document combining multiple patterns
        const complexDoc = createProxy(Mark.parse(`<document
  <config
    title:"Complex Example",
    version:"1.0"
  >
  
  <data
    <users
      <user id:1, name:"Alice", email:"alice@example.com", active:true>
      <user id:2, name:"Bob", email:"bob@example.com", active:false>
    >
    
    <settings
      theme:"dark",
      notifications:true
      <features
        beta:false,
        advanced:true
      >
    >
  >
  
  <template
    <email
      subject:"Welcome {{user.name}}!",
      body:"Hello {{user.name}}, welcome to our platform!"
    >
  >
>`));

        // Test complex nested access
        assert.equal(complexDoc.config.title, 'Complex Example', 'Should access config title');
        assert.equal(complexDoc.data.users[0].name, 'Alice', 'Should access first user name');
        assert.equal(complexDoc.data.users[1].active, false, 'Should access second user active status');
        assert.equal(complexDoc.data.settings.features.advanced, true, 'Should access nested feature settings');
        assert.equal(complexDoc.template.email.subject, 'Welcome {{user.name}}!', 'Should access template content');
        
        // Test serialization round-trip
        const serialized = Mark.stringify(complexDoc);
        const reparsed = Mark.parse(serialized);
        const reparsedProxy = createProxy(reparsed);
        assert.equal(reparsedProxy.config.title, 'Complex Example', 'Should survive serialization round-trip');
        
        assert.end();
    } catch (error) {
        assert.fail(`Integration test failed: ${error.message}`);
        assert.end();
    }
});
