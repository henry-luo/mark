# Mark Notation

[![npm version](https://badge.fury.io/js/mark-js.svg)](https://badge.fury.io/js/mark-js)
[![Build Status](https://travis-ci.org/henry-luo/mark.svg?branch=master)](https://travis-ci.org/henry-luo/mark)
[![codecov](https://codecov.io/gh/henry-luo/mark/branch/master/graph/badge.svg)](https://codecov.io/gh/henry-luo/mark)

**Mark Notation** or simply **Mark**, is a new unified notation for both object and markup data. The notation is a superset of what can be represented by JSON, HTML and XML, but overcomes many limitations of these popular data formats, yet still having a very clean syntax and simple data model.

- It has **clean syntax** with **fully-type** data model *(like JSON or even better)*
- It is **generic** and **extensible** *(like XML or even better)*
- It has built-in **mixed content** support *(like HTML5 or even better)*
- It supports **high-order** composition *(like S-expressions or even better)*

|                        | Mark                           | JSON     | HTML | XML                            | S-expr                             | YAML                                  |
| ---------------------- | ------------------------------ | -------- | ---- | ------------------------------ | ---------------------------------- | ------------------------------------- |
| Clean syntax           | yes                            | yes      | no   | verbose                        | yes                                | yes <sub>(only for basic usage)</sub> |
| Fully-typed            | yes                            | yes      | no   | no <sub>(when no schema)</sub> | yes                                | yes                                   |
| Generic                | yes                            | yes      | no   | yes                            | yes                                | yes                                   |
| Mixed content support  | yes                            | hard     | yes  | yes                            | hard <sub>(poor map support)</sub> | hard                                  |
| High-order composition | yes                            | possible | no   | verbose                        | yes                                | possible                              |
| Wide adoption          | not <sub>(at the moment)</sub> | yes      | yes  | yes                            | limited                            | limited                               |

## Mark Syntax

The major syntax extension Mark makes to JSON is the introduction of a Mark object. It is a JSON object extended with a type name and a list of content items, similar to element in HTML and XML.

For example, a HTML registration form:

```html
<form>
  <!--comment-->
  <div class="form-group">
    <label for="email">Email address:</label>
    <input type="email" id="email">
  </div>
  <div class="form-group">
    <label for="pwd">Password</label>
    <input type="password" id="pwd">
  </div>
  <button class='btn btn-info'>Submit</button>
</form>
```

Could be represented in Mark as:

```text
{form                                   // object with type-name 'form'
  (?comment?)                           // Mark pragma, like HTML comment
  {div class:"form-group"               // nested Mark object
    {label for:email                    // property 'for' and its value, both unquoted
      "Email address:"                  // text needs to be quoted
    }
    {input type:email id:email}         // object without any contents
  }
  {div class:form-group
    {label for:pwd "Password"}
    {input type:password id:pwd}        // comma is optional 
  }
  {button class:['btn' btn-info]        // property with complex values
    'Submit'                            // text quoted with single quote
  }
}
```

You can refer to the [syntax spec](https://mark.js.org/mark-syntax.html) for details.

## Mark Data Model

Mark has a very simple and fully-typed data model. 

Each Mark object has 3 facets of data:

- **Type name**, which is mapped to `object.constructor.name` under JavaScript.
- **Properties**, which is a collection of key-value pairs, stored as normal JavaScript *named properties*.
- **Contents**, which is a list of content objects, stored as *indexed properties* inside the same JavaScript object.

Mark utilizes a novel feature in JavaScript that a plain JS object is actually *array-like*, it can contain both named properties and indexed properties.

So each Mark object is mapped to just **one** plain JavaScript object, which is more compact and efficient comparing to other JSON-based DOM models (e.g. [JsonML](http://www.jsonml.org/), [virtual-dom](https://github.com/Matt-Esch/virtual-dom), [MicroXML](https://dvcs.w3.org/hg/microxml/raw-file/tip/spec/microxml.html)), and is more intuitive to used under JS.

Roughly speaking, data models of JSON, XML, HTML are subsets of Mark data model, and Mark data model is a subset of JS data model.

<div align="center">
<img src='https://mark.js.org/data-model.png' width='300'>
</div>

You can refer to the [data model spec](https://mark.js.org/mark-model.html) for details.

## Mark vs. JSON

Mark is a superset of JSON. It extends JSON notation with a type-name, and a list of content objects.

Comparing to JSON, Mark has the following advantages:

- It has a type-name, which is important in identifying what the data represents; whereas JSON is actually an anonymous object, missing the type name.
- It has built-in mixed-content support, which is common in all markup formats, and thus allows Mark to convenient represent document-oriented data, which is awkward for JSON.
- It incorporates some syntax enhancements to JSON ~(e.g. allowing comments, property name and value without quotes, optional trailing comma or between properties and array values)~, thus making the format more friendly for human.

Some disadvantages of Mark, comparing to JSON would be:

- It is no longer a subset of JavaScript in syntax, although a Mark object is still a simple POJO in data model.
- It does not yet have wide support, like JSON, at the moment.

## Mark vs. HTML

Comparing to HTML, Mark has the following advantages:

- Mark is a generic data format, whereas HTML is a specialized format for web content.
- It does not have whitespace ambiguity, as the text objects are quoted explicitly. Thus Mark can be minified or prettified without worrying about changing the underlying content.
- Its properties can have complex values, like JSON, not just quoted string values as in HTML.
- It has a very clean syntax, whereas HTML5 parsing can be challenging even with HTML5 spec.
- It is always properly closed; whereas HTML self-closing tag syntax is non-extensible and error-prone.
- The DOM produced under Mark model, is just a hierarchy of POJO objects, which can be easily processed using the built-in JS functions or 3rd party libraries, making Mark an ideal candidate for virtual DOM and other application usages.

## Mark vs. XML

Comparing to XML, Mark has the following advantages:

- Mark properties can have complex object as value; whereas XML attribute values always need to be quoted and cannot have complex object as value, which is not flexible in syntax and data model.
- Mark syntax is much cleaner than XML. It does not have whitespace ambiguity. It does not have all the legacy things like DTD.
- The data model produced by Mark is fully typed, like JSON; whereas XML is only semi-typed without schema.

## Mark vs. S-expressions

S-expression from Lisp gave rise to novel ideas like high-order composition, self-hosting program. The clean and flexible syntax of Mark make it ideal for many such applications (e.g. [Mark Template](https://github.com/henry-luo/mark-template), a new JS template engine using Mark for its template syntax), just like s-expression.

The advantage of Mark over S-expressions is that it takes a more modern, JS-first approach in its design, and can be more readily used in web and node.js environments.

## mark.js

`mark.js` is the JS library to work with data in Mark format. It consists of 4 modules:

- The core module `mark.js`, which provides `parse()` and `stringify()` functions, like JSON, and a direct Mark object construction function `Mark()`, and some functional APIs to work with the object content.
- Sub-module `mark.mutate.js`, which provides mutative APIs to change the Mark object data model.
- Sub-module `mark.convert.js`, which provides conversion between Mark format and other formats like HTML and XML.
- Sub-module `mark.selector.js`, which provides CSS selector based query interface on the Mark object model, like jQuery.

## Usage

Install from NPM:

```
npm install mark-js --save
```

Then in your node script, use it as:

```js
const Mark = require('mark-js');
var obj = Mark.parse(`{div {span 'Hello World!'}}`);
console.log("Greeting from Mark: " + Mark.stringify(obj));
```

To use the library in browser, you can include the `mark.js` under `/dist` directory into your html page, like:

```html
<script src='mark.js'></script>
<script>
var obj = Mark(`{div {span 'Hello World!'}}`);  // using a shorthand
console.log("Greeting from Mark: " + Mark.stringify(obj));
</script>
```

Note: /dist/mark.js has bundled all sub-modules and all dependencies with it, and is meant to run in browser. The entire script is about 14K after gzip. It supports latest browsers, including Chrome, Safari, Firefox, Edge. (*Legacy browser IE is not supported.*)

*If you just want the core functional API, without the sub-modules, you can also use mark.core.js, which is only 7K after gzip. You can also refer to the package.json to create your own custom bundle with the sub-modules you need.*

## Documentation

- [Syntax specification](https://mark.js.org/mark-syntax.html)
- [Data model and API specification](https://mark.js.org/mark-model.html)
- [FAQ](https://mark.js.org/faq.html)
- Discussion about Mark beta release at [Hacker News](https://news.ycombinator.com/item?id=16308581)

## Tools, Extensions and Applications of Mark

- [Mark VSC Extension](https://marketplace.visualstudio.com/items?itemName=henryluo.mark-vsce): Mark Notation support for Visual Studio Code.

## Credits

Thanks to the following platforms or services that support the open source development of Mark: NPM, GitHub, [Travis CI](https://travis-ci.org/), [Codecov](https://codecov.io/), [JS.org](https://js.org/).
