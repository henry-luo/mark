---
layout: page
title: Grammar Reference
description: Complete BNF grammar specification and railroad diagram for Mark Notation
permalink: /grammar/
---

## BNF Grammar

The complete formal grammar specification for Mark Notation is available in the [mark.bnf]({{ '/mark.bnf' | relative_url }}) file.

## Interactive Railroad Diagram

For a visual representation of the grammar, you can explore the interactive [railroad diagram]({{ '/mark-grammar.html' | relative_url }}).

The railroad diagram provides a visual way to understand the grammar structure. You can click on grammar terms to navigate around and see how different parts of the syntax connect together.

## Grammar Overview

Below is a snapshot of the top-level grammar structure:

<img src='{{ "/mark-railway-diagram.png" | relative_url }}' width="600px" alt="Mark Grammar Railroad Diagram">

## Key Grammar Differences vs. JSON

### Root Level
- Mark allows multiple values at root level, separated by ';' or line break
- JSON allows only one value at root level

### Elements
```bnf
element ::= '<' type_name properties contents '>'
type_name ::= identifier | symbol
properties ::= (property ','?)*
property ::= key ':' value
contents ::= (text | binary | json_object | mark_object | mark_pragma)*
```

### Extended Data Types
Mark extends JSON with several new data types:
- **Symbol**: Single-quoted strings or unquoted identifiers
- **Binary**: Base64 or hex encoded data in `b'...'`
- **Datetime**: ISO 8601 datetime strings in `t'...'`
- **Decimal**: Big decimal numbers with 'n' suffix
- **Comments**: Both `//` and `/* */` style comments

