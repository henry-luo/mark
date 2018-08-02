// mark.js
// Objective Markup Notation. See README.md for details.
//
// This file is based directly of JSON5 at:
// https://github.com/json5/json5/blob/master/lib/json5.js
// which is further based of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

"use strict";

// symbols used internally
const $length = Symbol.for('Mark.length'), // for content length
	$parent = Symbol.for('Mark.parent'), // for parent object
	$pragma = Symbol.for('Mark.pragma'); // for pragma value
	
let $convert = null,  // Mark Convert API
	$ctrs = {};	// cached constructors for the Mark objects

// MARK is the static Mark API, it is different from the Mark.prototype that Mark object extends
var MARK = (function() {
	// patch IE11
	if (!$ctrs.constructor.name) { // IE11 does not set constructor.name to 'Object'
		$ctrs.constructor.name = 'Object';
	}
	
	// Mark.prototype and Mark object constructor
	function Mark(typeName, props, contents) {
		// handle special shorthand
		if (arguments.length === 1 && typeName[0] === '{') { 
			return MARK.parse(typeName); 
		}
		
		// 1. prepare the constructor
		let con = $ctrs[typeName];
		if (!con) {
			if (typeof typeName !== 'string') { throw "Type name should be a string"; }
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
			addContents(Array.isArray(contents) ? contents : [contents]);
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
	// set the APIs
	for (let a in api) {
		// API functions are non-enumerable
		Object.defineProperty(Mark.prototype, a, {value:api[a], writable:true, configurable:true});  
		// no longer set the APIs on static MARK object, as 'length' is non-writable in node, and non-configurable in IE11
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
		let con = $ctrs[$pragma];
		if (!con) {
			con = Object.create(null);
			Object.defineProperty(con, 'pragma', {value:api.pragma});
			Object.defineProperty(con, 'parent', {value:api.parent});
			Object.defineProperty(con, 'valueOf', {value:Object.valueOf});
			Object.defineProperty(con, 'toString', {value:function() { return '[object Pragma]'; }});
			$ctrs[$pragma] = con;
		}
		let obj = Object.create(con);
		obj[$pragma] = pragma;  // pragma conent stored as Symbol
		return obj;
	}
	
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
	
let base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

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
			error("Expected '" + c + "' instead of " + renderChar(ch));
		}
		// Get the next character. When there are no more characters, return the empty string.
		ch = text.charAt(at);
		at++;
		if (ch === '\n' || ch === '\r' && text[at] !== '\n') {
			lineNumber++;  columnStart = at;
		}
		return ch;
	},

	// Parse an identifier.
	identifier = function () {
		// To keep it simple, Mark identifiers do not support Unicode "letters", as in JS; if needed, use quoted syntax
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
			if (text[at] === delim && text[at+1] === delim) { // got tripple quote
				triple = true;  next();  next();
			}
			while (next()) {
				if (ch === delim) {
					next();
					if (!triple) { // end of string
						return string;
					}
					else if (ch === delim && text[at] === delim) { // end of tripple quoted text
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
				// else if (ch === '\n') {
					// control characters like TAB and LF are invalid in JSON, but valid in Mark; 
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

	isSuffix = function(suffix) {
		let len = suffix.length;
		for (let i=0; i<len; i++) {
			if (text[at+i] !== suffix[i]) { at += i+1;  return false; }
		}
		if (isNameStart(text[at+len])) { at += len+1;  return false; }
		ch = text[at+len];  at += len + 1;  
		return true;
	},
	// Parse true, false, null, Infinity, NaN
	word = function() {
		switch (ch) {
		case 't':  if (isSuffix('rue')) { return true; }  break;
		case 'f':  if (isSuffix('alse')) { return false; }  break;
		case 'n':  if (isSuffix('ull')) { return null; }  break;
		case 'I':  if (isSuffix('nfinity')) { return Infinity; }  break;
		case 'N':  if (isSuffix('aN')) { return NaN; }
		}
		error(UNEXPECT_CHAR + renderChar(text.charAt(at-1)));
	},
	
	pragma = function() {
		let prag = '', level = 0;
		next();  // skip starting '('
		while (ch) {
			if (ch === ')') {
				if (level) { level--; } // embedded (...)
				else { // end of pragma
					next();  // skip ending ')'
					return MARK.pragma(prag);				
				}
			}
			else if (ch === '(') { level++; } // store as normal char
			// else - normal char
			prag += ch;
			next();
		}
		error(UNEXPECT_END);
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

	// Parse binary value
	// Use a lookup table to find the index.
	let lookup64 = new Uint8Array(128), lookup85 = new Uint8Array(128);
	if (lookup64.fill) { lookup64.fill(65); lookup85.fill(86); } // '65' denotes invalid value
	else { // patch for IE11
		for (var i = 0; i < 128; i++) { lookup64[i] = 65;  lookup85[i] = 86; } 
	}
	for (var i = 0; i < 64; i++) { lookup64[base64.charCodeAt(i)] = i; }
	// ' ', \t', '\r', '\n' spaces also allowed in base64 stream
	lookup64[32] = lookup64[9] = lookup64[13] = lookup64[10] = 64;
	for (var i = 0; i < 128; i++) { if (33 <= i && i <= 117) lookup85[i] = i - 33; }
	// ' ', \t', '\r', '\n' spaces also allowed in base85 stream
	lookup85[32] = lookup85[9] = lookup85[13] = lookup85[10] = 85;
	
	let binary = function() {
		at++;  // skip the starting '{:'
		if (text[at] === '~') { // base85
			at++;  // skip '~'
			// code based on https://github.com/noseglid/base85/blob/master/lib/base85.js
			let end = text.indexOf('~}', at);  // scan binary end
			if (end < 0) { error("Missing ascii85 end delimiter"); }
			
			// first run decodes into base85 int values, and skip the spaces
			let p = 0, base = new Uint8Array(new ArrayBuffer(end - at + 3));  // 3 extra bytes of padding
			while (at < end) {
				let code = lookup85[text.charCodeAt(at)];  // console.log('bin: ', text[at], code);
				if (code > 85) { error("Invalid ascii85 character"); }
				if (code < 85) { base[p++] = code; }
				// else skip spaces
				at++;
			}
			at = end+2;  next();  // skip '~}'			
			// check length
			if (p % 5 == 1) { error("Invalid ascii85 stream length"); }
		
			// second run decodes into actual binary data
			let dataLength = p, padding = (dataLength % 5 === 0) ? 0 : 5 - dataLength % 5,
				buffer = new ArrayBuffer(4 * Math.ceil(dataLength / 5) - padding), 
				bytes = new DataView(buffer), trail = buffer.byteLength - 4;
			base[p] = base[p+1] = base[p+2] = 84;  // 3 extra bytes of padding
			// console.log('base85 byte length: ', buffer.byteLength);
			for (let i = 0, p = 0; i < dataLength; i += 5, p+=4) {
				let num = (((base[i] * 85 + base[i+1]) * 85 + base[i+2]) * 85 + base[i+3]) * 85 + base[i+4];
				// console.log("set byte to val:", p, num, String.fromCodePoint(num >> 24), String.fromCodePoint((num >> 16) & 0xff),
				//	String.fromCodePoint((num >> 8) & 0xff), String.fromCodePoint(num & 0xff));
				// write the uint32 value
				if (p <= trail) { // bulk of bytes
					bytes.setUint32(p, num); // big endian
				} else { // trailing bytes
					switch (padding) {
					case 1:  bytes.setUint8(p+2, (num >> 8) & 0xff);  // fall through
					case 2:  bytes.setUint16(p, num >> 16);  break;
					case 3:  bytes.setUint8(p, num >> 24);
					}
				}
			}			
			buffer.encoding = 'a85';
			return buffer;			
		}
		else { // base64
			// code based on https://github.com/niklasvh/base64-arraybuffer
			let end = text.indexOf('}', at), bufEnd = end, pad = 0;  // scan binary end
			if (end < 0) { error("Missing base64 end delimiter"); }
			// strip optional padding
			if (text[bufEnd-1] === '=') { // 1st padding
				bufEnd--;  pad = 1;
				if (text[bufEnd-1] === '=') { // 2nd padding
					bufEnd--;  pad = 2;
				}
			}
			// console.log('binary char length: ', bufEnd - at);

			// first run decodes into base64 int values, and skip the spaces
			let base = new Uint8Array(new ArrayBuffer(bufEnd - at)), p = 0;
			while (at < bufEnd) {
				let code = lookup64[text.charCodeAt(at)];  // console.log('bin: ', text[at], code);
				if (code > 64) { error("Invalid base64 character"); }
				if (code < 64) { base[p++] = code; }
				// else skip spaces
				at++;
			}
			at = end+1;  next();  // skip '}'
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

	// Parse an object, pragma or binary
	let object = function() {
		let obj = {}, 
			key = null, 		// property key
			extended = false, 	// whether the is extended Mark object or legacy JSON object
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
				if (ch === '{' || ch === '(') { // child object
					let child = (ch === '(') ? pragma(obj) : (text[at] === ':' ? binary(obj):object(obj));  
					Object.defineProperty(obj, index, {value:child, writable:true, configurable:true}); // make content non-enumerable
					// all 4 types: Mark object, JSON object, Mark pragma, Mark binary store reference to parent 
					child[$parent] = obj;  index++;  
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
					error(UNEXPECT_CHAR + renderChar(ch));
				}
				white();
			}
			error(UNEXPECT_END);		
		};
		
		next();  white();  // skip the starting '{'
		while (ch) {
			if (ch === '}') { // end of the object
				next();  
				if (extended) { obj[$length] = index; }
				return obj;   // could be empty object
			}
			// scan the key
			if (ch === '{' || ch === '(') { // child object or pragma
				if (extended) {
					parseContent();  return obj;
				}
				error(UNEXPECT_CHAR + "'{'");
			}
			if (ch === '"' || ch === "'") { // quoted key
				var str = string();  white();
				if (ch === ':') { // property or JSON object
					key = str;
				} else {
					if (extended) { // already got type name
						// only output non-empty text
						if (str) putText(str);
						parseContent();  return obj;
					}
					else if (!key) { // at the starting of the object
						// create the object
						obj = MARK(str, null, null);
						extended = true;  // key = str;
						continue;							
					}
					else { 
						error(UNEXPECT_CHAR + renderChar(ch));
					}
				}
			}
			else { // if (ch==='_' || ch==='$' || 'a'<=ch && ch<='z' || 'A'<=ch && ch<='Z')
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
		case '(':
			return pragma();
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
				else if (Array.isArray(value)) { // array
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
					if (value.encoding === 'a85') { // base85
						let bytes = new DataView(value), fullLen = value.byteLength, len = fullLen - (fullLen % 4), chars = new Array(5);
						buffer = '{:~';
						// bulk of encoding
						let i = 0;
						for (; i < len; i+=4) {
							let num = bytes.getUint32(i);  // big endian
							// encode into 5 bytes
							if (num) {
								for (let j = 0; j < 5; ++j) {
									chars[j] = String.fromCodePoint(num % 85 + 33);
									num = Math.floor(num / 85);
								}
								buffer += chars[4] + chars[3] + chars[2] + chars[1] + chars[0];  // need to reverse the bytes
							} else { // special case zero
								buffer += 'z';
							}
						}
						// trailing bytes and padding
						let padding = 4 - fullLen % 4, num;
						if (padding) {
							switch (padding) {
							case 1:  num = ((bytes.getUint16(i)<<8) + bytes.getUint8(i+2))<<8;  break;
							case 2:  num = bytes.getUint16(i) << 16;  break;
							case 3:  num = bytes.getUint8(i) << 24;
							}
							for (let j = 0; j < 5; ++j) {
								chars[j] = String.fromCodePoint(num % 85 + 33);
								num = Math.floor(num / 85);
							}
							// reverse the bytes and remove padding bytes
							buffer += (chars[4] + chars[3] + chars[2] + chars[1] + chars[0]).substr(0, 5 - padding);
						}
						buffer += '~}';					
					} 
					else { // base64
						let bytes = new Uint8Array(value), i, fullLen = bytes.length, len = fullLen - (fullLen % 3);
						buffer = '{:';
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
						buffer += '}';
					}
				}
				else { // pragma or object
                    checkForCircular(value);  // console.log('print obj', value);
                    buffer = "{";
                    var nonEmpty = false;
					if (!value.constructor) { // assume Mark pragma
						// todo: should escape '{','}' in $pragma
						return value[$pragma] ? '(' + value[$pragma] + ')' : 'null'/* unknown object */;
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
module.exports = MARK;
if (typeof window !== 'undefined') { window.Mark = MARK; }
