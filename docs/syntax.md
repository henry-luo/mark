---
layout: page
title: Mark Syntax
description: Complete syntax guide for Mark Notation, a superset of JSON with markup support
permalink: /syntax/
---

Mark syntax is a superset of JSON. The primary extension that Mark makes to JSON is the introduction of a new element notation to support markup data, commonly seen in HTML and XML.

## 1. Mark Element

Below are the key grammar rules for the new Mark element in BNF notation:

```BNF
element ::= '<' type_name properties contents '>'

type_name ::= identifier | symbol
```

*(Note: for clarify, whitespace rules are omitted in the grammar above. You can refer to the [formal BNF](mark.bnf).)*

Comparing to a JSON object, a Mark element has two extensions:

- A **type name**, which corresponds to class name or type name of an object. In JavaScript, that is `obj.constructor.name`. In HTML and XML, that's the element name.
- Optional list of **content** values following the named properties, which corresponds to child nodes in markup documents like HTML and XML.

### 1.1 Element Properties

```BNF
properties ::= (property ','?)*

property ::= key ':' value

identifier ::= begin_identifier continue_identifier*

begin_identifier ::= [a-zA-Z] | '_' | '$'

continue_identifier ::= begin_identifier | digit | '-' | '.'
```

- Property key and value can be unquoted if they're valid identifiers.  JS reserved keywords (like `default`) are valid unquoted keys in Mark. However, it is recommended that you avoid using JS keywords, or JS and Mark object prototype function names as property keys, as they could cause confusion, inconvenience and even errors (as the underlying functions are overridden).
- Comparing to JS identifier, Mark identifier allows dash '-' and dot '.' in it. These two special characters are added as they are commonly used in markup formats, like HTML, CSS, XML.
- Property keys and values can be single, double or triple quoted.
- Property keys can be any string **except a number**, which is reserved for Mark object contents. (This restriction does not apply to JSON properties.)
- Property keys are **case-sensitive**.
- Property keys **must be unique** (for both Mark and JSON object).
- Comma between properties is optional, and last property can have trailing comma.

### 1.2 Element Contents

```BNF
contents ::= (text | binary | json_object | mark_object | mark_pragma)*
```

- To better support mixed content, not all Mark values are allowed in the contents of a Mark object. Array, number, boolean and null values are not allowed.
- Consecutive text values are merged into a single text value.

## 2. Other Syntax Extensions to JSON

### 2.1 Root level

JSON allows only one value at root-level.

Mark allows multiple values at root-level, separated by ';' or line break.

### 2.2 String

- Strings under Mark can only be double quoted. (Single quoted is for *symbol* under Mark.)
- Strings can span across multiple lines.
- Unlike JSON string, control characters, like Tab and Line Feed, are allowed in Mark string. Actually, all Unicode characters are allowed in Mark string, just like JS string. Only double-quote ("),  and back-slash (\\) need to be escaped.

### 2.3 Symbol

Symbol is a new data type introduced in Mark 1.0.

Syntax wise, it is quite similar to string, except that it is single-quoted. And if the characters matches JS identifier, the single-quote can also be omitted.

### 2.4 Number

- Numbers can begin or end with a (leading or trailing) decimal point.
- Numbers can include `inf`, `-inf`,  `nan`, and `-nan`.
- Numbers can begin with an explicit plus sign.
- Mark support supports big *decimal* number. It is a integer or decimal number postfixed with 'N' or 'n', e.g. 123n. (*Note: under current mark.js implementation, only bigint is supported at the moment. We'll expand the implementation to cover big decimal.*)

### 2.4 Datetime

- Datetime under Mark is [ISO 8601 Datetime](https://en.wikipedia.org/wiki/ISO_8601) string quoted in `t'...'`
- `T`, `t`, and space `' '` are accepted as date time separator.
- Note that only are subset of ISO 8601 Datetime format is supported under Mark.

### 2.5 Binary Value

- Binary data can be encoded as a sequence of characters delimited by `b'...'`. 
- It can encoded in either *hex* or *base64* encoding.
- Whitespaces are allowed between the encoded characters and are ignored by the parser. 

```BNF
binary ::= hex_binary | base64_binary

hex_binary ::= "b'" '\\x' (hex_char | ws_char)* "'"

base64_binary ::= "b'" '\\64' (base64_char | ws_char)* '='? '='? "'"
```

### 3.6 Comments

- Both inline (single-line)  `//...` and block (multi-line) comments `/* ... */` are allowed in Mark, similar to those in JS.
- One difference is that, Mark block comment can be nested, whereas JS block comment cannot be nested.

## 4. Full Grammar Specification

The formal grammar specification in BNF is [here](https://github.com/henry-luo/mark/blob/master/docs/mark.bnf).

Following the JSON convention, a [railroad diagram]({{ '/mark-grammar.html' | relative_url }}) of the entire grammar is also provided to help you visualize the grammar. You can click on the grammar terms to navigate around. Below is a snapshot of the top-level of the grammar.

<img src='{{ "/mark-railway-diagram.png" | relative_url }}' width="600px">
