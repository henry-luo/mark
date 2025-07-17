---
layout: page
title: Mark Data Model
description: Understanding Mark's fully-typed data model and how it extends JSON
permalink: /data-model/
---

Mark has a simple and fully-typed data model. It is an extension to the JSON data model. 

Mark extends JSON data model with several new data types:
- scalar types: **symbol**, **datetime**, **binary**, and **decimal** number.
- container types: **list** and **element**.

With the new data type additions, essentially all commonly used built-in data types are well represented under Mark.

Mark's data model is designed so that a well-formed HTML or XML document can be converted into Mark document without any loss in data model.

Roughly speaking, JSON, HTML and XML data models are subsets of Mark data model, and Mark data model is a subset of JS data model.

<div align="center">
<img align='center' src='{{ "/data-model.png" | relative_url }}' width='300'>
</div>

## 1. Symbol

Mark symbol.

## 2. Datetime

Mark datetime.

## 3. Binary

A *binary* object is represented by an JS ArrayBuffer, containing the bytes decoded from the source characters in either base64 or ascii85 encoding.

It has a property **encoding**, which can have the value `hex` or `b64`.

Unlike string, consecutive binary objects within the content of a Mark object are not merged.

## 4. Decimal

Mark decimal.

## 3. Element

Mark element extends map object with a type name and a list of content objects. Mark object is designed to act like element in HTML/XML.

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

## 4. List

Mark list represents an ordered collection of items. Lists are one of the container types in Mark, alongside elements.

For detailed information about the JavaScript API for working with Mark objects, see [Mark JavaScript API]({{ '/api/' | relative_url }}).
