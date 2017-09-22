// mark.js
// Objective Markup Notation. See README.md for details.
//
// This file is based directly of JSON5 at:
// https://github.com/json5/json5/blob/master/lib/json5.js
// which is further based of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

const $contents = Symbol.for('Mark.contents');
const $properties = Symbol.for('Mark.properties');
const $length = Symbol.for('Mark.length');
const $parent = Symbol.for('Mark.parent');
const $pragma = Symbol.for('Mark.pragma');
const $target = Symbol('Mark.target');

// construct Mark object, like virtual-dom hyperscript
var Mark = (function() {
	"use strict";
	// cached constructors/prototypes for the Mark objects
	var constructors = {};
	
	// traps for contents API, a proxy to make object array-like; contents does not inherit				
	const contentsTraps = {
		getPrototypeOf() {
			return Array.prototype;
		},
		
		// trap for 'in' operator
		has(target, property) {
			return property === 'length' || target[$target].hasOwnProperty(property) && Number.isInteger(Number(property));
		},
		
		get(target, property, receiver) {
			switch (property) {
			case 'length': // maps to length symbol
				return target[$target][$length];
			case Symbol.iterator:
				return function* () {
					var length = target[$target][$length];
					for (let i = 0; i < length; i++) {
						yield target[$target][i];
					}
				};
			case Symbol.toStringTag:
				return 'Array';
			case Symbol.isConcatSpreadable:
				return true;  // contents API is spreadable
			case 'toString':
				return Object.prototype.toString.bind(receiver);
			}
			if (target[$target].hasOwnProperty(property)) { // hide non-numeric properties
				return Number.isInteger(Number(property)) ? target[$target][property]:undefined;
			}
			else { // other prototype properties
				const method = Array.prototype[property];
				if (method) {
					// console.log('wrapping method', method, target, target[$target]);
					return method.bind(receiver);
				}
			}
		},

		// to keep it simple, we make contents API read-only
		set(target, property, value, receiver) {
			return false;
		},
		
		// trap or Relect.ownKeys(), returns numeric keys and 'length', like default Array behavior
		ownKeys: function(target) {
			let keys = [], length = target[$target][$length];
			for (var i=0; i<length; i++) { keys.push(i.toString()); }
			keys.push('length');
			return keys;
		}
	};

	// traps for properties API, returns only enumerable properties and hides the contents; properties may inherit			
	const propsTraps = {
		getPrototypeOf() {
			return Object.prototype;
		},
		
		// trap for 'in' operator
		has(target, property) {
			return isNaN(property*1) && property in target;
		},
		
		get(target, property, receiver) {
			return target.propertyIsEnumerable(property) && isNaN(property*1) ? target[property]:undefined;
		},

		set(target, property, value, receiver) {
			if (!isNaN(property*1)) { return false; } // reject any numeric key
			target[property] = value;  return true;
		},
		
		// trap or Relect.ownKeys();
		ownKeys: function(target) {
			let keys = Object.keys(target);  // console.log('got prop keys', keys);
			// todo: should add inherited enumerable keys
			return keys;
		}
	};	
	
	return function(typeName, props, contents, parent) {
		"use strict";
		var con = constructors[typeName];
		if (!con) { 
			con = constructors[typeName] = function(){};
			// con.prototype.constructor is set to con by JS
			// con.prototype.__proto__ = Array.prototype; // Mark no longer extends Array; Mark is array like, but not array.
			Object.defineProperty(con, 'name', {value:typeName, configurable:true}); // non-writable, as we don't want the name to be changed
			
			// define object 'properties' API;  todo: properties should hide content
			Object.defineProperty(con.prototype, 'properties', {get:function() {
				if (!this[$properties]) { this[$properties] = new Proxy(this, propsTraps); }
				return this[$properties];
			}, configurable:true});  // non-enumerable
			
			// define object 'contents' API
			Object.defineProperty(con.prototype, 'contents', {get:function() { 
				if (!this[$contents]) {
					let array = [];  array[$target] = this;
					this[$contents] = new Proxy(array, contentsTraps); 
				}
				return this[$contents];
			}, configurable:true});  // non-enumerable
			
			// define object 'parent' API
			Object.defineProperty(con.prototype, 'parent', {
				get:function() { return this[$parent]; },
				set:function(parent) {
					// sets the 'parent' property directly as normal property
					Object.defineProperty(this, 'parent', {value:parent, writable:true, configurable:true, enumerable:true});
				},
			configurable:true});  // non-enumerable
			
			// define object 'length' API
			Object.defineProperty(con.prototype, 'length', {
				get:function() { return this[$length]; },
				set:function(length) {
					// sets the 'length' property directly as normal property
					Object.defineProperty(this, 'length', {value:length, writable:true, configurable:true, enumerable:true});
				},
			configurable:true}); 		
			
			// define object iterator API
			con.prototype[Symbol.iterator] = function*() {
				var length = this[$length];
				for (let i = 0; i < length; i++) { yield this[i]; }
			}; 		
			
			// todo: function addContent(item, index)
			
			// make object compatible with array API
			var api = {
				push: function(item) {
					// copy the arguments
					var length = this[$length];
					for (var i=0; i<arguments.length; i++) {
						Object.defineProperty(this, length+i, {value:arguments[i], writable:true, configurable:true}); // make content item non-enumerable
					}
					length += arguments.length;
					this[$length] = length;
					return length;
				},
				pop: function(item) {
					var length = this[$length];
					if (length > 0) {
						var item = this[length-1];  delete this[length-1];
						this[$length] = length - 1;
						return item;
					} else {
						return undefined;
					}
				},
				shift: function() {
					var length = this[$length];
					if (length > 0) {
						var item = this[0];
						for (var i=0; i<length-1; i++) {
							Object.defineProperty(this, i, {value:this[i+1], writable:true, configurable:true});
						}
						this[$length] = length - 1;
						return item;
					} else {
						return undefined;
					}
				},
				unshift: function() {
					var args = arguments.length;  var length = this[$length];
					if (args) {
						// shift the items
						for (var i = length+args-1; i > args-1; i--) {
							Object.defineProperty(this, i, {value:this[i-args], writable:true, configurable:true});
						}
						// copy the arguments
						for (var i=0; i<args; i++) {
							Object.defineProperty(this, i, {value:arguments[i], writable:true, configurable:true});
						}
						this[$length] = length += args;
					}
					return length;
				},
				delete: function() {
					var deleted;
					var length = this[$length];
					if (arguments.length) {
						// shift the items
						var index = arguments[0];
						if (index >=0 && index < length) {
							deleted = this[index];
							for (var i = index; i < length - 1; i++) { this[i] = this[i+1]; }
							this[$length] = length - 1;
						}
						// else invalid index
					}
					return deleted;
				},
				filter: Array.prototype.filter,
				// todo: pick and patch other Array prototype functions
				
				toHtml: function() {
					if (!Mark.$convert) { Mark.$convert = require('./lib/mark.convert.js')(Mark); }
					return Mark.$convert.toHtml(this);
				},
				toXml: function() {
					if (!Mark.$convert) { Mark.$convert = require('./lib/mark.convert.js')(Mark); }
					return Mark.$convert.toXml(this);
				},
				find: function(selector) {
					if (!Mark.$select) { Mark.$select = require('./lib/mark.query.js'); }
					return Mark.$select(this).find(selector);
				},
				matches: function(selector) {
					if (!Mark.$select) { Mark.$select = require('./lib/mark.query.js'); }
					return Mark.$select(this).matches(selector);
				},
			};
			for (let a in api) {
				Object.defineProperty(con.prototype, a, {value:api[a], writable:true, configurable:true});  // make method non-enumerable
			}		
		}
		
		// create object
		var obj = Object.create(con.prototype);
		
		// copy properties, numeric keys are not allowed
		if (props) { 
			for (let p in props) { propsTraps.set(obj, p, props[p]); }
		}
		
		// copy contents if any
		let len = 0;
		if (contents) { 
			let prev_type = null;
			function addContents(items) {
				for (let val of items) {
					let t = typeof val;
					if (t === 'string') {
						if (prev_type === 'string') { 
							len--;  val = obj[len] + val;  // merge text nodes
						}
					}
					else {
						if (t === 'object') {
							if (val === null) continue; // skip null value
							else if (val instanceof Array) { // expanded it inline
								addContents(val);  continue;
							}
							// else, assume Mark object
						}
						else { // other primitive values
							val = val.toString(); // convert to string, as Mark only accept text and Mark object as content
						}
					}
					Object.defineProperty(obj, len, {value:val, writable:true, configurable:true}); // make content non-enumerable
					prev_type = t;  len++;
				}
			}
			addContents(contents);
		}
		obj[$length] = len;
		
		if (parent) { obj[$parent] = parent; }
		return obj;
	};	
})();

Mark.parse = (function() {
	// This is a function that can parse a Mark text, producing a JavaScript data structure. 
	// It is a simple, recursive descent parser. It does not use eval or regular expressions, 
	// so it can be used as a model for implementing a Mark parser in other languages.
	"use strict";
	let UNEXPECT_END = "Unexpected end of input";
	
    let at,           	// The index of the current character
        lineNumber,   	// The current line number
        columnNumber, 	// The current column number
        ch,           	// The current character
		
        escapee = {
            "'":  "'",
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
        text,

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
            var hex, i, string = '',
                delim,      // double quote or single quote
                uffff;

			// when parsing for string values, we must look for ' or " and \ characters.
            if (ch === '"' || ch === "'") {
                delim = ch;
                while (next()) {
                    if (ch === delim) {
                        next();
						return string;
                    } else if (ch === '\\') { // escape sequence
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (ch === '\r') {
                            if (peek() === '\n') {
                                next();
                            }
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } 
					// else if (ch === '\n') {
                        // unescaped newlines are invalid in JSON, but valid in Mark; 
                        // see: https://github.com/json5/json5/issues/24
                        // break;
                    // } 
					else {
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
				// ES5 allows omitting elements in arrays, e.g. [,] and [,null]. We don't allow this in Mark.
				if (ch === ',') {
					error("Missing array element");
				} else {
					array.push(value());
				}
				white();
				// If there's no comma after this value, this needs to be the end of the array.
				if (ch !== ',') {
					next(']');
					return array;
				}
				next(',');
				white();
			}
        },

		// Parse an object value
        object = function(parent) {
            let key, obj = {}, extended = false, index = 0;  	// whether the is extended Mark object or legacy JSON object
			if (parent) { obj[$parent] = parent; }  // all 3 types: Mark object, JSON object, Mark pragma store parent 

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
						Object.defineProperty(obj, index, {value:object(obj), writable:true, configurable:true}); // make content non-enumerable
						index++;
					}
					else if (ch === '"' || ch === "'") { // text node
						putText(string());
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
			
			next();  // skip the starting '{'
			if (ch === '{') { // got Mark pragma
				next();
				let pragma = '';
				while (ch) {
					if (ch === '}') {
						next();
						if (ch === '}') { // end of pragma
							next();
							// pragma has no other property or content
							obj[$pragma] = pragma;  // pragma conent stored as Symbol
							return obj;
						}
						pragma += '-';
					} else {
						pragma += ch;
						next();
					}
				}
				error(UNEXPECT_END);	
			}
			
			white();
			while (ch) {
				if (ch === '}') { // end of the object
					next();  
					if (extended) { obj[$length] = index; }
					return obj;   // potentially empty object
				}

				// Keys can be unquoted. If they are, they need to be valid JS identifiers.
				if (ch === '"' || ch === "'") { // legacy JSON
					var str = string();  white();
					if (ch==':') { // property
						key = str;
					} else {
						if (extended) { // got text node
							putText(str);
							parseContent();
							return obj;
						}
						else { error("Bad object"); }
					}
				}
				else if (ch === '{') { // child object
					if (extended) {
						parseContent();  return obj;
					}
					error("Unexpected character '{'");
				}
				else { // JSON5 or Mark object
					var ident = identifier();
					white();
					if (!key) { // at the starting of the object						
						if (ch != ':') { // assume is Mark object
							// console.log("got Mark object of type: ", ident);
							// create the object
							// if (factory) ...
							obj = Mark(ident, null, null, parent);
							extended = true;  key = ident;
							continue;
						}
						// else // JSON object
					}
					key = ident;
				}
				
				if (ch == ':') { // key-value pair
					next();
					var val = value();
					if (extended && !isNaN(key*1)) { // any numeric key is rejected for Mark object
						error("Numeric key not allowed as Mark property name");
					}
					obj[key] = val;
					white();
					if (ch === ',') {
						next();  white();
					} 
					else if (ch === '}') { // end of the object
						next();
						if (extended) { obj[$length] = index; }
						return obj;   // potentially empty object
					}
					else if (extended && (ch === '"' || ch === "'" || ch === '{')) { 
						parseContent();
						return obj;
					} else {
						error("Expect character ':'");						
					}
				} else {
					error("Bad object");
				}
			}
			error(UNEXPECT_END);
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

	// Return the json_parse function. It will have access to all of the above
	// functions and variables.
    return function(source, factory) {	
		// initialize the contextual variables
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
		text = String(source);
		
		if (!source) { text = '';  error(UNEXPECT_END); }
		if (source.match(/^\s*</)) { // parse as html
			if (!Mark.$html) { Mark.$html = require('./lib/mark.convert.js')(Mark); }
			return Mark.$html.parse(source);
		} 
		// else // parse as Mark		
		
        
		// start parsing as a JSON value
        var result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

        return result;
    };
}());

// Mark stringify will not quote keys where appropriate
Mark.stringify = function (obj, replacer, space) {
	"use strict";
    if (replacer && (typeof(replacer) !== "function" && !isArray(replacer))) {
        throw new Error('Replacer must be a function or an array');
    }
    var getReplacedValueOrUndefined = function(holder, key, isTopLevel) {
        var value = holder[key];

        // Replace the value with its toJSON value first, if possible
        // if (value && value.toJSON && typeof value.toJSON === "function") {
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

    function isNameChar(c) {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') ||
            c === '_' || c === '$' || '.' || '-';
    }

    function isNameStart(c) {
        return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_' || c === '$';
    }

    function isName(key) {
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

    // export for use in tests
    Mark.isName = isName;

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
        if (!str) {
            return "";
        }
        // indentation no more than 10 chars
        if (str.length > 10) {
            str = str.substring(0, 10);
        }

        var indent = noNewLine ? "" : "\n";
        for (var i = 0; i < num; i++) {
            indent += str;
        }

        return indent;
    }

    var indentStr;
    if (space) {
        if (typeof space === "string") {
            indentStr = space;
        } else if (typeof space === "number" && space >= 0) {
            indentStr = makeIndent(" ", space, true);
        } else {
            // ignore space parameter
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
            return typeof c === 'string' ?
                c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    // End

    function internalStringify(holder, key, isTopLevel) {
        var buffer, res;

        // Replace the value, if necessary
        var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

        if (obj_part && !isDate(obj_part)) {
            // unbox objects
            // don't unbox dates, since will turn it into number
            obj_part = obj_part.valueOf();
        }
        switch(typeof obj_part) {
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
                if (obj_part === null) {
                    return "null";
                } else if (isArray(obj_part)) {
                    checkForCircular(obj_part);  // console.log('print array', obj_part);
                    buffer = "[";
                    objStack.push(obj_part);

                    for (var i = 0; i < obj_part.length; i++) {
                        res = internalStringify(obj_part, i, false);
                        buffer += makeIndent(indentStr, objStack.length);
                        if (res === null || typeof res === "undefined") {
                            buffer += "null";
                        } else {
                            buffer += res;
                        }
                        if (i < obj_part.length-1) {
                            buffer += ",";
                        } else if (indentStr) {
                            buffer += "\n";
                        }
                    }
                    objStack.pop();
                    if (obj_part.length) {
                        buffer += makeIndent(indentStr, objStack.length, true)
                    }
                    buffer += "]";
                }
				else {
                    checkForCircular(obj_part);  // console.log('print obj', obj_part);
                    buffer = "{";
                    var nonEmpty = false;
                    objStack.push(obj_part);
					// print object type-name, if any
					if (obj_part.constructor.name != 'Object') { 
						buffer += obj_part.constructor.name;  nonEmpty = true;
					} else { // JSON or Mark pragma
						if (obj_part[$pragma]) {
							return '{{' + obj_part[$pragma] + '}}';
						}
					}
					// print object attributes
					var hasAttr = false;
                    for (var prop in obj_part) {
						var value = internalStringify(obj_part, prop, false);
						isTopLevel = false;
						if (typeof value !== "undefined" && value !== null) {
							// buffer += makeIndent(indentStr, objStack.length);                            
							key = isName(prop) ? prop : escapeString(prop);
							buffer += (hasAttr ? ', ':(nonEmpty ? ' ':''))+ key +":" + value;
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
								buffer += makeIndent(indentStr, objStack.length);
								buffer += escapeString(item.toString());
							}
							else if (typeof item === "object") {
								buffer += makeIndent(indentStr, objStack.length);
								buffer += internalStringify({"":item}, '', false);
							}
							else { console.log("unknown object", item); }
						}
					}
                    objStack.pop();
                    if (nonEmpty ) {
                        // buffer = buffer.substring(0, buffer.length-1) + makeIndent(indentStr, objStack.length) + "}";
						if (length) { buffer += makeIndent(indentStr, objStack.length); }
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

    // special case...when undefined is used inside of
    // a compound object/array, return null.
    // but when top-level, return undefined
    var topLevelHolder = {"":obj};
    if (obj === undefined) {
        return getReplacedValueOrUndefined(topLevelHolder, '', true);
    }
    return internalStringify(topLevelHolder, '', true);
};

// export the Mark interface
if (typeof module === 'object')
module.exports = Mark;
