// mark.js
// Objective Markup Notation. See README.md for details.
//
// This file is based directly of JSON5 at:
// https://github.com/json5/json5/blob/master/lib/json5.js
// which is further based of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

// symbols used internally
const $length = Symbol('Mark.length');
const $parent = Symbol('Mark.parent');
const $pragma = Symbol('Mark.pragma');

// static Mark API
var MARK = (function() {
	"use strict";
	// cached constructors for the Mark objects
	let constructors = {};	

	// Mark object constructor
	function Mark(typeName, props, contents, parent) {
		"use strict";
		// 1. prepare the constructor
		var con = constructors[typeName];
		if (!con) {
			if (typeof typeName !== 'string') { throw "Type name should be a string"; }
			con = constructors[typeName] = function(){};
			// con.prototype.constructor is set to con by JS
			// sets the type name
			Object.defineProperty(con, 'name', {value:typeName, configurable:true}); // non-writable, as we don't want the name to be changed

			// con.prototype.__proto__ = Array.prototype; // Mark no longer extends Array; Mark is array like, but not array.
			// con is set to extend Mark, instead of copying all the API functions
			// for (let a in api) { Object.defineProperty(con.prototype, a, {value:api[a], writable:true, configurable:true}); } // make API functions non-enumerable
			Object.setPrototypeOf(con.prototype, Mark.prototype);
		}
		
		// 2. create object
		var obj = Object.create(con.prototype);
		
		// 3. copy properties, numeric keys are not allowed
		if (props) { 
			for (let p in props) {
				// accept only non-numeric key; key should have no duplicate here
				if (isNaN(p*1)) { obj[p] = props[p]; }
			}
		}
		
		// 4. copy contents if any
		let len = 0;
		if (contents) { 
			let prev_type = null;
			function addContents(items) {
				for (let val of items) {
					let t = typeof val;
					if (t === 'string') {
						if (!val.length) continue; // skip empty text '', ""
						if (prev_type === 'string') { 
							len--;  val = obj[len] + val;  // merge text nodes
						}
					}
					else if (t === 'object') {
						if (val === null) continue; // skip null value
						else if (val instanceof Array) { // expanded it inline
							addContents(val);  continue;
						}
						// else, assume Mark object
					}
					else { // other primitive values
						val = val.toString(); // convert to string, as Mark only accept text and Mark object as content
						if (prev_type === 'string') {
							len--;  val = obj[len] + val;  // merge text nodes
						}
					}
					Object.defineProperty(obj, len, {value:val, writable:true, configurable:true}); // make content non-enumerable
					prev_type = t;  len++;
				}
			}
			addContents(contents);
		}
		// set $length
		obj[$length] = len;
		
		// set $parent
		if (parent) { obj[$parent] = parent; }
		return obj;
	};
	
	// reset content of this object
	function replaceWith(trg, obj) {
		// console.log('src obj:', obj);
		// reset properties and contents
		for (let p in trg) { if (typeof trg[p] !== 'function') delete trg[p]; }
		for (let i=0, len=trg[$length]; i<len; i++) { delete trg[i]; }  // console.log('obj afte reset:', trg);
		// copy over new constructr, properties and contents
		Object.setPrototypeOf(trg, Object.getPrototypeOf(obj));
		for (let p in obj) { trg[p] = obj[p]; }
		var length = obj[$length];
		for (let i=0; i<length; i++) {
			Object.defineProperty(trg, i, {value:obj[i], writable:true, configurable:true}); // make content item non-enumerable
		}
		trg[$length] = length;  // console.log('obj afte copy:', trg);
	}
		
	// Mark object API functions
	var api = {
		// object 'properties': just use JS Object.keys(), Object.values(), Object.entries() to work with the properties	
		contents: function() { 
			let list = [];
			for (let c of this) { list.push(c); }
			return list;
		},
		// get contents length
		length: function() {
			return this[$length];
		},
		// to set or get a property
		prop: function(name, value) {
			// accept only non-numeric key
			if (typeof name === 'string' && isNaN(name*1)) { 
				if (value !== undefined) { this[name] = value;  return this; } // returns this, so that the call can be chained
				else return this[name];				
			}
			else { throw "Property name should not be numeric"; }
		},
		// to set or get parent
		parent: function(pa) {
			if (pa !== undefined) { this[$parent] = pa;  return this; } // returns this, so that the call can be chained
			else return this[$parent];
		},
		// to set or get pragma content
		pragma: function(value) {
			if (value !== undefined) { this[$pragma] = value;  return this; } // returns this, so that the call can be chained
			else return this[$pragma];
		},
		
		// todo: do content normalization
		push: function() {
			// copy the arguments
			let length = this[$length];
			for (let i=0; i<arguments.length; i++) {
				Object.defineProperty(this, length+i, {value:arguments[i], writable:true, configurable:true}); // make content item non-enumerable
			}
			length += arguments.length;
			this[$length] = length;
			return length;
		},
		pop: function() {
			let length = this[$length];
			if (length > 0) {
				let item = this[length-1];  delete this[length-1];
				this[$length] = length - 1;
				return item;
			} else {
				return undefined;
			}
		},
		// insert item(s) at the given index  // todo: do content normalization
		insert: function(item, index) {
			index = index || 0;
			let length = this[$length];
			if (index < 0 || index > length) { throw "Invalid index"; }
			let offset = item instanceof Array ? item.length:1;
			// shift items after index
			for (let i=length-1; i>=index; i--) {
				Object.defineProperty(this, i+offset, {value:this[i], writable:true, configurable:true});  // make content item non-enumerable
			}
			// insert items
			if (offset > 1) {
				for (let i=0; i<offset; i++) {
					Object.defineProperty(this, index+i, {value:item[i], writable:true, configurable:true});  // make content item non-enumerable
				}
			} else {
				Object.defineProperty(this, index, {value:item, writable:true, configurable:true});  // make content item non-enumerable
			}
			this[$length] = length + offset;
			return this; // for call chaining
		},
		// can consider support 2nd param of cnt (for no. of items to remove)
		// consider remove self
		remove: function(index) {
			if (arguments.length) {
				// shift the items
				var length = this[$length];
				if (index >=0 && index < length) {
					for (var i = index; i < length - 1; i++) { this[i] = this[i+1]; }
					this[$length] = length - 1;
				}
				// else invalid index
			}
			return this; // for call chaining
		},

		// filter: like Array.prototype.filter
		filter: function(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			const obj = Object(this);
			let res = [], i = 0;
			for (const n of obj) {
				if (func.call(thisArg || obj, n, i, obj)) { res.push(n); }
				i++;
			}
			return res;
		},
		
		// map: like Array.prototype.map
		map: function(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			const obj = Object(this);
			let res = [], i = 0;
			for (const n of obj) {
				res[i] = func.call(thisArg || obj, n, i, obj);
				i++;
			}
			return res;
		},
		
		// reduce: like Array.prototype.reduce
		reduce: function(func) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			let obj = Object(this), len = obj[$length], k = 0, value;
			if (arguments.length == 2) { value = arguments[1]; } 
			else {
				if (k >= len) { throw new TypeError('Reduce of empty contents with no initial value'); }
				value = obj[k++];
			}
			for (; k < len; k++) {
				value = func(value, obj[k], k, obj);
			}
			return value;		
		},
		
		// every: like Array.prototype.every
		every: function(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			let i = 0, obj = Object(this);
			for (const n of obj) {
				var result = func.call(thisArg || obj, n, i, obj);
				if (!result) { return false; }
				i++;
			}
			return true;
		},
		
		// some: like Array.prototype.some
		some: function(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			let i = 0, obj = Object(this);
			for (const n of obj) {
				if (func.call(thisArg || obj, n, i, obj)) { return true; }
				i++;
			}
			return false;
		},
		
		// Mark selector APIs
		// find() is similar to jQuery find(), diff from Array.prototype.find()
		find: function(selector) { 
			// load helper on demand
			if (!MARK.$select) { MARK.$select = require('./lib/mark.selector.js'); }
			return MARK.$select(this).find(selector);
		},
		matches: function(selector) {
			// load helper on demand
			if (!MARK.$select) { MARK.$select = require('./lib/mark.selector.js'); }
			return MARK.$select(this).matches(selector);
		},
		
		// conversion APIs
		source: function() {
			// get the source
			if (!arguments.length) { return MARK.stringify(this); }
			// set the source
			replaceWith(this, MARK.parse(arguments[0]));
			return this;  // for call chaining
		},
		// json: function() {}
		html: function() {
			if (!arguments.length) { // get html source
				// load helper on demand
				return MARK.stringify(this, {format:'html'});
			} else { // set html source
				let options = arguments[1] || {};  options.format = 'html';
				replaceWith(this, MARK.parse(arguments[0], options));
				return this;  // for call chaining
			}
		},
		xml: function() {
			if (!arguments.length) { // get xml source
				// load helper on demand
				return MARK.stringify(this, {format:'xml'});
			} else { // set xml source
				let options = arguments[1] || {};  options.format = 'xml';
				replaceWith(this, MARK.parse(arguments[0], options));
				return this;  // for call chaining
			}
		},		
	}
	// set the APIs
	for (let a in api) {
		let func = {value:api[a], writable:true, configurable:true};
		// Mark.prototype[a] = api[a];  // direct assignment will make the API functions enumerable
		Object.defineProperty(Mark.prototype, a, func);  // make API functions non-enumerable
		
		// no longer set the APIs on static MARK object, as 'length' cannot be overridden in IE11
		// note: 'length' is non-writable in node, and non-configurable in IE
		/*
		try {
			Object.defineProperty(Mark, a, func);
		} catch (error) {
			Mark[a] = api[a]; // 'length' is non-configurable in IE
		}
		*/
	}
	
	// define additional APIs on Mark prototype
	// content iterator
	Mark.prototype[Symbol.iterator] = function*() {
		let length = this[$length];
		for (let i = 0; i < length; i++) { yield this[i]; }
	}
	
	// Mark pragma constructor
	Mark.pragma = function(pragma, parent) {
		let con = constructors['!pragma'];
		if (!con) {
			con = Object.create(null);
			Object.defineProperty(con, 'pragma', {value:api.pragma});
			Object.defineProperty(con, 'parent', {value:api.parent});
			Object.defineProperty(con, 'valueOf', {value:Object.valueOf});
			Object.defineProperty(con, 'toString', {value:function() { return '[object Pragma]'; }});
			// any other API?
			constructors['!pragma'] = con;
		}
		let obj = Object.create(con);
		obj[$pragma] = pragma;  // pragma conent stored as Symbol
		if (parent) { obj[$parent] = parent; }
		return obj;
	}
	
    function isNameChar(c) {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') ||
            c === '_' || c === '$' || c === '.' || c === '-';
    }
    function isNameStart(c) {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_' || c === '$';
    }
	// exported for convenience
    Mark.isName = function(key) {
        if (typeof key !== 'string') {
            return false;
        }
        if (!isNameStart(key[0])) {
            return false;
        }
        var i = 1, length = key.length;
        while (i < length) {
            if (!isNameChar(key[i])) {
                return false;
            }
            i++;
        }
        return true;
    }	
	
	return Mark;
})();

// parse() is only defined on the static Mark API
MARK.parse = (function() {
	// This is a function that can parse a Mark text, producing a JavaScript data structure. 
	// It is a simple, recursive descent parser. It does not use eval or regular expressions, 
	// so it can be used as a model for implementing a Mark parser in other languages.
	"use strict";
	let UNEXPECT_END = "Unexpected end of input";
	
    let at,           	// The index of the current character
        lineNumber,   	// The current line number
        columnNumber, 	// The current column number
        ch,           	// The current character
		text,			// The text being parsed
		
        escapee = {
            "'":  "'",		// this is needed as we allows single quote
            '"':  '"',
            '\\': '\\',
            '/':  '/',
            '\n': '',       // Replace escaped newlines in strings w/ empty string
            b:    '\b',
            f:    '\f',
            n:    '\n',
            r:    '\r',
            t:    '\t'
        },
        ws = [
            ' ',
            '\t',
            '\r',
            '\n',
            '\v',
            '\f',
            '\xA0',
            '\uFEFF'
        ],
        
        renderChar = function(chr) {
            return chr === '' ? 'EOF' : "'" + chr + "'";
        },

        error = function(m) {
			// Call error when something is wrong.
			// todo: Still to read can scan to end of line
			var msg = m + " at line " + lineNumber + " column " + columnNumber + " of the Mark data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 30) + "...");
            var error = new SyntaxError(msg);
            // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
            error.at = at;
            // These two property names have been chosen to agree with the ones in Gecko, the only popular
            // environment which seems to supply this info on JSON.parse
            error.lineNumber = lineNumber;
            error.columnNumber = columnNumber;
            throw error;
        },

        next = function (c) {
			// If a c parameter is provided, verify that it matches the current character.
            if (c && c !== ch) {
                error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
            }

			// Get the next character. When there are no more characters,
			// return the empty string.
            ch = text.charAt(at);
            at++;
            columnNumber++;
            if (ch === '\n' || ch === '\r' && peek() !== '\n') {
                lineNumber++;
                columnNumber = 0;
            }
            return ch;
        },

        peek = function () {
			// Get the next character without consuming it or
			// assigning it to the ch varaible.
            return text.charAt(at);
        },

		// Parse an identifier.
        identifier = function () {
			// Normally, reserved words are disallowed here, but we
			// only use this for unquoted object keys, where reserved words are allowed,
			// so we don't check for those here. References:
			// - http://es5.github.com/#x7.6
			// - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
			// - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
			// TODO Identifiers can have Unicode "letters" in them; add support for those.

            var key = ch;

            // Identifiers must start with a letter, _ or $.
            if ((ch !== '_' && ch !== '$') && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
                error("Bad identifier as unquoted key");
            }

            // Subsequent characters can contain digits.
            while (next() && (
				('a' <= ch && ch <= 'z') ||
				('A' <= ch && ch <= 'Z') ||
				('0' <= ch && ch <= '9') ||
				ch === '_' || ch === '$' ||
				ch === '.' || ch === '-'  // add 2 special chars commonly used in html and xml names, which are not valid JS name chars
				)) {
                key += ch;
            }

            return key;
        },

		// Parse a number value.
        number = function () {
            let number, sign = '', string = '', base = 10;

            if (ch === '-' || ch === '+') {
                sign = ch;  next(ch);
            }

            // support for Infinity (could tweak to allow other words):
            if (ch === 'I') {
                number = word();
                if (typeof number !== 'number' || isNaN(number)) {
                    error('Unexpected word for number');
                }
                return (sign === '-') ? -number : number;
            }

            // support for NaN
            if (ch === 'N' ) {
              number = word();
              if (!isNaN(number)) {
                error('expected word to be NaN');
              }
              // ignore sign as -NaN also is NaN
              return number;
            }

            if (ch === '0') {
                string += ch;  next();
			} else {
                while (ch >= '0' && ch <= '9' ) {
                    string += ch;
                    next();
                }
                if (ch === '.') {
                    string += '.';
                    while (next() && ch >= '0' && ch <= '9') {
                        string += ch;
                    }
                }
                if (ch === 'e' || ch === 'E') {
                    string += ch;
                    next();
                    if (ch === '-' || ch === '+') {
                        string += ch;
                        next();
                    }
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        next();
                    }
                }			
			}

            if (sign === '-') {
                number = -string;
            } else {
                number = +string;
            }

            if (!isFinite(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

		// Parse a string value.
        string = function() {			
            var hex, i, string = '', triple = false,
                delim,      // double quote or single quote
                uffff;

			// when parsing for string values, we must look for ' or " and \ characters.
            if (ch === '"' || ch === "'") {
                delim = ch;
				if (peek() === delim && text.charAt(at+1) === delim) { // got tripple quote
					triple = true;  next();  next();
				}
                while (next()) {
                    if (ch === delim) {
                        next();
						if (!triple) { // end of string
							return string;
						}
						else if (ch === delim && peek() === delim) { // end of tripple quoted text
							next();  next();  return string;
						}
						else {
							string += delim;
						}
						// continue
                    }
					if (ch === '\\') { // escape sequence
						if (triple) { string += '\\'; } // treated as normal char
						else { // escape sequence
							next();
							if (ch === 'u') { // unicode escape sequence
								uffff = 0;
								for (i = 0; i < 4; i += 1) {
									hex = parseInt(next(), 16);
									if (!isFinite(hex)) {
										break;
									}
									uffff = uffff * 16 + hex;
								}
								string += String.fromCharCode(uffff);
							} 
							else if (ch === '\r') { // ignore the line-end, as defined in ES5
								if (peek() === '\n') {
									next();
								}
							} else if (typeof escapee[ch] === 'string') {
								string += escapee[ch];
							} else { 
								break;  // bad escape
							}
						}
                    } 
					// else if (ch === '\n') {
                        // unescaped newlines are invalid in JSON, but valid in Mark; 
                        // see: https://github.com/json5/json5/issues/24
                        // break;
                    // } 
					else { // normal char
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

		// Skip an inline comment
        inlineComment = function () {
			// Skip an inline comment, assuming this is one. The current character should
			// be the second / character in the // pair that begins this inline comment.
			// To finish the inline comment, we look for a newline or the end of the text.
            if (ch !== '/') {
                error("Not an inline comment");
            }
            do {
                next();
                if (ch === '\n' || ch === '\r') {
                    next();
                    return;
                }
            } while (ch);
        },

		// Skip a block comment
        blockComment = function () {
			// Skip a block comment, assuming this is one. The current character should be
			// the * character in the /* pair that begins this block comment.
			// To finish the block comment, we look for an ending */ pair of characters,
			// but we also watch for the end of text before the comment is terminated.
            if (ch !== '*') {
                error("Not a block comment");
            }
            do {
                next();
                while (ch === '*') {
                    next('*');
                    if (ch === '/') {
                        next('/');
                        return;
                    }
                }
            } while (ch);

            error("Unterminated block comment");
        },

		// Skip a comment
        comment = function () {
			// Skip a comment, whether inline or block-level, assuming this is one.
			// Comments always begin with a / character.
            if (ch !== '/') {
                error("Not a comment");
            }
            next('/');
            if (ch === '/') {
                inlineComment();
            } else if (ch === '*') {
                blockComment();
            } else {
                error("Unrecognized comment");
            }
        },

		// Skip whitespace and comments.
        white = function () {
			// Note that we're detecting comments by only a single / character.
			// This works since regular expressions are not valid JSON(5), but this will
			// break if there are other valid values that begin with a / character!
            while (ch) {
                if (ch === '/') {
                    comment();
                } else if (ws.indexOf(ch) >= 0) {
                    next();
                } else {
                    return;
                }
            }
        },

		// Parse true, false, or null.
        word = function () {
            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            case 'I':
                next('I');
                next('n');
                next('f');
                next('i');
                next('n');
                next('i');
                next('t');
                next('y');
                return Infinity;
            case 'N':
              next('N');
              next('a');
              next('N');
              return NaN;
            }
            error("Unexpected character " + renderChar(ch));
        },

        value,  // Place holder for the value function.

		// parse an array value
        array = function () {
            var array = [];
			
			next();  // skip the starting '['
			white();
			while (ch) {
				if (ch === ']') {
					next();
					return array;   // Potentially empty array
				}
				// ES5 allows omitting elements in arrays, e.g. [,] and [,null]. JSON and Mark don't allow this.
				if (ch === ',') {
					error("Missing array element");
				} else {
					array.push(value());
				}
				white();
				
				// comma is optional in Mark
				if (ch === ',') { next();  white(); }
			}
        },

		// Parse an object value
        object = function(parent) {
            let key, obj = {}, 
				extended = false, // whether the is extended Mark object or legacy JSON object
				hasBrace = false, // whether the object has any unescaped brace
				index = 0;  	
			// all 3 types: Mark object, JSON object, Mark pragma store reference to parent 
			if (parent) { obj[$parent] = parent; } 

			next();  // skip the starting '{'
			// store the current source position, in case we need to backtrack later
			let bkAt = at, bkLineNumber = lineNumber, bkColumnNumber = columnNumber;

			try {
				let putText = function(text) {
					// check preceding node
					if (index > 0 && typeof obj[index-1] === 'string') { // merge with previous text
						obj[index-1] += text;
					} else {
						Object.defineProperty(obj, index, {value:text, writable:true, configurable:true}); // make content non-enumerable
						index++;
					}
				},
				parseContent = function() {
					while (ch) {
						if (ch === '{') { // child object
							hasBrace = true;
							Object.defineProperty(obj, index, {value:object(obj), writable:true, configurable:true}); // make content non-enumerable
							index++;  
						}
						else if (ch === '"' || ch === "'") { // text node
							let str = string();
							// only output non empty text
							if (str) putText(str);
						}
						else if (ch === '}') { 
							next();  obj[$length] = index;
							return;
						}
						else {
							error("Unexpected character " + renderChar(ch));
						}
						white();
					}
					error(UNEXPECT_END);		
				};
				
				white();
				while (ch) {
					if (ch === '}') { // end of the object
						next();  
						if (extended) { obj[$length] = index; }
						return obj;   // potentially empty object
					}

					// scan the key
					if (ch === '"' || ch === "'") { // quoted key
						var str = string();  white();
						if (ch == ':') { // property, legacy JSON
							key = str;
						} else {
							if (extended) { // got text node
								// only output non-empty text
								if (str) putText(str);
								parseContent();
								return obj;
							}
							else if (!key) { // at the starting of the object
								// create the object
								obj = MARK(str, null, null, parent);
								extended = true;  key = str;
								continue;							
							}
							// else bad object
						}
					}
					else if (ch === '{') { // child object
						if (extended) {
							hasBrace = true;  parseContent();  return obj;
						}
						error("Unexpected character '{'");
					}
					else { // JSON5 or Mark unquoted key, which needs to be valid JS identifier.
						var ident = identifier();
						white();
						if (!key) { // at the starting of the object						
							if (ch != ':') { // assume is Mark object
								// console.log("got Mark object of type: ", ident);
								// create the object
								obj = MARK(ident, null, null, parent);
								extended = true;  key = ident;
								continue;
							}
							else { // JSON object
								if (!obj.constructor.name) { obj.constructor.name = 'Object'; } // IE11 does not set constructor.name to 'Object'
							}
						}
						key = ident;
					}
					
					if (ch == ':') { // key-value pair
						next();
						if (ch === '{') { hasBrace = true; }
						var val = value();
						if (extended && !isNaN(key*1)) { // any numeric key is rejected for Mark object
							error("Numeric key not allowed as Mark property name");
						}
						if (obj[key] && typeof obj[key] !== 'function') {
							error("Duplicate key not allowed: " + key);
						}
						obj[key] = val;
						white();
						// ',' is optional in Mark
						if (ch === ',') {
							next();  white();
						} 
					} else {
						error("Bad object");
					}
				}
				error(UNEXPECT_END);
			}
			catch (e) {
				if (hasBrace) { throw e; } // cannot be parsed as Mark pragma and throw the error again, as brace needs to be escaped in Mark pragma
				// restore parsing position, and try parse as Mark pragma
				at = bkAt;  lineNumber = bkLineNumber;  columnNumber = bkColumnNumber;
				ch = text.charAt(at - 1);
				
				let pragma = '';
				while (ch) {
					if (ch === '}') { // end of pragma
						next();
						return MARK.pragma(pragma, parent);
					}				
					else if (ch === '\\') { // escape '{', '}', ':', ';', as html, xml comment may contain these characters
						next();
						if (ch !== '{' && ch !== '}' && ch !== ':' && ch !== ';') { pragma += '\\'; }
					}
					else if (ch === '{' || ch === '}' || ch === ':') {
						throw e; // rethrow the error, assuming user wants to write JSON or Mark object
					}
					else if (ch === ';') {
						error("Character ';' should be escaped in Mark pragma");
					}
					pragma += ch;
					next();
				}
				error(UNEXPECT_END);
			}
        };

	// Parse a JSON value. 
	value = function () {
		// A JSON value could be an object, an array, a string, a number, or a word.
        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
        case "'":
            return string();
        case '-':
        case '+':
        case '.':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

	// Return the enclosed parse function. It will have access to all of the above functions and variables.
    return function(source, options) {
		// initialize the contextual variables
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
		text = String(source);
		
		if (!source) { text = '';  error(UNEXPECT_END); }
		if (typeof options === 'object' && options.format && options.format != 'mark') { // parse as other formats
			// is it better to use a Symbol here?
			if (!MARK.$convert) { MARK.$convert = require('./lib/mark.convert.js')(MARK); }
			return MARK.$convert.parse(source, options);
		} 
		// else // parse as Mark
        
		// start parsing as a JSON value
        var result = value();
        white();
        if (ch) {
            error("Syntax error");
        }
		
		// Mark does not support the legacy JSON reviver function:
		// If there is a reviver function, we recursively walk the new structure,
		// passing each name/value pair to the reviver function for possible
		// transformation, starting with a temporary root object that holds the result
		// in an empty key. If there is not a reviver function, we simply return the result.
		/*
        return typeof options === 'function' ? (function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return options.call(holder, key, value);
        }({'': result}, '')) : result;
		*/
		return result;
    };
}());

// stringify() is only defined on the static Mark API
// Mark stringify will not quote keys where appropriate
MARK.stringify = function(obj, options) {
	"use strict";
	
	var indentStr, space, omitComma;
	if (options)  {
		if (options.format && options.format !== 'mark') {
			// load helper on demand
			if (!MARK.$convert) { MARK.$convert = require('./lib/mark.convert.js')(MARK); }
			if (options.format === 'xml') return MARK.$convert.toXml(obj, options);
			if (options.format === 'html') return MARK.$convert.toHtml(obj, options);
		}
		
		// stringify as Mark
		omitComma = options.omitComma;
		space = options.space;
		if (space) {
			if (typeof space === "string") {
				indentStr = space;
			} else if (typeof space === "number" && space >= 0) {
				indentStr = makeIndent(" ", space, true);
			} else {
				// ignore space parameter
			}
			// indentation step no more than 10 chars
			if (indentStr && indentStr.length > 10) {
				indentStr = indentStr.substring(0, 10);
			}
		}
	}
	
	// Mark no longer supports replacer
	/*
	var replacer = null;
    if (options) {
		if (typeof options === "function" || isArray(options)) { replacer = options; }
		else if (typeof options !== "object") throw new Error('Option must be a function or an object');
    }
    var getReplacedValueOrUndefined = function(holder, key, isTopLevel) {
        var value = holder[key];
		
		// toJSON call might not be secure, so we don't call it
        // Replace the value with its toJSON value first, if possible 
        // if (value && typeof value.toJSON === "function") {
        //    value = value.toJSON();
        // }
		
        // If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
        // presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
        if (typeof(replacer) === "function") {
            return replacer.call(holder, key, value);
        } else if(replacer) {
            if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
                return value;
            } else {
                return undefined;
            }
        } else {
            return value;
        }
    };
	*/

    // polyfills
    function isArray(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    }

    function isDate(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    var objStack = [];
    function checkForCircular(obj) {
        for (var i = 0; i < objStack.length; i++) {
            if (objStack[i] === obj) {
                throw new TypeError("Converting circular structure to JSON");
            }
        }
    }

    function makeIndent(str, num, noNewLine) {
        var indent = noNewLine ? "" : "\n";
        for (var i = 0; i < num; i++) {
            indent += str;
        }
        return indent;
    }

    // Copied from Crokford's implementation of JSON
    // See https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
    // Begin
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
    function escapeString(string) {
		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    // End

    function internalStringify(obj_part) {
        var buffer, res;

        // Replace the value, if necessary
        // var obj_part = holder[key]; // getReplacedValueOrUndefined(holder, key, isTopLevel);

        if (obj_part && !isDate(obj_part)) {
            // unbox objects, don't unbox dates, since will turn it into number
            obj_part = obj_part.valueOf();
        }
        switch (typeof obj_part) {
            case "boolean":
                return obj_part.toString();

            case "number":
                if (isNaN(obj_part) || !isFinite(obj_part)) {
                    return "null";
                }
                return obj_part.toString();

            case "string":
                return escapeString(obj_part.toString());

            case "object":
                if (obj_part === null) { // null value
                    return "null";
                } 
				else if (isArray(obj_part)) { // Array
                    checkForCircular(obj_part);  // console.log('print array', obj_part);
                    buffer = "[";
                    objStack.push(obj_part);

                    for (var i = 0; i < obj_part.length; i++) {
                        res = internalStringify(obj_part[i]);
                        if (indentStr) buffer += makeIndent(indentStr, objStack.length);
                        if (res === null || typeof res === "undefined") {
                            buffer += "null";
                        } else {
                            buffer += res;
                        }
                        if (i < obj_part.length-1) {
                            buffer += omitComma ? ' ':',';
                        } else if (indentStr) {
                            buffer += "\n";
                        }
                    }
                    objStack.pop();
                    if (obj_part.length && indentStr) {
                        buffer += makeIndent(indentStr, objStack.length, true);
                    }
                    buffer += "]";
                }
				else { // pragma or object
                    checkForCircular(obj_part);  // console.log('print obj', obj_part);
                    buffer = "{";
                    var nonEmpty = false;
					if (!obj_part.constructor) { // assume Mark pragma
						// todo: should escape '{','}' in $pragma
						return obj_part[$pragma] ? '{' + obj_part[$pragma] + '}' : 'null'/* unknown object */;
					}
					// Mark or JSON object
					objStack.push(obj_part);
					// print object type-name, if any
					if (obj_part.constructor.name !== 'Object' || obj_part instanceof MARK) { 
						buffer += obj_part.constructor.name;  nonEmpty = true;
					} 
					// else JSON

					// print object attributes
					var hasAttr = false;
                    for (var prop in obj_part) {
						var value = internalStringify(obj_part[prop]);
						if (typeof value !== "undefined") {
							// buffer += makeIndent(indentStr, objStack.length);                            
							var key = MARK.isName(prop) ? prop : escapeString(prop);
							buffer += (hasAttr ? (omitComma ? ' ':', '):(nonEmpty ? ' ':''))+ key +":"+ value;
							hasAttr = true;  nonEmpty = true;
						}
                    }
					// print object content
					var length = obj_part[$length];
					if (length) {
						for (var i = 0; i<length; i++) {
							buffer += ' ';
							var item = obj_part[i];
							if (typeof item === "string") {
								if (indentStr) buffer += makeIndent(indentStr, objStack.length);
								buffer += escapeString(item.toString());
							}
							else if (typeof item === "object") {
								if (indentStr) buffer += makeIndent(indentStr, objStack.length);
								buffer += internalStringify(item);
							}
							else { console.log("unknown object", item); }
						}
					}
                    objStack.pop();
                    if (nonEmpty ) {
                        // buffer = buffer.substring(0, buffer.length-1) + makeIndent(indentStr, objStack.length) + "}";
						if (length && indentStr) { buffer += makeIndent(indentStr, objStack.length); }
						buffer += "}";
                    } else {
                        buffer = '{}';
                    }
                }
                return buffer;
            default:
                // functions and undefined should be ignored
                return undefined;
        }
    }

    // special case...when undefined is used inside of a compound object/array, return null.
    // but when top-level, return undefined
    if (obj === undefined) { return undefined; }
    return internalStringify(obj);
};

// export the Mark interface
if (typeof module === 'object')
module.exports = MARK;
