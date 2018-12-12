# Mark Data Model and APIs

Mark has a simple and fully-typed data model. It is an extension to the JSON data model. Mark extends JSON data model with 3 new data types: **binary object**, **Mark pragma** and **Mark object**.

Mark's data model is designed so that a well-formed HTML or XML document can be converted into Mark document without any loss in data model.

Roughly speaking, JSON, HTML and XML data models are subsets of Mark data model, and Mark data model is a subset of JS data model.

<div align="center">
<img align='center' src='https://mark.js.org/data-model.png' width='300'>
</div>

## 1. Binary Object

A binary object is represented by an JS ArrayBuffer, containing the bytes decoded from the source characters in either base64 or ascii85 encoding.

It has a property **encoding**, which can have the value `b64` or `a85`.

Unlike string, consecutive binary objects within the content of a Mark object are not merged.

## 2. Mark Pragma

Mark pragma is just a simple object with string content when data model is concerned. The interpretation of the text content stored in the pragma object is left up to the application. Mark pragma can be thought of like comment in HTML and processing instruction in XML.

### 2.1 Pragma vs. Comment

Mark comment is only a lexical construct. All Mark comments are thrown away during parsing, and they do not appear in the parsed data model.

Mark pragmas are preserved during parsing and appear in the result data model.

### 2.2 Pragma API

Mark pragma constructor:

- `Mark.pragma(value)`: constructs a pragma object with the given `value` string.

The constructed pragma is a special JS object. It's does not have a constructor, like other normal JS objects. `typeof pragmaObj === 'object'`, however `pragmaObj.constructor` is `undefined`. It has the following API functions:

- `pragmaObj.pragma()`: returns the content string stored in the pragma; 
- `pragmaObj.parent()`: returns the parent object of the pragma.
- `pragmaObj.valueOf()`: inherited from `Object.prototype.valueOf`, and just return the pragma itself.
- `pragmaObj.toString()`: returns `"[object Pragma]"`.

Mark pragma is a specially constructed JS object, it has been stripped off all standard JS object methods except the ones defined above.

## 3. Mark Object

Mark object extends JSON object with a type name and a list of content objects. Mark object is designed to act like element in HTML/XML.

A Mark object essentially contains 3 facets of data in its data model:

- **type name**: a string that represent the type name of the Mark object, which is like element name in HTML/XML. 
- **properties**: a collection of key-value pairs, like properties of JSON objects, and attributes of HTML/XML elements. 
  - For Mark object, property key **cannot be numeric**, which is reserved for the content objects. JSON object in Mark can still have all kinds of keys.
  - And property key must be **unique** under the same object, for both Mark and JSON object. (JSON spec has left this open, and there are many implementations accept duplicate keys.)
- **contents**: an ordered list of content objects, which are like child nodes of elements in HTML/XML. Mark utilizes a *novel* feature of JS that JS object can be array-like. It can store both named properties and indexed properties.

Mark has some restrictions on the objects that can be stored in the content:

- Objects allowed in Mark content are: `string`, `binary object` (i.e. `ArrayBuffer`), `Mark pragma`, `JSON object`, `Mark object`.
- `Array`, `number`, `boolean` and `null` values are not allowed in Mark content.
- Consecutive strings are merged into one single string.

These restrictions are defined so that Mark content model can align with that of HTML and XML.

### 3.1 Core API

Mark object constructor:

- `Mark(source)`: shorthand for `Mark.parse(source)`. `source` parameter must start with '{'.
- `Mark(type_name, properties, contents)`: Mark object constructor takes 3 parameters, except `type_name`, the other 2 are optional.
  - `type_name`: a string. It must not start with '{'.
  - `properties`: a JSON object containing name-value pairs. Numeric property keys are ignored.
  - `contents`: an array of content objects. Null values are skipped, primitive values are converted into strings, arrays will be flattened, and consecutive strings will be merged into one.

The constructed Mark object is just a simple POJO. So basically:

- `type_name`: can be accessed through `markObj.constructor.name`.
- `properties`: can be accessed through `markObj.prop` or `markObj['prop']` when `prop` is not a proper JS identifier. You can also use JS `for ... in` loop to iterate through the properties. Unlike normal JS array, Mark object has been specially constructed so that Mark contents are not enumerable, thus do not appear in `for ... in` loop.
- `contents`: can be accessed through `markObj[index]`. You can also use JS `for ... of` loop to iterate through the content items.

Besides the above POJO behaviors, there are some additional prototype functions defined to work with the data model:

- `.length`: when `length` property is not defined on the object, it returns the number of content items stored in the Mark object; otherwise, it returns the value of the `length` property. You can use `Mark.lengthOf()` to get the content length, when `length` property is defined on the object.
- `.contents()`: returns the list of content items stored in the Mark object.
- `.parent()`: returns the parent object of current Mark object.
- `.source(options)`: shorthand for stringifying current Mark object.
- `.text()`: returns a string, which is the concatenation of all descendant text content items.

As Mark object is array-like, most functional JS code that works with array-like data, can be work with Mark object without change. The following API functions are directly mapped to those from `Array.prototype`.

- `.filter(callback, thisArg)`: mapped to JS `Array.prototype.filter`.
- `.map(callback, thisArg)`: mapped to JS `Array.prototype.map`.
- `.reduce(callback)`: mapped to JS `Array.prototype.reduce`.
- `.every(callback, thisArg)`: mapped to JS `Array.prototype.every`.
- `.some(callback, thisArg)`: mapped to JS `Array.prototype.some`.
- `.each(callback, thisArg)`: mapped to JS `Array.prototype.forEach`.
- `.forEach(callback, thisArg)`: mapped to JS `Array.prototype.forEach`.
- `.includes(searchElement, fromIndex)`: mapped to JS `Array.prototype.includes`.
- `.indexOf(searchElement, fromIndex)`: mapped to JS `Array.prototype.indexOf`.
- `.lastIndexOf(callback, thisArg)`: mapped to JS `Array.prototype.lastIndexOf`.
- `.slice(begin, end)`: mapped to JS `Array.prototype.slice`.

When these API functions are overridden by properties of same name, you can still call them from the `Mark.prototype`, e.g.`Mark.prototype.contents.call(markObj)`.

### 3.2 Static API

There are a few important API functions defined on the static Mark object:

- `Mark.lengthOf(markObj)`: returns the content length of a Mark object.
- `Mark.parse('string', options)`: parses a string into Mark object. It takes an optional parameter `options`.
- `Mark.stringify(markObj, options)`: serialize the Mark object back into string. It takes an optional parameter `options`.
  - `options.space`: may be used to control spacing in the final string. If it is a number, successive levels in the stringification will each be indented by this many space characters (up to 10). If it is a string, successive levels will be indented by this string (or the first 10 characters of it).

Mark does not support `reviver` function defined in `JSON.parse()`, and `replacer` function defined in `JSON.stringify()`. They are not structured nor secure way to serialize and deserialize custom data types.

### 3.3 Mutative API

Mutative API functions are now separated into its own sub-module `mark.mutate.js`, which allows this part to be easily excluded from the package, if Mark is used in a pure functional manner.

The mutative API functions defined on a Mark object are:

- `.set(key, value)`: if the `key` is numeric, then it sets the indexed content item of the Mark object; otherwise, it sets a named property of the Mark object. 
- `.push(item, ...)`: pushes item(s) at the end of the contents of current Mark object. However, unlike JS `Array.prototype.push`, which returns the new array length, this function returns the current this object, so that the function call can be chained.
- `.pop()`: pop an item from the end of contents.
- `.splice(index, cnt, item, ...)`: remove `cnt` of items starting at the `index`, and then insert given item(s), similar to `Array.splice(...)`.

The mutative API function defined on a Mark pragma:

- `.set(value)`: sets the content in the pragma, and returns the pragma itself.

### 3.4 Converter API

These are additional prototype functions implemented in `mark.converter.js`, for mapping Mark into other formats:

- `markObj.html(options)`: serializes the Mark object into HTML. `options` parameter is same as that of `Mark.stringify()`.
- `markObj.xml(options)`: serializes the Mark object into XML.  `options` parameter is same as that of `Mark.stringify()`.

### 3.5 Selector API

These are additional prototype functions implemented in `mark.selector.js`, for processing the constructed data model using special selectors, like CSS selector:

- `markObj.matches('selector')`: returns whether the `markObj` matches the given CSS `selector`.
- `markObj.find('selector')`: returns child or descendent content objects that matches the given CSS `selector`.



