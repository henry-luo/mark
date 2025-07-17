---
layout: page
title: FAQ
permalink: /faq/
---

# Mark FAQ

## Is JSON a strict subset of Mark?

Yes. Mark is carefully designed to have JSON as a strict subset. Any valid JSON source should be accepted as valid Mark input, except one corner case.

JSON accept empty string "" as key. Mark does not accept that. E.g. `{"":123}` is valid under JSON, but not under Mark.

## Is Mark a subset of JavaScript?

No. Mark has introduced many syntax extensions to JSON, and its syntax is no longer valid in JavaScript.

But Mark has a clean data model that is a subset of JS data model.

<div align="center">
<img src='https://mark.js.org/data-model.png' width='300'>
</div>

## Is Mark secure?

Security has been taken seriously when designing and implementing Mark. It is implemented to be as secure as possible.

During parsing and serialization, Mark does not call any custom code. Objects and their constructors are constructed from scratch, not calling any custom code.

Standard `JSON.stringify()` implementation calls `toJSON()` method if it is defined on the object, before stringifying the value. Such invocation might not be secure, and is not supported under Mark.

JSON.parse() and JSON.stringify() also accept an optional parameter of a reviver and a replacer function. There are neither structured nor secure way to serialize and deserialize custom data types, thus no longer supported under Mark.

Mark shall support serialize and deserialize custom data types under a separate project Mark Schema.

## Can Mark be used in languages other than JS?

Yes. Mark is designed to be a generalized data format, like JSON and XML. It is no meant just for JavaScript.

However, due to limited resource, the Mark handling library is currently only implemented in JS. But as Mark has a very simple syntax and data model, it should not be hard to port it to other languages. 

## What is Mark's road map?

Like JSON, Mark 1.0's syntax and data model is designed to be stable. Thus the mark.js library shall remain stable as well.

However, for Mark to be useful, a lot need to be developed on top of the basic Mark syntax and data model. And those activities shall happen in separate projects (like Mark Template, Mark Schema), without changing the Mark syntax and data model.

## Is mark.js production-ready?

Almost. The Mark syntax and data model has stabilized, and I don't foresee any changes soon.

The core Mark APIs have been thoroughly tested, and shall remain stable as well.

mark.convert.js which provides conversion between XML/HTML and Mark, and mark.selector.js which provides query function on Mark data using CSS selector, are fully functional, and carefully tested as well. However, due to the complex nature of XML/HTML/CSS, there might be corner cases not properly supported. And they'll be fixed through on-going maintenance.

So you can start using mark.js in production environment already. For any critical data or usage, always test carefully and thoroughly before you cut over. 