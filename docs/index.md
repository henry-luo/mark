# Mark Notation

[![npm version](https://badge.fury.io/js/mark-js.svg)](https://badge.fury.io/js/mark-js)
[![CI](https://github.com/henry-luo/mark/actions/workflows/ci.yml/badge.svg)](https://github.com/henry-luo/mark/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/henry-luo/mark/branch/master/graph/badge.svg)](https://codecov.io/gh/henry-luo/mark)

**Mark Notation** is a modern, unified data format that combines the best aspects of JSON, XML, HTML, and other popular formats while eliminating their limitations. It provides a clean syntax with full type support, making it ideal for configuration files, data exchange, and document markup.

## Table of Contents

- [Mark Syntax](#mark-syntax)
- [Mark Data Model](#mark-data-model)
- [Comparisons](#mark-vs-json)
  - [Mark vs. JSON](#mark-vs-json)
  - [Mark vs. HTML/JSX](#mark-vs-htmljsx)
  - [Mark vs. XML](#mark-vs-xml)
  - [Mark vs. S-expressions](#mark-vs-s-expressions)
- [mark.js Library](#markjs)
- [Installation & Usage](#usage)
- [Documentation](#documentation)
- [Credits](#credits)

- It has **clean syntax** with **fully-typed** data model *(like JSON, but even better)*
- It is **generic** and **extensible** *(like XML, but even better)*
- It has built-in **mixed content** support *(like HTML5 or even better)*
- It supports **high-order** composition *(like S-expressions or even better)*

|                        | Mark                           | JSON     | HTML | JSX                                | XML          | S-expr                             | YAML                                  |
| ------------ | ---- | ---- | ---- | ---------------------------------- | ------------ | ------ | ------------------------------------- |
| Clean syntax           | yes                            | yes      | no   | no                                 | verbose      | yes                                | yes <sub>(only for basic usage)</sub> |
| Fully-typed            | yes                            | yes      | no   | partially<br><sub>(in {...})</sub> | need schema  | yes                                | yes                                   |
| Generic                | yes                            | yes      | no   | no                                 | yes                                    | yes                                | yes                                   |
| Mixed content support  | yes                            | hard     | yes  | yes                                | yes                                    | hard <sub>(poor map support)</sub> | hard                                  |
| High-order composition | yes                            | possible | no   | yes                                | verbose                                | yes                                | possible                              |
| Wide adoption          | not <sub>(at the moment)</sub> | yes      | yes  | yes                                | yes                                    | limited                            | limited                               |

## Mark Syntax

The major syntax extension Mark makes to JSON is the introduction of a Mark element. It is a JSON object extended with a type name and a list of content items, similar to element in HTML and XML.

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
<form                                 // element with name 'form'
  <'!--'comment>                      // HTML comment as special element
  <div class:'form-group'             // nested child element
    <label for:email                  // 'for' and its value, both unquoted
      "Email address:"                // text needs to be double quoted
    >
    <input type:email, id:email>      // element without child
  >
  <div class:'form-group'             // 'form-group' is a quoted symbol
    <label for:pwd; "Password">       // pwd is an unquoted symbol
    <input type:password, id:pwd>     // attrs separated by comma, like JSON
  >
  <button class:[btn, 'btn-info']     // attribute with complex values
    "Submit"                          // text quoted with double quote
  >
>
```

You can refer to the [syntax spec](https://mark.js.org/mark-syntax.html) for details.

## Mark Data Model

Mark has a very simple and fully-typed data model. 

Each Mark element has 3 facets of data:

- **Element name**, which is mapped to `object.constructor.name` under JavaScript.
- **Attributes**, which is a collection of key-value pairs, stored as normal JavaScript *named properties*.
- **Contents**, which is a list of child objects, stored as *indexed properties* inside the same JavaScript object.

Mark utilizes a novel feature in JavaScript that a plain JS object is actually *array-like*, it can contain both named properties and indexed properties.

So each Mark element is mapped to just **one** plain JavaScript object, which is more compact and efficient compared to other JSON-based DOM models (e.g. [JsonML](http://www.jsonml.org/), [virtual-dom](https://github.com/Matt-Esch/virtual-dom), [MicroXML](https://dvcs.w3.org/hg/microxml/raw-file/tip/spec/microxml.html)), and is more intuitive to use under JS.

Roughly speaking, data models of JSON, XML, HTML are subsets of Mark data model, and Mark data model is a subset of JS data model.

<div align="center">
<img src='https://mark.js.org/data-model.png' width='300'>
</div>

You can refer to the [data model spec](https://mark.js.org/mark-model.html) for details.

## Mark vs. JSON

Mark is a superset of JSON. It extends JSON notation with additional scalar and container types.

Compared to JSON, Mark has the following advantages:

- Additional scalar types supported under Mark, compared to JSON, include: *symbol*, *decimal number*, *datetime*, *binary* (supporting essentially all the major built-in data types under JS).
- For container types, other than *array* and *map*, Mark supports a new type *element*. Mark *element* has a type-name, which is important in identifying what the data represents; whereas JSON map is actually an anonymous object, missing the type name.
- Mark element has built-in mixed-content support, which is common in all markup formats, and thus allows Mark to conveniently represent document-oriented data, which is awkward for JSON.
- Mark incorporates some syntax enhancements to JSON ~(e.g. allowing comments, name without quotes)~, thus making the format more friendly for humans.

Some disadvantages of Mark, compared to JSON would be:

- It is no longer a subset of JavaScript literal syntax, although a Mark object is still a simple POJO in JS data model.
- It does not yet have wide support, like JSON, at the moment.

## Mark vs. HTML/JSX

Compared to HTML/JSX, Mark has the following advantages:

- Mark is a generic data format, whereas HTML is a specialized format for web content.
- It does not have whitespace ambiguity, as the text objects are quoted explicitly. Thus Mark can be minified or prettified without worrying about changing the underlying content.
- Mark attributes can have complex values, like JSON, not just quoted string values as in HTML.
- It has a very clean syntax, whereas HTML5 parsing can be challenging even with HTML5 spec.
- It is always properly closed; whereas HTML self-closing tag syntax is non-extensible and error-prone.
- The DOM produced under Mark model, is just a hierarchy of POJO objects, which can be easily processed using the built-in JS functions or 3rd party libraries, making Mark an ideal candidate for virtual DOM and other application usages.

## Mark vs. XML

Compared to XML, Mark has the following advantages:

- Mark attributes can have complex objects as values; whereas XML attribute values always need to be quoted and cannot have complex objects as values, which is not flexible in syntax and data model.
- Mark syntax is much cleaner than XML. It does not have whitespace ambiguity. It does not have all the legacy things like DTD. It does not have the verbose closing tag.
- The data model produced by Mark is fully typed, like JSON; whereas XML is only semi-typed, when there's no schema.

## Mark vs. S-expressions

Lisp and S-expression gave rise to novel ideas like high-order composition, self-hosting program, data as code, code as data, etc.. It's the source of inspiration of Mark and [Lambda Script](https://github.com/henry-luo/lambda).

The advantage of Mark over S-expressions is that it takes a more modern, web-first approach in its design, making it more readily usable in web and Node.js environments.

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
var obj = Mark.parse(`<div <span "Hello World!">>`);
console.log("Greeting from Mark: " + Mark.stringify(obj));
```

To use the library in browser, you can include the `mark.js` under `/dist` directory into your html page, like:

```html
<script src='mark.js'></script>
<script>
var obj = Mark(`<div <span "Hello World!">>`);  // using a shorthand
console.log("Greeting from Mark: " + Mark.stringify(obj));
</script>
```

Note: /dist/mark.js has bundled all sub-modules and all dependencies with it, and is meant to run in browser. The entire script is about 14K after gzip. It supports latest browsers, including Chrome, Safari, Firefox, Edge. (*Legacy browser IE is not supported.*)

*If you just want the core functional API, without the sub-modules, you can also use mark.core.js, which is only 7K after gzip. You can also refer to the package.json to create your own custom bundle with the sub-modules you need.*

And Mark Notation support for VS Code:
- [Mark VSC Extension](https://marketplace.visualstudio.com/items?itemName=henryluo.mark-vsce) 

## Documentation

- [Syntax specification](https://mark.js.org/mark-syntax.html)
- [Data model and API specification](https://mark.js.org/mark-model.html)
- [FAQ](https://mark.js.org/faq.html)
- Discussion about Mark beta release at [Hacker News](https://news.ycombinator.com/item?id=16308581)
## Credits

Thanks to the following platforms or services that support the open source development of Mark: NPM, GitHub, [Travis CI](https://travis-ci.org/), [Codecov](https://codecov.io/), [JS.org](https://js.org/).
