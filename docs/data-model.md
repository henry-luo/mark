---
layout: page
title: Mark Data Model
description: Understanding Mark's fully-typed data model and how it extends JSON
permalink: /data-model/
---
Mark has a simple and fully-typed data model. It is an extension to the JSON data model. 

Mark 1.0 extends JSON data model with several new data types:
- scalar types: **symbol**, **datetime**, **binary**, and **decimal** number.
- container types: **list** and **element**.

With the new data type additions, essentially all commonly used built-in data types under JS are well represented under Mark.

<div align="center"><img src='/mark-datatype-hierarchy.png' width="650"></div>

Roughly speaking, JSON, HTML and XML data models are subsets of Mark data model, and Mark data model is a subset of JS data model.

<div align="center">
<img align='center' src='/data-model.png' width='300'>
</div>

## 1. Symbol

Mark symbol maps to JS symbol.

## 2. Datetime

Mark datetime accepts ISO 8601 Datatime input, and is parsed into JS Date.

## 3. Binary

A *binary* object is represented by an JS ArrayBuffer, containing the bytes decoded from the source characters in either hex or base64 encoding.

It has a property **encoding**, which currently can be `hex` or `b64`.

Unlike string, consecutive binary objects within the content of a Mark element content are not merged.

## 4. Decimal

Mark supports (big) decimal number. It is an integer or decimal number ended with postfix 'n' or 'N'. 

mark.js library currently only implemented *bigint* support. Big decimal support will be added later.

## 5. Element

Mark element extends map object with a type name and a list of content objects. Mark element is designed to act like element in HTML/XML.

A Mark element essentially contains 3 facets of data in its data model:

- **element name**: a string that represent the type name of the Mark object, which is like element name in HTML/XML. 
- **properties**: a collection of key-value pairs, like properties of JSON objects, and attributes of HTML/XML elements. 
  - For Mark object, property key **cannot be numeric**, which is reserved for the content objects. JSON object in Mark can still have all kinds of keys.
  - And property key must be **unique** under the same object, for both Mark and JSON object. (JSON spec has left this open, and there are many implementations accept duplicate keys.)
- **contents**: an ordered list of content objects, which are like child nodes of elements in HTML/XML. Mark utilizes a *novel* feature of JS that JS object can be array-like. It can store both named properties and indexed properties.

Mark performs following normalization on the content stored in an element:

- `null` values are discarded.
- Consecutive strings are merged into one single string.
- a *list* in the element content will have its items auto spread/flattened.

These normalizations are performed to make Mark more friendly to use under mixed-content use cases.

## 6. List

Mark list represents an ordered collection of items. It is introduced to represent the data model of Mark element content.

Mark list behaves differently from an *array*. It performs normalization when data is added into the array:
- `null` values are discarded.
- Consecutive strings are merged into one single string.
- a nested *list* will have its items auto spread/flattened.
- if the list contains only one item, the list will be normalized to just that item.


