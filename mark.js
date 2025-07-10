// Markup Notation. See README.md for details.
//
// Mark parser is based on JSON5 at:
// https://github.com/json5/json5/blob/master/lib/json5.js
// which is further based of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

"use strict";

// symbols used internally
const $length = Symbol.for('Mark.length'), // for content length
	_length = Symbol.for('Mark.length-property'), // for property length
	$parent = Symbol.for('Mark.parent'); // for parent object
	
const ws = [' ', '\t', '\r', '\n'];
let $convert = null,  // Mark Convert API
	$ctrs = {};	// cached constructors for the Mark objects

if (!$ctrs.constructor.name) { 
	// patch IE11, as it does not set constructor.name to 'Object'
	$ctrs.constructor.name = 'Object';
}

// MARK is the static Mark API, it is different from the Mark.prototype that Mark object extends
let MARK = (function() {
	function push(val) {
		let len = this[$length];
		let t = typeof val;
		if (t === 'string') {
			if (!val.length) return; // skip empty text '', ""
			let prevType = len ? (typeof this[len - 1]):null;
			if (prevType === 'string') { 
				len--;  val = this[len] + val;  // merge text nodes
			}
		}
		else if (t === 'object') { // map or element
			if (val === null) return this; // skip null value
			else if (val instanceof Array) { // expanded it inline
				for (let v of val) { push.call(this, v); }
				return this;
			}
			// else, Mark object
			val[$parent] = this;  // set $parent
		}
		else if (t === 'undefined') {
			return this;
		}
		else { // other primitive values are converted to string
			val = val.toString(); // convert to string, as Mark only accept text and Mark object as content
			let prevType = len ? (typeof this[len - 1]):null;
			if (prevType === 'string') {
				len--;  val = this[len] + val;  // merge text nodes
			}
		}
		Object.defineProperty(this, len, {value:val, writable:true, configurable:true}); // make content non-enumerable
		this[$length] = len + 1;
		// additional params
		for (let i=1; i<arguments.length; i++) {
			push.call(this, arguments[i]);
		}
		return this;  // for call chaining
	}
	
	// Mark.prototype and Mark object constructor
	function Mark(typeName, props, contents) {
		// special shorthand for constructing Mark from source
		let char = typeName[0];
		if (arguments.length === 1 && (char === '<' || char === '{' || char === '[' || char === '(')) { 
			return MARK.parse(typeName); 
		}
		
		// 1. prepare the constructor
		if (typeof typeName !== 'string') {
			if (this instanceof Mark) { // called through new operator
				this[$length] = 0;
				// no need to do further construction
				// props, contents are not supported at the moment
				return;
			}
			throw "Type name should be a string";
		}
		let con = $ctrs[typeName];
		if (!con) {
			con = $ctrs[typeName] = function(){};
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
		obj[$length] = 0;
		if (contents) { push.call(obj, contents); }
		return obj;
	};
		
	// Mark object API functions
	let api = {
		// object 'properties': just use JS Object.keys(), Object.values(), Object.entries() to work with the properties
		
		// return the content items
		contents: function() { 
			let list = [];
			for (let c of this) { list.push(c); }
			return list;
		},
		
		// get parent
		parent: function(pa) {
			return this[$parent];
		},

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
		html: function(options) {
			let opt = options || {};  opt.format = 'html';
			return MARK.stringify(this, opt);
		},
		xml: function(options) {
			let opt = options || {};  opt.format = 'xml';
			return MARK.stringify(this, opt);
		},		
	}
	// setup array-like APIs
	let ap = Array.prototype;
	function wrapped(obj) { return Object.create(obj, {length:{value:obj[$length]}}); }	
	for (let f of [ap.filter, ap.map, ap.reduce, ap.every, ap.some, ap.forEach, ap.includes, ap.indexOf, ap.lastIndexOf, ap.slice]) {
		api[f.name] = function() { return f.apply(this[_length] !== null ? wrapped(this):this, arguments); }
	}
	api['each'] = api.forEach; // alias
	
	// set the APIs
	for (let a in api) {
		// API functions are non-enumerable
		Object.defineProperty(Mark.prototype, a, {value:api[a], writable:true, configurable:true});  
		// no longer set the APIs on static MARK object, as 'length' is non-writable in node, and non-configurable in IE11
	}
	
	// Additional APIs on Mark prototype
	
	// length getter
	let desc = {
		set:function(value) {
			this[_length] = value;
			// also need to change length to enumerable
			let enumDesc = Object.assign({}, desc);  enumDesc.enumerable = true;
			Object.defineProperty(this, 'length', enumDesc);
		}, 
		get:function() { return this[_length] !== undefined ? this[_length]:this[$length]; }, 
		configurable:true
	};
	Object.defineProperty(Mark.prototype, 'length', desc);
	
	// content iterator
	Mark.prototype[Symbol.iterator] = function*() {
		let length = this[$length];
		for (let i = 0; i < length; i++) { yield this[i]; }
	}
	
	// static Mark lengthOf function
	Mark.lengthOf = function(obj) {
		return obj == null ? null : (obj[$length] !== undefined ? obj[$length]:obj.length);
	}
	
	// load additional APIs
	// try { // mark.selector APIs
	// 	require('./lib/mark.selector.js')(Mark);
	// } catch (e) {
	// 	console.trace("No Mark Selector API", e.message);
	// } 
	// try { // mark.mutate APIs
	// 	require('./lib/mark.mutate.js')(Mark, push);
	// } catch (e) {
	// 	console.trace("No Mark Mutate API", e.message);
	// }	
	return Mark;
})();

// check if a string is a Mark identifier, exported for convenience
function isNameChar(c) {
	return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') ||
		c === '_' || c === '$' || c === '.' || c === '-';
}
function isNameStart(c) {
	return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_' || c === '$';
}
MARK.isName = function(key) {
	if (typeof key !== 'string') { return false; }
	if (!isNameStart(key[0])) { return false; }
	var i = 1, length = key.length;
	while (i < length) {
		if (!isNameChar(key[i])) { return false; }
		i++;
	}
	return true;
}
	
const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// parse() is only defined on the static Mark API
MARK.parse = (function() {
	// This is a function that can parse a Mark text, producing a JavaScript data structure. 
	// It is a simple, recursive descent parser. It does not use eval or regular expressions, 
	// so it can be used as a model for implementing a Mark parser in other languages.
	"use strict";
	let UNEXPECT_END = "Unexpected end of input",
		UNEXPECT_CHAR = "Unexpected character ";
	
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
		// these two property names have been chosen to agree with the ones in Gecko, the only popular
		// environment which seems to supply this info on JSON.parse
		error.lineNumber = lineNumber;
		error.columnNumber = columnNumber;
		throw error;
	},

	next = function (c) {
		// if a c parameter is provided, verify that it matches the current character.
		if (c && c !== ch) {
			error("Expected '" + c + "' instead of " + renderChar(ch));
		}
		// get the next character. When there are no more characters, return the empty string.
		ch = text.charAt(at);  at++;
		if (ch === '\n' || ch === '\r' && text[at] !== '\n') {
			lineNumber++;  columnStart = at;
		}
		return ch;
	},

	// Parse an identifier.
	identifier = function () {
		// to keep it simple, Mark identifiers do not support Unicode "letters", as in JS; if needed, use quoted syntax
		var key = ch;

		// identifiers must start with a letter, _ or $.
		if ((ch !== '_' && ch !== '$') && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
			error(UNEXPECT_CHAR + renderChar(ch));
		}
		// subsequent characters can contain digits
		while (next() && (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ('0' <= ch && ch <= '9') || ch === '_' || ch === '$' ||
			// '.' and '-' are commonly used in html and xml names, but not valid JS name chars
			ch === '.' || ch === '-')) {
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
		if (ch === 'i') {
			number = word();
			if (typeof number !== 'number') {
				error('Unexpected number');
			}
			return (sign === '-') ? -number : number;
		}

		// support for NaN
		if (ch === 'n' ) {
			number = word();
			if (!isNaN(number)) {
				error("Expected 'nan'");
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
	_string = function() {			
		var hex, i, string = '', 
			delim, // double quote or single quote
			uffff;

		// when parsing for string values, we must look for ' or " and \ characters.
		if (ch === '"' || ch === "'") {
			delim = ch;
			while (next()) {
				if (ch === delim) { // end of string
					next();  return string;
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
							if (text[at] === '\n') {
								next();
							}
						} else if (typeof escapee[ch] === 'string') {
							string += escapee[ch];
						} else { 
							break;  // bad escape
						}
					}
				}
				else { // normal char
					// control characters like TAB and LF are invalid in JSON, but valid in Mark; 
					string += ch;
				}
			}
		}
		error("Bad string");
	},

	string = _string,

	symbol = function() {
		let str = _string();
		return Symbol.for(str);
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
				next();  return;
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
				next();
				if (ch === '/') { next();  return; }
			}
			if (ch === '/' && text[at] === '*') { // nested block comment
				next();  blockComment();
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

	isSuffix = function(suffix) {
		let len = suffix.length;
		for (let i=0; i<len; i++) {
			if (text[at+i] !== suffix[i]) { return false; }
		}
		if (isNameStart(text[at+len])) { return false; }
		ch = text[at+len];  at += len + 1;  
		return true;
	},
	
	// Parse true, false, null, Infinity, NaN
	word = function() {
		switch (ch) {
		case 'b':  if (text[at] === "'") { return binary(); }  break;  // binary value
		case 'f':  if (isSuffix('alse')) { return false; }  break;
		case 'i':  if (isSuffix('nf')) { return Infinity; }  break;
		case 't':  
			if (text[at] === "'") { return datetime(); }
			if (isSuffix('rue')) { return true; }  
			break;
		case 'n':  
			if (isSuffix('ull')) { return null; }
			if (isSuffix('an')) { return NaN; }
			break;
		}
		return identifier(); // treated as string
	},

	scan2d =  function() {
		if (ch >= '0' && ch <= '9' && text[at] >= '0' && text[at] <= '9') {
			let num = ch + text[at];  
			at++;  next();
			return parseInt(num);
		}
		error("Expected 2-digit number");
	},
	scan3d = function() {
		if (ch >= '0' && ch <= '9' && text[at] >= '0' && text[at] <= '9' && text[at+1] >= '0' && text[at+1] <= '9') {
			let num = ch + text[at] + text[at+1];  
			at += 2;  next();
			return parseInt(num);
		}
		error("Expected 3-digit number");
	},

	datetime = function() {
		// Parse datetime in format: t'[YYYY[-MM[-DD]]][T|t|spaces][h|hh[:mm[:ss[.sss]]]][Z|+/-HHMM]'
		// Supports: time only, date only, or date-time combinations
		// Date-time separators: T, t, or spaces (but not mixed)
		// Time formats: HH, HH.HHH, HH:MM, HH:MM:SS, HH:MM:SS.sss with optional timezone
		at++;  next(); // skip the starting "t'"
		
		// Find the closing quote and extract datetime string
		let start = at - 1;
		let end = text.indexOf("'", start);
		if (end < 0) { error("Missing closing quote for datetime"); }
		let dtStr = text.slice(start, end).trim();
		
		// Use single regex with capturing groups to detect type and validate format
		// Factor out common time pattern to avoid duplication  
		let timePattern = '\\d{2}(?:[:.]\\\d{2}(?:[:.]\\\d{2}(?:\\\.\\\d{3})?)?)?';
		let dtRegex = new RegExp(`^(?:(\\d{4}(?:-\\d{2}(?:-\\d{2})?)?)(?:(?:[Tt]|\\s+)(${timePattern})?)?|(${timePattern}))(?:[zZ]|[+-]\\d{2}:?\\d{2})?$`);
		let match = dtRegex.exec(dtStr);
		if (!match) {
			error("Invalid datetime format: " + dtStr);
		}
		
		// Determine type from capturing groups
		let datePart = match[1];           // YYYY[-MM[-DD]] from datetime
		let datetimeTimePart = match[2];   // time part from datetime (after separator)
		let timeOnlyPart = match[3];       // time-only part
		
		let dateOnly = datePart && !datetimeTimePart && !timeOnlyPart;
		let timeOnly = !datePart && timeOnlyPart;
		
		// Advance parser position past the datetime string
		at = end + 1;
		next(); // skip closing quote
		
		// Normalize the datetime string for JavaScript Date constructor
		let normalizedStr = dtStr;
		// ensure 'T' separator for date-time (replace spaces/t with 'T' if present)
		normalizedStr = normalizedStr.replace(/(\d{4}-\d{2}-\d{2})(?:[Tt]|\s+)(\d{2})/, '$1T$2');
		// handle time-only single hour with optional timezone
		normalizedStr = normalizedStr.replace(/^(\d{2})([zZ]|[+-]\d{2}:?\d{2})?$/, (match, hour, tz) => {
			// convert HH to HH:00
			return hour + ':00' + (tz || '');
		});
		// handle datetime with single hour and optional timezone
		normalizedStr = normalizedStr.replace(/T(\d{2})([zZ]|[+-]\d{2}:?\d{2})?$/, (match, hour, tz) => {
			return 'T' + hour + ':00' + (tz || '');
		});
		// normalize timezone format: +/-HHMM to +/-HH:MM (if not already formatted)
		normalizedStr = normalizedStr.replace(/([+-])(\d{2})(\d{2})$/, '$1$2:$3');
		
		// handle time-only format by adding default date
		if (timeOnly) {
			// fix the date to '2000-01-01'
			normalizedStr = '2000-01-01' + 'T' + normalizedStr;
		}
		
		// Create Date object
		try {
			let dateObj = new Date(normalizedStr);
			if (isNaN(dateObj.getTime())) {
				error("Invalid datetime value: " + dtStr);
			}
			dateObj.timeOnly = timeOnly;
			dateObj.dateOnly = dateOnly;
			return dateObj;
		} catch (e) {
			error("Invalid datetime: " + e.message);
		}
	},
	
	value,  // Place holder for the value function.

	// Parse an array
	array = function() {
		let array = [];
		let delim = ch === '[' ? ']' : ')';  console.log('array delim: ', delim);
		next();  // skip the starting '[' or '('
		white();
		if (ch === delim) { // empty array/list
			next();  return delim === '(' ? null:array; 
		}  
		while (ch) {
			// ES5 allows omitted elements in arrays, e.g. [,] and [,null]. JSON and Mark don't allow this.
			array.push(value());
			if (ch === ',') {
				next();  white();
			}
			else if (ch === delim) { // end of array/list
				next();
				if (delim === ')') { // list
					if (array.length === 0) { return null; } // empty list
					else if (array.length === 1) { return array[0]; } // single item list
					array.isList = true;  // mark as list
				}
				return array;
			}
			else {
				error(UNEXPECT_CHAR + renderChar(ch));
			}
		}
	},

	list = array;

	// Parse binary value
	// Use a lookup table to find the index.
	let lookup64 = new Uint8Array(128);
	if (lookup64.fill) { lookup64.fill(65); } // '65' denotes invalid value
	else { // patch for IE11
		for (var i = 0; i < 128; i++) { lookup64[i] = 65; }
	}
	for (var i = 0; i < 64; i++) { lookup64[base64.charCodeAt(i)] = i; }
	// ' ', \t', '\r', '\n' spaces also allowed in base64 stream
	lookup64[32] = lookup64[9] = lookup64[13] = lookup64[10] = 64;
	
	let binary = function() {
		at++;  // skip the starting "b'"
		if (text[at] !== '\\') { error("Expect '\\'"); }
		at++;
		if (text[at] === 'x') {  // hex
			// parse hex string into ArrayBuffer
			at++;  // skip 'x'
			let end = text.indexOf("'", at), bufEnd = end;  // scan binary end
			if (end < 0) { error("Missing hex end delimiter"); }
			// first run collects hex chars, and skip the spaces
			let hex = new Uint8Array(new ArrayBuffer(bufEnd - at)), p = 0;	
			while (at < bufEnd) {
				let code = text.charCodeAt(at);
				if (code === 32 || code === 9 || code === 13 || code === 10) { // skip spaces
					at++;  continue;
				}
				if (code >= 48 && code <= 57) { // '0' - '9'
					hex[p++] = code - 48;
				} else if (code >= 65 && code <= 70) { // 'A' - 'F'
					hex[p++] = code - 55;
				} else if (code >= 97 && code <= 102) { // 'a' - 'f'
					hex[p++] = code - 87;
				} else {
					error("Invalid hex character: " + renderChar(text[at]));
				}
				at++;
			}
			at = end + 1;  next();  // skip "'"
			// check length
			if (p % 2 !== 0) { error("Invalid hex stream length"); }
			// console.log('binary char length: ', p);	
			// second run decodes into actual binary data
			let len = p / 2, code1, code2,
				buffer = new ArrayBuffer(len), bytes = new Uint8Array(buffer);
			// console.log('binary length: ', len);
			for (let i = 0, p = 0; p < len; i += 2) {
				code1 = hex[i];  code2 = hex[i+1];
				if (code1 > 15 || code2 > 15) { error("Invalid hex character"); }
				bytes[p++] = (code1 << 4) | code2;
			}
			// console.log('binary decoded length:', p);
			buffer.encoding = 'hex';  // set encoding for the buffer
			return buffer;
		}
		else if (text[at] === '6' && text[at+1] === "4") { // base64
			at += 2;  // skip '64'
			// code based on https://github.com/niklasvh/base64-arraybuffer
			let end = text.indexOf("'", at), bufEnd = end, pad = 0;  // scan binary end
			if (end < 0) { error("Missing base64 end delimiter"); }
			// strip optional padding
			if (text[bufEnd-1] === '=') { // 1st padding
				bufEnd--;  pad = 1;
				if (text[bufEnd-1] === '=') { // 2nd padding
					bufEnd--;  pad = 2;
				}
			}
			// console.log('binary char length: ', bufEnd - at);

			// first run collects base64 chars, and skip the spaces
			let base = new Uint8Array(new ArrayBuffer(bufEnd - at)), p = 0;
			while (at < bufEnd) {
				let code = lookup64[text.charCodeAt(at)];  // console.log('bin: ', text[at], code);
				if (code > 64) { error("Invalid base64 character"); }
				if (code < 64) { base[p++] = code; }
				// else skip spaces
				at++;
			}
			at = end+1;  next();  // skip "'"
			// check length
			if (pad && (p + pad) % 4 != 0 || !pad && p % 4 == 1) { error("Invalid base64 stream length"); }

			// second run decodes into actual binary data
			let len = Math.floor(p * 0.75), code1, code2, code3, code4,
				buffer = new ArrayBuffer(len), bytes = new Uint8Array(buffer);
			// console.log('binary length: ', len);
			for (let i = 0, p = 0; p < len; i += 4) {
				code1 = base[i];  code2 = base[i+1];
				code3 = base[i+2];  code4 = base[i+3];
				bytes[p++] = (code1 << 2) | (code2 >> 4);
				// extra undefined bytes casted into 0 by JS binary operator
				bytes[p++] = ((code2 & 15) << 4) | (code3 >> 2);
				bytes[p++] = ((code3 & 3) << 6) | (code4 & 63);
			}
			// console.log('binary decoded length:', p);
			buffer.encoding = 'b64';
			return buffer;
		}
	};

	// Parse an element or map
	let object = function() {
		let obj = {}, 
			key = null, 		// property key
			extended = false, 	// whether it is extended Mark element or JSON/map
			index = 0;
		
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
				if (ch === '<' || ch === '{') { // child object
					let child = object(obj);
					Object.defineProperty(obj, index, {value:child, writable:true, configurable:true}); // make content non-enumerable
					// all 4 container types store reference to parent 
					child[$parent] = obj;  index++;  
				}
				else if (ch === '(' || ch === '[') { // child object
					let child = array();
					if (child) {
						Object.defineProperty(obj, index, {value:child, writable:true, configurable:true}); // make content non-enumerable
						if (typeof child === 'object') child[$parent] = obj;
						// else could be symbol, number, etc.
						index++;
					}
				}
				else if (ch === '"') { // text node
					let str = string();
					// only output non empty text
					if (str) putText(str);
				}
				else if (ch === "'") { // symbol
					let sym = symbol();
					// only output non empty symbol
					if (sym) {
						// store as non-enumerable
						Object.defineProperty(obj, index, {value: sym, writable:true, configurable:true}); 
						index++;
					}
				}
				else if (ch === '>') { 
					next();  obj[$length] = index;
					return;
				}
				// todo: name, number, etc.
				else {
					error(UNEXPECT_CHAR + renderChar(ch));
				}
				white();
			}
			error(UNEXPECT_END);		
		};
		
		if (ch === '<') {  // Mark element
			next();  white();
			let ident = identifier();  white();
			obj = MARK(ident, null, null);
			extended = true;
		}
		else {  // map
			next();  white();  // skip the starting '{'
		}
		while (ch) {
			if (extended && ch === '>' || !extended && ch === '}') { // end of the element/map
				next();  
				if (extended) { obj[$length] = index; }
				return obj;   // could be empty object
			}
			if (ch === '<' || ch === '{' || ch === '(' || ch === '[') { // child object
				if (extended) {
					parseContent();  return obj;
				}
				error(UNEXPECT_CHAR + "'"+ ch +"'");
			}

			let isSymbol = false, str = '';
			if (ch === '"' || ch === "'") { // quoted key
				isSymbol = ch === "'";
				str = string();  white();
			}
			else { // if (ch==='_' || ch==='$' || 'a'<=ch && ch<='z' || 'A'<=ch && ch<='Z')
				// Mark unquoted key, which needs to be valid JS identifier.
				str = identifier();  white();
			}
			// todo: number

			if (ch === ':') { // property or JSON object
				key = str;
			} else {
				if (extended) { // already got type name
					// only output non-empty text
					if (str) {
						if (isSymbol) {
							// store as symbol
							Object.defineProperty(obj, index, {value: Symbol.for(str), writable:true, configurable:true});
							index++;
						} else {
							putText(str);
						}
					}
					parseContent();  return obj;
				}
				else { 
					error(UNEXPECT_CHAR + renderChar(ch));
				}
			}
	
			// key-value pair
			next(); // skip ':'
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

	// Parse a Mark value. 
	value = function() {
		// A Mark value could be an element, a map, an array, a list, 
		// a scalar value (string, symbol, number, datetime, binary, etc.), or a word.
        white();
        switch (ch) {
        case '{':  
		case '<':
            return object();
        case '[':
			return array();
		case '(':
			return list();			
        case '"':
			return string();
		case "'":
            return symbol();
        case '-':  case '+':  case '.':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

	// return the enclosed parse function. It will have access to all of the above functions and variables.
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
	let indentStep, indentStrs, space; // omitComma;
	
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
		// omitComma = options.omitComma;
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
                throw new TypeError("Got circular reference");
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
    function escapeString(string, isSymbol = false) {
		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.
        escapable.lastIndex = 0;
		let delim = isSymbol ? "'" : '"';
        return escapable.test(string) ? delim + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + delim : delim + string + delim;
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
                if (isNaN(value)) { return "nan"; }
				else if (!isFinite(value)) { return value > 0 ? "inf" : "-inf"; }
                return value.toString();

            case "string":
                return escapeString(value.toString());

			case "symbol":
				return escapeString(Symbol.keyFor(value), true);

            case "object":
                if (value === null) { // null value
                    return "null";
                } 
				else if (Array.isArray(value)) { // array or list
                    checkForCircular(value);  // console.log('print array', value);
                    buffer = value.isList ? "(" : "[";
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
                            buffer += ', ';
                        } else if (indentStep) {
                            buffer += "\n";
                        }
                    }
                    objStack.pop();
                    if (value.length && indentStep) {
                        buffer += indent(objStack.length, true);
                    }
                    buffer += value.isList ? ")" : "]";
                }
				else if (value instanceof ArrayBuffer) { // binary
					buffer = "b'";
					if (value.encoding === 'hex') { // hex
						buffer += "\\x";
						let bytes = new Uint8Array(value), i, len = bytes.length;
						for (i = 0; i < len; i++) {
							// convert each byte to hex
							buffer += (bytes[i] >> 4).toString(16) + (bytes[i] & 15).toString(16);
						}
					} else { // base64
						buffer += "\\64";
						let bytes = new Uint8Array(value), i, fullLen = bytes.length, len = fullLen - (fullLen % 3);
						// bulk of encoding
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
					}
					buffer += "'";
				}
				else if (value instanceof Date) { // datetime
					if (value.timeOnly) {
						buffer = "t'" + value.toTimeString().split(' ')[0] + "'";
					}
					else if (value.dateOnly) {
						buffer = "t'" + value.toISOString().split('T')[0] + "'";
					}
					else{
						buffer = "t'" + value.toISOString().replace('T',' ') + "'";
					}
				}
				else { // map or element
                    checkForCircular(value);
                    let nonEmpty = false, isElement = false;
					// Mark or JSON object
					objStack.push(value);
					// print object type-name, if any
					if (value.constructor.name !== 'Object' || value instanceof MARK) { // element
						buffer = '<' + value.constructor.name;  
						isElement = true;  nonEmpty = true;
					} 
					else { // map
						buffer = '{';
					}

					// print object attributes
					let hasAttr = false;
                    for (var prop in value) {
						// prop of undefined value is omitted, as Mark and JSON does not support 'undefined' value
						let res = _stringify(value[prop]);
						if (res !== undefined) {                           
							let key = MARK.isName(prop) ? prop : escapeString(prop, true);
							buffer += (hasAttr ? ', ' : (nonEmpty ? ' ' : '')) + key + ":" + res;
							hasAttr = true;  nonEmpty = true;
						}
                    }
					
					// print object content
					let length = value[$length];
					if (length) {
						for (let i = 0; i<length; i++) {
							buffer += ' ';
							let item = value[i];
							switch (typeof item) {
							case "string": 
								if (indentStep) buffer += indent(objStack.length);
								buffer += escapeString(item.toString());
								break;
							case "symbol": 
								if (indentStep) buffer += indent(objStack.length);
								buffer += escapeString(Symbol.keyFor(item), true);
								break;
							case "object":
								if (indentStep) buffer += indent(objStack.length);
								buffer += _stringify(item);
								break;
							default: 
								console.log("Unknown object", item);
							}
						}
					}
					
                    objStack.pop();
                    if (nonEmpty) {
						if (length && indentStep) { buffer += indent(objStack.length); }
                    }
					buffer += isElement ? '>' : '}';
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
module.exports = MARK;
if (typeof window !== 'undefined') { window.Mark = MARK; }
