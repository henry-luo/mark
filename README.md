<h1 style='font-family:Helvetica,Arial,sans-serif'>{mark}</h1>
<img src='https://api.travis-ci.org/henry-luo/mark.svg?branch=master'>

*Objective Markup Notation*, abbreviated as **Mark** or **{mark}**, is a new unified notation for both object and markup data. The notation is a superset of what can be represented by JSON, HTML and XML, but overcomes many limitations these popular data formats, yet still having a very clean syntax and simple data model.

## Mark Example

For example, a HTML registration form:

```html
<form>
  <!-- comment -->
  <div class="form-group">
    <label for="email">Email address:</label>
    <input type="email" id="email">
  </div>
  <div class="form-group">
    <label for="pwd">Password</label>
    <input type="password" id:"pwd">
  </div>
  <button class='btn btn-info'>Submit</button>
</form>
```

Represented in Mark would be:

```text
{form                                   // object type-name 'form'
  {!-- comment --}                      // Mark pragma, similar to HTML comment
  {div class:"form-group"               // nested Mark object
    {label for:"email"                  // object with property 'for'
      "Email address:"                  // text needs to be quoted
    }
    {input type:"email", id:"email"}    // object without any contents
  }
  {div class:"form-group"
    {label for:"pwd" "Password"}
    {input type:"password", id:"pwd"}
  }
  {button class:['btn','btn-info']      // property with complex values
    'Submit'                            // text quoted with single quote
  }
}
```

## Mark Data Model

Mark object has a very clean and simple data model. Each Mark object has 3 facets of data:

- **Type name**, which is mapped to `object.constructor.name` under JavaScript.
- **Properties**, which is a collection of key-value pairs, stored as normal JavaScript *named properties*.
- **Contents**, which is a list of content objects, stored as *indexed properties* inside the same JavaScript object.

Mark utilizes a novel feature in JavaScript that an plain JS object is actually *array-like*, it can contain both named properties and indexed properties.

So each Mark object is mapped to just one plain JavaScript object, which is very compact and efficient comparing to other DOM models. *(Many JS virtual-dom implementations need to represent one DOM element with at least 3 objects: the main object, one JSON object for the properties, and one array object for the contents.)*

## Mark vs. JSON

Mark is a superset of JSON. It extends JSON notation with a type-name, and a list of content objects.

Comparing to JSON, Mark has the following advantages:

- It has a type-name, which is important in identifying what the data represents; whereas JSON is actually an anonymous object, missing the type name.
- It can have nested content objects, which is common in all markup formats, and thus allows Mark to convenient represent document-oriented data, which is awkward for JSON.
- It incorporates most of the enhancements of [JSON5](http://json5.org/) to JSON (e.g. allowing comments, property name without quotes, etc.), and makes the format more friendly for human.

Some disadvantages of Mark, comparing to JSON would be:

- It is no longer a strict subset of JavaScript in syntax, although a Mark object is still a simple POJO.
- It does not yet have wide support, like JSON, at the moment.

## Mark vs. HTML

Comparing to HTML, Mark has the following advantages:

- Mark is a generic data format, whereas HTML is a specialized format for web content.
- It does not have whitespace ambiguity, as the text objects need to be quoted explicitly. Thus Mark can be minified or prettified without worrying about changing the underlying content.
- Its properties can have complex values, like JSON, not just quoted string values in HTML.
- It has a very clean syntax, whereas HTML5 parsing can be challenging even with HTML5 spec.
- Its objects are always properly closed, like JSON and XHTML; whereas HTML self-closing tag rules are non-extensible and error-prone.
- The DOM produced under Mark model, is just a hierarchy of POJO objects, which can be easily processed using the built-in JS functions or 3rd party libraries, making Mark an ideal candidate for virtual DOM and other application usages.

## Mark vs. XML

Comparing to XML, Mark has the following advantages:

- Mark properties can have complex object as value; whereas XML attribute values always need to be quoted and cannot have complex object as value, which is not flexible in syntax and data model.
- Mark syntax is much cleaner than XML. It does not have all the legacy things like DTD, and it does not have whitespace ambiguity.
- The data model produced by Mark is fully typed, like JSON; whereas XML is only semi-typed without schema.

## mark.js

`mark.js` is the JS library to work with data in Mark format. It consists of 3 modules:

- The core module `mark.js`, which provides `parse()` and `stringify()` functions, like JSON, and a direct Mark object construction function `Mark()`. *(in beta)*
- Sub-module `mark.convert.js`, which provides conversion between Mark format and other formats like HTML, XML, etc. *(in beta)*
- Sub-module `mark.selector.js`, which provides CSS selector based query interface on the Mark object model, like jQuery. *(in beta)*

## Usage

Install from NPM:

```
npm install mark-js --save
```

Then in your node script, use it as:

```js
const Mark = require('mark-js');
var obj = Mark.parse(`{div {span 'Hello World!' }}`);
console.log("Greeting from Mark: " + Mark.stringify(obj));
```

To use the library in browser, you can include the `mark.js` under `/dist` directory into your html page, like:

```html
<script src='mark.js'></script>
<script>
var obj = Mark.parse(`{div {span 'Hello World!' }}`);  // using ES6 backtick
console.log("Greeting from Mark: " + Mark.stringify(obj));
</script>
```

*(Note: /dist/mark.js has bundled mark.convert.js and mark.selector.js and all dependencies with it, and is meant to run in browser. The entire script is about 13K after gzip. And if you need to support legacy browsers, like IE11, which does not have proper ES6 support, you can link to /dist/mark.es5.js)*

## Documentation

- [Syntax specification](docs/mark-syntax.md)
- [Data model and API specification](docs/mark-model.md)
- Examples:
  - You can take look at all the [test scripts](https://github.com/henry-luo/mark/tree/master/test), which also serve as basic demonstration of API usage.
  - [Mark HTML example](https://plnkr.co/edit/DCgNxf?p=preview)
  - [Mark conversion example](https://plnkr.co/edit/cMSCW3?p=preview)
- Mark CLI; *(being developed)*


## Credits

Credits to the following platforms or services that support the open source development of Mark:

- NPM and GitHub;
- [Travis CI](https://travis-ci.org/);
- [BrowserStack](https://www.browserstack.com);
- [jsDelivr](https://www.jsdelivr.com/);
- [Plunker](https://plnkr.co/);
- [JS.org](https://js.org/);