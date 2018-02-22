# Mark Syntax

Mark syntax is a superset of JSON. The primary extension that Mark makes to JSON is the introduction of a new object notation to support markup data, commonly seen in HTML and XML.

## 1. Mark Object

Below are the key grammar rules for the new Mark object in BNF notation:

```BNF
Mark ::= value     /* root */

value ::= null | boolean | number | string | array | json_object | mark_object | mark_pragma

mark_object ::= '{' type_name properties contents '}'

type_name ::= key

properties ::= (property ','?)*

contents ::= (text | json_object | mark_object | mark_pragma)*

property ::= key ':' value

key ::= string | identifier
```

*(Note: for clarify, whitespace rules are omitted in the grammar above. You can refer to the [formal BNF](mark.bnf).)*

Comparing to a JSON object, a Mark object has two extensions:

- A **type name**: which corresponds to class name or type name of an object. In JavaScript, that is `obj.constructor.name`. In HTML and XML, that's the element name.
- Optional list of **content** values following the properties: the content values corresponds to child nodes in markup data.

### 1.1 Properties

```BNF
identifier ::= begin_identifier continue_identifier*

begin_identifier ::= [a-zA-Z] | '_' | '$'

continue_identifier ::= begin_identifier | digit | '-' | '.'
```

- Property keys can be unquoted if they’re valid identifiers.  JS reserved keywords (like `default`) are valid unquoted keys in Mark. However, it is recommended that you avoid using JS keywords, or JS and Mark object prototype function names as property keys, as they could cause confusion, inconvenience and even errors (as the underlying functions are overridden).
- Comparing to JSON5 and JS identifiers, Mark identifier allows dash '-' and dot '.' in it. These two special characters added as they are commonly used in markup formats, like HTML, CSS, XML.
- Property keys can also be single or double quoted.
- Property keys can be any string **except a number**, which is reserved for Mark object contents. (This restriction does not apply to JSON properties.)
- Property keys are **case-sensitive**.
- Property keys **must be unique** (for both Mark and JSON object).
- Comma between properties are optional, and last property can have trailing comma.

## 2. Mark Pragma

Mark pragma, it is a sequence of characters enclosed in '{' and '}', as long as it is not a valid JSON or Mark object. It can contain any character in it except '{', '}', ':' and ';', which need to be escaped using backslash '\'.

```BNF
mark_pragma ::= '{' pragma_escape | pchar_no_brace_colon+ '}'

pragma_escape ::= '\' ('{' | '}' | ':' | ';')
```

It is designed to support markup content like comment in HTML and processing instruction in XML.

## 3. Other Syntax Extensions to JSON

Other syntax extensions made to JSON are pretty much just syntax sugars. Most of them are inherited from [JSON5](http://json5.org/).

### 3.1 Object

- Property keys of JSON object in Mark must be **unique** under the same object. (JSON spec has left this open, and there are many implementations that accept duplicate keys. This is probably an overlooked issue in initial JSON design.)

### 3.2 Arrays

- Comma between array items are optional, and last item in array can have a trailing comma.

### 3.3 Strings

- Strings can be single, double quoted.
- Strings can be split across multiple lines.
- String can also be triple-quoted with single or double quote character, similar to Python or Scala.
  - The quoted sequence of characters is arbitrary, except that it may contain three or more consecutive quote characters only at the very end. Escape sequences are not interpreted.

### 3.4 Numbers

- Numbers can begin or end with a (leading or trailing) decimal point.
- Numbers can include `Infinity`, `-Infinity`,  `NaN`, and `-NaN`.
- Numbers can begin with an explicit plus sign.

### 3.5 Comments

- Both inline (single-line) and block (multi-line) comments are allowed, similar to those in JS.

## 4. Full Grammar Specification

The formal grammar specification in BNF is [here](mark.bnf).

Following the JSON convention, a [railroad diagram](https://mark.js.org/mark-grammar.html) of the entire grammar is also provided to help you visualize the grammar. You can click on the grammar terms to navigate around. Below is just a small portion of it.

<img src='mark-railway-diagram.png' width="500px">
