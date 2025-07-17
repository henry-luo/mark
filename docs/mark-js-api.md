# Mark JavaScript API

## Core API

Mark object constructor:

- `Mark(source)`: shorthand for `Mark.parse(source)`. `source` parameter must start with '<', '{' or '[' or '('.
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

## Static API

There are a few important API functions defined on the static Mark object:

- `Mark.lengthOf(markObj)`: returns the content length of a Mark object.
- `Mark.parse('string', options)`: parses a string into Mark object. It takes an optional parameter `options`.
- `Mark.stringify(markObj, options)`: serialize the Mark object back into string. It takes an optional parameter `options`.
  - `options.space`: may be used to control spacing in the final string. If it is a number, successive levels in the stringification will each be indented by this many space characters (up to 10). If it is a string, successive levels will be indented by this string (or the first 10 characters of it).

Mark does not support `reviver` function defined in `JSON.parse()`, and `replacer` function defined in `JSON.stringify()`. They are not structured nor secure way to serialize and deserialize custom data types.

## Mutative API

Mutative API functions are now separated into its own sub-module `mark.mutate.js`, which allows this part to be easily excluded from the package, if Mark is used in a pure functional manner.

The mutative API functions defined on a Mark object are:

- `.set(key, value)`: if the `key` is numeric, then it sets the indexed content item of the Mark object; otherwise, it sets a named property of the Mark object. 
- `.push(item, ...)`: pushes item(s) at the end of the contents of current Mark object. However, unlike JS `Array.prototype.push`, which returns the new array length, this function returns the current this object, so that the function call can be chained.
- `.pop()`: pop an item from the end of contents.
- `.splice(index, cnt, item, ...)`: remove `cnt` of items starting at the `index`, and then insert given item(s), similar to `Array.splice(...)`.

The mutative API function defined on a Mark pragma:

- `.set(value)`: sets the content in the pragma, and returns the pragma itself.

## Converter API

These are additional prototype functions implemented in `mark.converter.js`, for mapping Mark into other formats:

- `markObj.html(options)`: serializes the Mark object into HTML. `options` parameter is same as that of `Mark.stringify()`.
- `markObj.xml(options)`: serializes the Mark object into XML.  `options` parameter is same as that of `Mark.stringify()`.

## Selector API

These are additional prototype functions implemented in `mark.selector.js`, for processing the constructed data model using special selectors, like CSS selector:

- `markObj.matches('selector')`: returns whether the `markObj` matches the given CSS `selector`.
- `markObj.find('selector')`: returns child or descendent content objects that matches the given CSS `selector`.
