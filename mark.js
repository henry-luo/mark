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
let $convert = null;  // Mark Convert API

let base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// polyfills
function isArray(obj) {
	return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
}

function isNameStart(c) {
	return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_' || c === '$';
}
	
// static Mark API
var MARK = (function() {
	"use strict";
	// cached constructors for the Mark objects
	let constructors = {};	

	// patch IE11
	if (!constructors.constructor.name) { // IE11 does not set constructor.name to 'Object'
		obj.constructor.name = 'Object';
	}

	// Mark object constructor
	function Mark(typeName, props, contents) {
		"use strict";
		// handle special shorthand
		if (arguments.length === 1 && typeName[0] === '{') { 
			return MARK.parse(typeName); 
		}
		
		// 1. prepare the constructor
		let con = constructors[typeName];
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
		let obj = Object.create(con.prototype);
		
		// 3. copy properties, numeric keys are not allowed
		if (props) { 
			for (let p in props) {
				// accept only non-numeric key; and we do no check key duplication here, last definition wins
				if (isNaN(p*1)) { obj[p] = props[p]; }
			}
		}
		
		// 4. copy contents if any
		let len = 0;
		if (contents) { 
			let prevType = null;
			function addContents(items) {
				for (let val of items) {
					let t = typeof val;
					if (t === 'string') {
						if (!val.length) continue; // skip empty text '', ""
						if (prevType === 'string') { 
							len--;  val = obj[len] + val;  // merge text nodes
						}
					}
					else if (t === 'object') {
						if (val === null) continue; // skip null value
						else if (val instanceof Array) { // expanded it inline
							addContents(val);  continue;
						}
						// else, Mark object or pragma
						val[$parent] = obj;  // set $parent
					}
					else if (t === 'undefined') {
						continue;
					}
					else { // other primitive values are converted to string
						// val might be null
						val = val.toString(); // convert to string, as Mark only accept text and Mark object as content
						if (prevType === 'string') {
							len--;  val = obj[len] + val;  // merge text nodes
						}
					}
					Object.defineProperty(obj, len, {value:val, writable:true, configurable:true}); // make content non-enumerable
					prevType = t;  len++;
				}
			}
			// contents can be an array or just single value
			addContents(isArray(contents) ? contents : [contents]);
		}
		// set $length
		obj[$length] = len;
		return obj;
	};
		
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
		// get parent
		parent: function(pa) {
			return this[$parent];
		},
		// get pragma content
		pragma: function(value) {
			return this[$pragma];
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
		
		// each: like Array.prototype.forEach
		each: function(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			let i = 0, obj = Object(this);
			for (const n of obj) {
				func.call(thisArg || obj, n, i, obj);
				i++;
			}
		},
		
		// Mark selector APIs
		/*
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
		*/
		
		// conversion APIs
		source: function(options) {
			return MARK.stringify(this, options);
		},
		text : function() {
			let txt = [];
			let _text = function(obj) {
				for (let n of obj) {
					if (typeof n === 'string') { txt.push(n); }
					else if (n.constructor) { _text(n); }
				}
			}
			_text(this);
			return txt.join('');
		},
		/*
		json: function() {
			let _json = function(obj) {
				let jn = {};  jn[0] = obj.constructor.name;
				for (let p in obj) { jn[p] = obj[p]; }
				for (let i = 0; i < obj.length(); i++) {
					let n = obj[i];
					if (typeof n === 'string') { jn[i+1] = n; }
					else if (typeof n === 'object') {
						if (!n.constructor) { // pragma
							jn[i+1] = {'.':n.pragma()};
						}
						else { jn[i+1] = _json(n); }
					}
				}
				return jn;
			}
			return _json(this);			
		},
		*/
		html: function(options) {
			let opt = options || {};  opt.format = 'html';
			return MARK.stringify(this, opt);
		},
		xml: function(options) {
			let opt = options || {};  opt.format = 'xml';
			return MARK.stringify(this, opt);
		},		
	}
	// set the APIs
	for (let a in api) {
		// API functions are non-enumerable
		Object.defineProperty(Mark.prototype, a, {value:api[a], writable:true, configurable:true});  
		// no longer set the APIs on static MARK object, as 'length' is non-writable in node, and non-configurable in IE11
		/*
		try {
			Object.defineProperty(Mark, a, func);
		} catch (error) {
			Mark[a] = api[a]; // 'length' is non-configurable in IE
		}
		*/
	}
	// load mark.selector APIs
	try {
		require('./lib/mark.selector.js')(Mark);
	} catch (e) {
		console.trace("No Mark Selector API", e.message);
	}	
	// load mark.mutate APIs
	try {
		require('./lib/mark.mutate.js')(Mark, $length);
	} catch (e) {
		console.trace("No Mark Mutate API", e.message);
	}
	
	// define additional APIs on Mark prototype
	// content iterator
	Mark.prototype[Symbol.iterator] = function*() {
		let length = this[$length];
		for (let i = 0; i < length; i++) { yield this[i]; }
	}
	
	// Mark pragma constructor
	Mark.pragma = function(pragma) {
		let con = constructors[$pragma];
		if (!con) {
			con = Object.create(null);
			Object.defineProperty(con, 'pragma', {value:api.pragma});
			Object.defineProperty(con, 'parent', {value:api.parent});
			Object.defineProperty(con, 'valueOf', {value:Object.valueOf});
			Object.defineProperty(con, 'toString', {value:function() { return '[object Pragma]'; }});
			constructors[$pragma] = con;
		}
		let obj = Object.create(con);
		obj[$pragma] = pragma;  // pragma conent stored as Symbol
		return obj;
	}
	
    function isNameChar(c) {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') ||
            c === '_' || c === '$' || c === '.' || c === '-';
    }
	
	// check if a string is a Mark identifier, exported for convenience
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
        columnStart, 	// The index of column start char
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
	ws = [' ', '\t', '\r', '\n'],
        
    renderChar = function(chr) {
		return chr === '' ? 'EOF' : "'" + chr + "'";
	},

	error = function(m) {
		// Call error when something is wrong.
		// todo: Still to read can scan to end of line
		var columnNumber = at - columnStart;
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
		// Get the next character. When there are no more characters, return the empty string.
		ch = text.charAt(at);
		at++;
		if (ch === '\n' || ch === '\r' && peek() !== '\n') {
			lineNumber++;  columnStart = at;
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
		// To keep it simple, Mark identifiers do not support Unicode "letters", as in JS; if needed, use quoted syntax
		var key = ch;

		// identifiers must start with a letter, _ or $.
		if ((ch !== '_' && ch !== '$') && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
			error("Bad identifier as unquoted key");
		}

		// subsequent characters can contain digits.
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

	// Parse an inline comment
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

	// Parse a block comment
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

	// Parse a comment
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

	// Parse whitespace and comments.
	white = function() {
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

	// Parse true, false, null, Infinity, NaN
	word = function() {
		switch (ch) {
		case 't':
			if (text[at] === 'r' && text[at+1] === 'u' && text[at+2] === 'e' && !isNameStart(text[at+3])) {
				ch = text[at+3];  at += 4;  return true;
			}
			break;
		case 'f':
			if (text[at] === 'a' && text[at+1] === 'l' && text[at+2] === 's' && text[at+3] === 'e' && !isNameStart(text[at+4])) {
				ch = text[at+4];  at += 5;  return false;
			}				
			break;
		case 'n':
			if (text[at] === 'u' && text[at+1] === 'l' && text[at+2] === 'l' && !isNameStart(text[at+3])) {
				ch = text[at+3];  at += 4;  return null;
			}
			break;
		case 'I':
			if (text[at] === 'n' && text[at+1] === 'f' && text[at+2] === 'i' && text[at+3] === 'n' && text[at+4] === 'i' 
				&& text[at+5] === 't' && text[at+6] === 'y' && !isNameStart(text[at+7])) {
				ch = text[at+7];  at += 8;  return Infinity;
			}
			break;
		case 'N':
			if (text[at] === 'a' && text[at+1] === 'N' && !isNameStart(text[at+2])) {
				ch = text[at+2];  at += 3;  return NaN;
			}
		}
		error("Unexpected character " + renderChar(ch));
	},

	value,  // Place holder for the value function.

	// Parse an array
	array = function() {
		var array = [];
		
		next();  // skip the starting '['
		white();
		while (ch) {
			if (ch === ']') {
				next();
				return array;   // Potentially empty array
			}
			// ES5 allows omitted elements in arrays, e.g. [,] and [,null]. JSON and Mark don't allow this.
			if (ch === ',') {
				error("Missing array element");
			} else {
				array.push(value());
			}
			white();
			
			// comma is optional in Mark
			if (ch === ',') { next();  white(); }
		}
	};

	// Parse binary
	// Use a lookup table to find the index.
	let lookup = new Uint8Array(256);
	lookup.fill(65); // denote invalid value
	for (var i = 0; i < 64; i++) {
		lookup[base64.charCodeAt(i)] = i;
	}
	// ' ', \t', '\r', '\n' spaces also allowed in base64 stream
	lookup[32] = lookup[9] = lookup[13] = lookup[10] = 64;

	let binary = function(parent) {
		at++;  // skip the starting '{:'
		if (text[at] === '~') { // base85
		}
		else { // base64
			// code based on https://github.com/niklasvh/base64-arraybuffer
			let end = text.indexOf('}', at), bufEnd = end;  // scan binary end
			if (end < 0) { error("Missing base64 end delimiter"); }
			// strip optional padding
			if (text[bufEnd-1] === '=') { // 1st padding
				bufEnd--;
				if (text[bufEnd-1] === '=') { // 2nd padding
					bufEnd--;
				}
			}
			if (bufEnd <= at) { error("Invalid base64 encoding"); }
			// console.log('binary char length: ', bufEnd - at);

			// first run decodes into base64 int values, and skip the spaces
			let base = new Uint8Array(new ArrayBuffer(bufEnd - at)), p = 0;
			while (at < bufEnd) {
				let code = lookup[text.charCodeAt(at)];  // console.log('bin: ', text[at], code);
				if (code > 64) { error("Invalid base64 encoding"); }
				if (code < 64) { base[p++] = code; }
				// else skip spaces
				at++;
			}
			at = end+1;  next();  // skip '}'

			// second run decodes into actual binary data
			let len = Math.floor(p * 0.75), code1, code2, code3, code4,
				buffer = new ArrayBuffer(len), bytes = new Uint8Array(buffer);
			console.log('binary length: ', len);
			for (let i = 0, p = 0; p < len; i += 4) {
				code1 = base[i];  code2 = base[i+1];
				code3 = base[i+2];  code4 = base[i+3];
				bytes[p++] = (code1 << 2) | (code2 >> 4);
				// extra bytes will be ignored by JS arraybuffer
				bytes[p++] = ((code2 & 15) << 4) | (code3 >> 2);
				bytes[p++] = ((code3 & 3) << 6) | (code4 & 63);
			}
			// console.log('binary decoded length:', p);
			buffer[$parent] = parent;
			return buffer;
		}
	},

	// Parse an object, pragma or binary
	object = function(parent) {
		let obj = {}, 
			key = null, 		// property key
			extended = false, 	// whether the is extended Mark object or legacy JSON object
			hasBrace = false, 	// whether the object has any unescaped brace
			index = 0;  	
		// all 3 types: Mark object, JSON object, Mark pragma store reference to parent 
		if (parent) { obj[$parent] = parent; } 

		next();  // skip the starting '{'
		// store the current source position, in case we need to backtrack later
		let bkAt = at, bkLineNumber = lineNumber, bkColumnStart = columnStart;

		let putText = function(text) {
			// check preceding node
			if (index > 0 && typeof obj[index-1] === 'string') {
				// merge with previous text
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
					let child = (text[at] === ':') ? binary(obj) : object(obj);  child[$parent] = obj;
					Object.defineProperty(obj, index, {value:child, writable:true, configurable:true}); // make content non-enumerable
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
		},
		parsePragma = function() {
			if (hasBrace || key) { error("Bad object"); } // cannot be parsed as Mark pragma, as brace needs to be escaped in Mark pragma
			// restore parsing position, and try parse as Mark pragma
			at = bkAt;  lineNumber = bkLineNumber;  columnStart = bkColumnStart;
			ch = text.charAt(at - 1);
			
			let pragma = '';
			while (ch) {
				if (ch === '}') { // end of pragma
					next();
					let pgm = MARK.pragma(pragma);  pgm[$parent] = parent;
					return pgm;
				}				
				else if (ch === '\\') { 
					// escape seq for '{', '}', ':', ';', as html, xml comment may contain these characters
					next();
					if (ch !== '{' && ch !== '}' && ch !== ':' && ch !== ';') { pragma += '\\'; }
					// else treated as normal character
				}
				else if (ch === '{' || ch === '}' || ch === ':') {
					error("Bad object"); // throw error 'Bad object', assuming user wants to write JSON or Mark object, not pragma
				}
				else if (ch === ';') {
					error("Character ';' should be escaped in Mark pragma");
				}
				pragma += ch;
				next();
			}
			error(UNEXPECT_END);
		};
		
		white();
		while (ch) {
			if (ch === '}') { // end of the object
				next();  
				if (extended) { obj[$length] = index; }
				return obj;   // could be empty object
			}
			// scan the key
			if (ch === '{') { // child object
				if (extended) {
					hasBrace = true;  parseContent();  return obj;
				}
				error("Unexpected character '{'");
			}
			if (ch === '"' || ch === "'") { // quoted key
				var str = string();  white();
				if (ch === ':') { // property or JSON object
					key = str;
				} else {
					if (extended) { // already got type name
						// only output non-empty text
						if (str) putText(str);
						if (ch === '}' || ch === '{' || ch === '"' || ch === "'") { 
							parseContent();  return obj;
						}
						else { return parsePragma(); }
					}
					else if (!key) { // at the starting of the object
						// create the object
						obj = MARK(str, null, null);
						extended = true;  // key = str;
						continue;							
					}
					else { 
						return parsePragma();
					}
				}
			}
			// Mark key or binary literal
			else if (ch==='_' || ch==='$' || 'a'<=ch && ch<='z' || 'A'<=ch && ch<='Z') {
				// Mark unquoted key, which needs to be valid JS identifier.
				var ident = identifier();  white();
				if (ch == ':') { // property value
					key = ident;
				} else {
					if (!extended) { // start of Mark object
						obj = MARK(ident, null, null);
						extended = true;  // key = ident;
						continue;
					}
					return parsePragma();
				}
			}
			else { 
				return parsePragma();
			}
			
			// key-value pair
			// assert(ch == ':');
			next(); // skip ':'
			if (ch === '{') { hasBrace = true; }
			var val = value();
			if (extended && !isNaN(key*1)) { // any numeric key is rejected for Mark object
				error("Numeric key not allowed as Mark property name");
			}
			if (obj[key] && typeof obj[key] !== 'function') {
				error("Duplicate key not allowed: " + key);
			}
			obj[key] = val;  white();
			// ',' is optional in Mark
			if (ch === ',') {
				next();  white();
			} 
		}
		error(UNEXPECT_END);
	};

	// Parse a JSON value. 
	value = function() {
		// A JSON value could be an object, an array, a string, a number, or a word.
        white();
        switch (ch) {
        case '{':
            return (text[at] === ':') ? binary() : object();
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
        at = 0;  lineNumber = 1;  columnStart = at;  ch = ' ';
		text = String(source);
		
		if (!source) { text = '';  error(UNEXPECT_END); }
		if (typeof options === 'object' && options.format && options.format != 'mark') { // parse as other formats
			if (!$convert) { $convert = require('./lib/mark.convert.js')(MARK); }
			return $convert.parse(source, options);
		} 
		// else // parse as Mark
        
		// start parsing the root value
        var result = value();
        white();
        if (ch) { error("Expect end of input"); }
		// Mark does not support the legacy JSON reviver function
		return result;
    };
}());

// stringify() is only defined on the static Mark API
// Mark stringify will not quote keys where appropriate
MARK.stringify = function(obj, options) {
	"use strict";
	
	var indentStep, indentStrs, space, omitComma;
	
    function indent(num, noNewLine) {
		if (num >= indentStrs.length) { // expand the cached indent strs
			for (var i = indentStrs.length; i <= num; i++) {
				indentStrs[i] = indentStrs[i-1] + indentStep;
			}
		}
        return noNewLine ? indentStrs[num] : "\n" + indentStrs[num];
    }	
	
	// option handling
	if (options)  {
		omitComma = options.omitComma;
		space = options.space;
		indentStrs = [''];
		if (space) {
			if (typeof space === "string") {
				indentStep = space;
			} else if (typeof space === "number" && space >= 0) {
				indentStep = new Array(space + 1).join(" ");
			} else {
				// unknown type, ignore space parameter
				indentStep = '';
			}
			// indentation step no more than 10 chars
			if (indentStep && indentStep.length > 10) {
				indentStep = indentStep.substring(0, 10);
			}
		}
		
		if (options.format && options.format !== 'mark') {
			// load helper on demand
			if (!$convert) { $convert = require('./lib/mark.convert.js')(MARK); }
			$convert.indent = indent;
			if (options.format === 'xml' || options.format === 'html') 
				return $convert.toSgml(obj, options);
			else return null;
		}
		// else stringify as Mark	
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

    function _stringify(value) {
        let buffer;

        // Mark no longer supports JSON replacer
		
        if (value && !isDate(value)) {
            // unbox objects, don't unbox dates, since will turn it into number
            value = value.valueOf();
        }
        switch (typeof value) {
            case "boolean":
                return value.toString();

            case "number":
                if (isNaN(value) || !isFinite(value)) {
                    return "null";
                }
                return value.toString();

            case "string":
                return escapeString(value.toString());

            case "object":
                if (value === null) { // null value
                    return "null";
                } 
				else if (isArray(value)) { // Array
                    checkForCircular(value);  // console.log('print array', value);
                    buffer = "[";
                    objStack.push(value);

                    for (var i = 0; i < value.length; i++) {
                        let res = _stringify(value[i]);
                        if (indentStep) buffer += indent(objStack.length);
                        if (res === null || res === undefined) { 
							// undefined is also converted to null, as Mark and JSON does not support 'undefined' value
                            buffer += "null";
                        } else {
                            buffer += res;
                        }
                        if (i < value.length-1) {
                            buffer += omitComma ? ' ':',';
                        } else if (indentStep) {
                            buffer += "\n";
                        }
                    }
                    objStack.pop();
                    if (value.length && indentStep) {
                        buffer += indent(objStack.length, true);
                    }
                    buffer += "]";
                }
				else if (value instanceof ArrayBuffer) { // binary
					var bytes = new Uint8Array(value), i, fullLen = bytes.length, len = fullLen - (fullLen % 3);
					buffer = '{:';
					// bulk encoding
					for (i = 0; i < len; i+=3) {
						buffer += base64[bytes[i] >> 2];
						buffer += base64[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
						buffer += base64[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
						buffer += base64[bytes[i + 2] & 63];
					}
					// trailing bytes and padding
					if (fullLen % 3) {
						buffer += base64[bytes[i] >> 2] + base64[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)] +
							(fullLen % 3 === 2 ? base64[(bytes[i + 1] & 15) << 2] : "=") + "=";
					}
					buffer += '}';
				}
				else { // pragma or object
                    checkForCircular(value);  // console.log('print obj', value);
                    buffer = "{";
                    var nonEmpty = false;
					if (!value.constructor) { // assume Mark pragma
						// todo: should escape '{','}' in $pragma
						return value[$pragma] ? '{' + value[$pragma] + '}' : 'null'/* unknown object */;
					}
					// Mark or JSON object
					objStack.push(value);
					// print object type-name, if any
					if (value.constructor.name !== 'Object' || value instanceof MARK) { 
						buffer += value.constructor.name;  nonEmpty = true;
					} 
					// else JSON

					// print object attributes
					let hasAttr = false;
                    for (var prop in value) {
						// prop of undefined value is omitted, as Mark and JSON does not support 'undefined' value
						let res = _stringify(value[prop]);
						if (res !== undefined) {                           
							let key = MARK.isName(prop) ? prop : escapeString(prop);
							buffer += (hasAttr ? (omitComma ? ' ':', '):(nonEmpty ? ' ':''))+ key +":"+ res;
							hasAttr = true;  nonEmpty = true;
						}
                    }
					// print object content
					let length = value[$length];
					if (length) {
						for (let i = 0; i<length; i++) {
							buffer += ' ';
							let item = value[i];
							if (typeof item === "string") {
								if (indentStep) buffer += indent(objStack.length);
								buffer += escapeString(item.toString());
							}
							else if (typeof item === "object") {
								if (indentStep) buffer += indent(objStack.length);
								buffer += _stringify(item);
							}
							else { console.log("unknown object", item); }
						}
					}
                    objStack.pop();
                    if (nonEmpty ) {
                        // buffer = buffer.substring(0, buffer.length-1) + indent(objStack.length) + "}";
						if (length && indentStep) { buffer += indent(objStack.length); }
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
    return _stringify(obj);
};

// export the Mark interface
if (typeof module === 'object')
module.exports = MARK;
