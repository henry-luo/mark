# Mark Syntax

Mark syntax is a superset of JSON. The primary extension that Mark makes to JSON is the introduction of a new object notation to support markup data, commonly seen in HTML, XML, etc.

## Mark Object

Below is the key grammar rules for the new Mark object notation in EBNF notation:

```EBNF
Mark ::= ws value ws

value ::= null | true | false | number | string | array | json_object | mark_object

mark_object ::= '{' type_name properties contents '}'

type_name ::= identifier

properties ::= (property (',' property)* ','?)?

contents ::= ( string | mark_object | mark_comment )*

property ::= key ':' value

key ::= s_string | d_string | identifier

mark_comment ::= '{--' (p_char_no_dash | ('-' p_char_no_dash))* '--}'
```

*(Note: for clarify, whitespace rules are omitted in the grammar above. You can refer to the [formal EBNF](mark.ebnf).)*

Comparing to a JSON object, a Mark object has two extensions:

- A **type name**: which corresponds to class name or type name of an object. In JavaScript, that is the `obj.constructor.name`. In HTML and XML, that's the element name.
- Optional list of **content** values following the properties: the content values corresponds to child nodes in markup data.
- Mark comment is defined to make it fully compatible with HTML content model, so that HTML can be mapped into Mark without any data loss.

## Other Syntax Extensions to JSON

Other syntax extensions made to JSON are pretty much just syntax sugars. Most of them are inherited from [JSON5](http://json5.org/).

### Properties

```
identifier ::= begin_identifier continue_identifier*

begin_identifier ::= [a-zA-Z] | '_' | '$'

continue_identifier ::= begin_identifier | digit | '-' | '.'
```

- Property keys can be unquoted if they’re valid identifiers. Yes, even reserved keywords (like `default`) are valid unquoted keys in ES5.
- Comparing to JSON5 and JS identifiers, Mark identifier allows dash '-' and dot '.' in it. These two special characters are commonly used in markup data, like HTML, CSS, XML.
- Property keys can also be single-quoted.
- Last property can have trailing comma.

### Arrays

- Arrays can have trailing comma.

### Strings

- Strings can be single-quoted.
- Strings can be split across multiple lines.

### Numbers

- Numbers can begin or end with a (leading or trailing) decimal point.
- Numbers can include `Infinity`, `-Infinity`,  `NaN`, and `-NaN`.
- Numbers can begin with an explicit plus sign.
- *Note: Mark does not support hexadecimal integer. This is the only feature that Mark omits from JSON5.*

### Comments

- Both inline (single-line) and block (multi-line) comments are allowed.

## Full Grammar Specification

The formal grammar specification in EBNF is [here](mark.ebnf).

Following the JSON convention, a [railway diagram](https://mark.js.org/mark-grammar.html) of the entire grammar is also provided to help you visualize the grammar. You can click on the grammar terms to navigate around. Below is just a small portion of it.

<div style='width:600px; margin:auto'>
<img src='mark-railway-diagram.png' style='width:600px'>
</div>
