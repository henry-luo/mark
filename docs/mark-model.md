# Mark Data Model and APIs

Mark has a simple and fully-typed data model. It is an extension to the JSON data model. Mark extends JSON data model with 2 new data types: **Mark pragma** and **Mark object**.

Mark's data model is designed so that a well-formed HTML or XML document can be converted into Mark document without any loss in data model.

Roughly speaking, JSON, HTML and XML data models are subset of Mark data model, and Mark data model is a subset of JS data model.

## 1. Mark Pragma

Mark pragma is just a simple object with string content when data model is concerned. The interpretation of the text content stored in the pragma object is left up to the application. Mark pragma can be thought of like comment in HTML and processing instruction in XML.

### 1.1 Pragma vs. Comment

Mark comment is only a lexical construct. All Mark comments are thrown away during parsing, and they do not appear in the parsed data model.

Mark pragmas are preserved during parsing and appear in the result data model.

### 1.2 JS API

Mark pragma constructor:

- `Mark.pragma(value, parent)`: constructs a pragma object with the given `value` string. `parent` is an optional parameter. If you want the result data model to be a hierarchical DOM (so that it can be queried with CSS-like selector), then you should supply this `parent` parameter. The parent should be a Mark object.

The constructed pragma is a special JS object. It's does not have a constructor, like other normal JS objects. `typeof pragmaObj === 'object'`, however `pragmaObj.constructor` is `undefined`. It has the following API functions:

- `pragmaObj.pragma(value)`: when parameter `value` is not supplied, it returns the content string stored in the pragma; when the parameter `value` is supplied, it sets the content in the pragma, and returns the pragma itself.
- `pragmaObj.parent(parent)`:  when parameter `parent` is not supplied, it returns the parent object of the pragma; when the parameter `parent` is supplied, it sets the parent object of the pragma, and returns the pragma itself.
- `pragmaObj.valueOf()`: inherited from Object.prototype.valueOf, and just return the pragma itself.
- `pragmaObj.toString()`: returns `"[object Pragma]"`.

Mark pragma is a specially constructed JS object, it has been stripped off all standard JS object methods except the ones defined above.

## 2. Mark Object

Mark object extends JSON object with a type name and a list of content objects. Mark object is designed to act like element in HTML/XML.

A Mark object essentially contains 3 facets of data in its data model:

- **type name**: a string that represent the type name of the Mark object, which is like element name in HTML/XML. 
- **properties**: a collection of key-value pairs, like properties of JSON objects, and attributes of HTML/XML elements. 
  - For Mark object, property key **cannot be numeric**, which is reserved for the content objects. JSON object in Mark can still have all kinds of keys.
  - And property key must be **unique** under the same object, for both Mark and JSON object. (JSON spec has left this open, and there are many implementations accept duplicate keys.)
- **contents**: an ordered list of content objects, which are like child nodes of elements in HTML/XML. Mark utilizes a *novel* feature of JS that JS object can be array-like. It can store both named properties and indexed properties.

Mark has some restrictions on the objects that can be stored in the content:

- Objects allowed in Mark content are: `string`, `Mark pragma`, `JSON object`, `Mark object`.
- `Array`, `number`, `boolean` and `null` values are not allowed in Mark content.
- Consecutive strings must be merged into one string.

These restrictions are defined so that Mark content model can align with that of HTML and XML.

### 2.1 Core API

Mark object constructor:

- `Mark(type_name, properties, contents, parent)`: Mark object constructor takes 4 parameters, except `type_name`, the other 3 are optional.
  - `type_name`: a string.
  - `properties`: a JSON object containing name-value pairs. Numeric property keys are ignored.
  - `contents`: an array of content objects. Null values are skipped, primitive values are converted into strings, arrays will be flattened, and consecutive strings will be merged into one.
  - `parent`: for constructing a hierarchical DOM. If you intent to navigate the result data model using CSS selector, then you should supply this parameter.

The constructed Mark object is just a simple POJO. So basically:

- `type_name`: can be accessed through `markObj.constructor.name`.
- `properties`: can be accessed through `markObj.prop` or `markObj['prop']` when `prop` is not a proper JS identifier. You can also use JS `for ... in` loop to iterate through the properties. Unlike normal JS array, Mark object has been specially constructed so that Mark contents are not enumerable, thus do not appear in `for ... in` loop.
- `contents`: can be accessed through `markObj[index]`. You can also use JS `for ... of` loop to iterate through the content items.

Besides the above POJO behaviors, there are some additional prototype functions defined to work with the data model:

- `prop(name, value)`: without `value` parameter, it gets the value of the named property; with the `value` parameter, it sets the value of the named property, and returns current object. Comparing to setting property directly using `markObj.prop` or `markObj['prop']`, this is a safer method as it ensures that the key is not numeric.
- `length()`: returns the number of content items stored in the Mark object.
- `parent(obj)`: for getting or setting the parent object.
- `filter(callback, thisArg)`: similar to JS `Array.prototype.filter` that iterates through the content items.
- `map(callback, thisArg)`: similar to JS `Array.prototype.map` that iterates through the content items.
- `reduce(callback)`: similar to JS `Array.prototype.reduce` that iterates through the content items.
- `every(callback, thisArg)`: similar to JS `Array.prototype.every` that iterates through the content items.
- `some(callback, thisArg)`: similar to JS `Array.prototype.some` that iterates through the content items.
- `push(item, ...)`: similar to JS `Array.prototype.push` that pushes item(s) at the end of the contents.
- `pop(item)`: pop an item from the end of contents.
- `insert(item, index)`: inserts the given item(s) at the given `index`. If `index` is omitted, it defaults to 0.
- `remove(index)`: removes the content item at the given `index`.

When these API functions are overridden by properties of same name, you can still call them from the `Mark.prototype`, e.g.`Mark.prototype.length.call(markObj)`.

### 2.2 Static API

There are a few important API functions defined on the static Mark object:

- `Mark.parse('string', reviver)`: similar to `JSON.parse` that parses a string into Mark object. It takes an optional parameter reviver function, which is provided for backward compatibility with JSON API.
- `Mark.stringify(markObj, options, space)`: similar to `JSON.stringify` that serialize the Mark object back into string.
  - `options.omitComma`: tells whether comma between properties and array items should be omitted in the output. Default: `false`.
  - if `options` is a function, then it is a replacer. `replacer` and `space` are optional parameters provided for backward compatibility with JSON API.

### 2.3 Converter API

These are additional prototype functions implemented in `mark.converter.js`, for mapping Mark into other formats:

- `markObj.html()`: serializes the Mark object into HTML.
- `markObj.xml()`: serializes the Mark object into XML.

### 2.4 Selector API

These are additional prototype functions implemented in `mark.selector.js`, for processing the constructed data model using special selectors, like CSS selector:

- `markObj.matches('selector')`: returns whether the `markObj` matches the given CSS `selector`.
- `markObj.find('selector')`: returns child or descendent content objects that matches the given CSS `selector`.



