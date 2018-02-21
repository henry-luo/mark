(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Mark = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var falseFunc = require("boolbase").falseFunc;

//https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js#L469
var reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;

function factory(adapter) {
	/*
 	attribute selectors
 */
	var attributeRules = {
		__proto__: null,
		equals: function equals(next, data) {
			var name = data.name,
			    value = data.value;

			if (data.ignoreCase) {
				value = value.toLowerCase();

				return function equalsIC(elem) {
					var attr = adapter.getAttributeValue(elem, name);
					return attr != null && attr.toLowerCase() === value && next(elem);
				};
			}

			return function equals(elem) {
				return adapter.getAttributeValue(elem, name) === value && next(elem);
			};
		},
		hyphen: function hyphen(next, data) {
			var name = data.name,
			    value = data.value,
			    len = value.length;

			if (data.ignoreCase) {
				value = value.toLowerCase();

				return function hyphenIC(elem) {
					var attr = adapter.getAttributeValue(elem, name);
					return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
				};
			}

			return function hyphen(elem) {
				var attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.substr(0, len) === value && (attr.length === len || attr.charAt(len) === "-") && next(elem);
			};
		},
		element: function element(next, data) {
			var name = data.name,
			    value = data.value;

			if (/\s/.test(value)) {
				return falseFunc;
			}

			value = value.replace(reChars, "\\$&");

			var pattern = "(?:^|\\s)" + value + "(?:$|\\s)",
			    flags = data.ignoreCase ? "i" : "",
			    regex = new RegExp(pattern, flags);

			return function element(elem) {
				var attr = adapter.getAttributeValue(elem, name);
				return attr != null && regex.test(attr) && next(elem);
			};
		},
		exists: function exists(next, data) {
			var name = data.name;
			return function exists(elem) {
				return adapter.hasAttrib(elem, name) && next(elem);
			};
		},
		start: function start(next, data) {
			var name = data.name,
			    value = data.value,
			    len = value.length;

			if (len === 0) {
				return falseFunc;
			}

			if (data.ignoreCase) {
				value = value.toLowerCase();

				return function startIC(elem) {
					var attr = adapter.getAttributeValue(elem, name);
					return attr != null && attr.substr(0, len).toLowerCase() === value && next(elem);
				};
			}

			return function start(elem) {
				var attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.substr(0, len) === value && next(elem);
			};
		},
		end: function end(next, data) {
			var name = data.name,
			    value = data.value,
			    len = -value.length;

			if (len === 0) {
				return falseFunc;
			}

			if (data.ignoreCase) {
				value = value.toLowerCase();

				return function endIC(elem) {
					var attr = adapter.getAttributeValue(elem, name);
					return attr != null && attr.substr(len).toLowerCase() === value && next(elem);
				};
			}

			return function end(elem) {
				var attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.substr(len) === value && next(elem);
			};
		},
		any: function any(next, data) {
			var name = data.name,
			    value = data.value;

			if (value === "") {
				return falseFunc;
			}

			if (data.ignoreCase) {
				var regex = new RegExp(value.replace(reChars, "\\$&"), "i");

				return function anyIC(elem) {
					var attr = adapter.getAttributeValue(elem, name);
					return attr != null && regex.test(attr) && next(elem);
				};
			}

			return function any(elem) {
				var attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.indexOf(value) >= 0 && next(elem);
			};
		},
		not: function not(next, data) {
			var name = data.name,
			    value = data.value;

			if (value === "") {
				return function notEmpty(elem) {
					return !!adapter.getAttributeValue(elem, name) && next(elem);
				};
			} else if (data.ignoreCase) {
				value = value.toLowerCase();

				return function notIC(elem) {
					var attr = adapter.getAttributeValue(elem, name);
					return attr != null && attr.toLowerCase() !== value && next(elem);
				};
			}

			return function not(elem) {
				return adapter.getAttributeValue(elem, name) !== value && next(elem);
			};
		}
	};

	return {
		compile: function compile(next, data, options) {
			if (options && options.strict && (data.ignoreCase || data.action === "not")) throw new Error("Unsupported attribute selector");
			return attributeRules[data.action](next, data);
		},
		rules: attributeRules
	};
}

module.exports = factory;

},{"boolbase":22}],2:[function(require,module,exports){
"use strict";

/*
	compiles a selector to an executable function
*/

module.exports = compileFactory;

var parse = require("./css-what.js"),
    BaseFuncs = require("boolbase"),
    sortRules = require("./sort.js"),
    procedure = require("./procedure.json"),
    rulesFactory = require("./general.js"),
    pseudosFactory = require("./pseudos.js"),
    trueFunc = BaseFuncs.trueFunc,
    falseFunc = BaseFuncs.falseFunc;

function compileFactory(adapter) {
	var Pseudos = pseudosFactory(adapter),
	    filters = Pseudos.filters,
	    Rules = rulesFactory(adapter, Pseudos);

	function compile(selector, options, context) {
		var next = compileUnsafe(selector, options, context);
		return wrap(next);
	}

	function wrap(next) {
		return function base(elem) {
			return adapter.isTag(elem) && next(elem);
		};
	}

	function compileUnsafe(selector, options, context) {
		var token = parse(selector, options);
		return compileToken(token, options, context);
	}

	function includesScopePseudo(t) {
		return t.type === "pseudo" && (t.name === "scope" || Array.isArray(t.data) && t.data.some(function (data) {
			return data.some(includesScopePseudo);
		}));
	}

	var DESCENDANT_TOKEN = { type: "descendant" },
	    FLEXIBLE_DESCENDANT_TOKEN = { type: "_flexibleDescendant" },
	    SCOPE_TOKEN = { type: "pseudo", name: "scope" },
	    PLACEHOLDER_ELEMENT = {};

	//CSS 4 Spec (Draft): 3.3.1. Absolutizing a Scope-relative Selector
	//http://www.w3.org/TR/selectors4/#absolutizing
	function absolutize(token, context) {
		//TODO better check if context is document
		var hasContext = !!context && !!context.length && context.every(function (e) {
			return e === PLACEHOLDER_ELEMENT || !!adapter.getParent(e);
		});

		token.forEach(function (t) {
			if (t.length > 0 && isTraversal(t[0]) && t[0].type !== "descendant") {
				//don't return in else branch
			} else if (hasContext && !includesScopePseudo(t)) {
				t.unshift(DESCENDANT_TOKEN);
			} else {
				return;
			}

			t.unshift(SCOPE_TOKEN);
		});
	}

	function compileToken(token, options, context) {
		token = token.filter(function (t) {
			return t.length > 0;
		});

		token.forEach(sortRules);

		var isArrayContext = Array.isArray(context);

		context = options && options.context || context;

		if (context && !isArrayContext) context = [context];

		absolutize(token, context);

		var shouldTestNextSiblings = false;

		var query = token.map(function (rules) {
			if (rules[0] && rules[1] && rules[0].name === "scope") {
				var ruleType = rules[1].type;
				if (isArrayContext && ruleType === "descendant") rules[1] = FLEXIBLE_DESCENDANT_TOKEN;else if (ruleType === "adjacent" || ruleType === "sibling") shouldTestNextSiblings = true;
			}
			return compileRules(rules, options, context);
		}).reduce(reduceRules, falseFunc);

		query.shouldTestNextSiblings = shouldTestNextSiblings;

		return query;
	}

	function isTraversal(t) {
		return procedure[t.type] < 0;
	}

	function compileRules(rules, options, context) {
		return rules.reduce(function (func, rule) {
			if (func === falseFunc) return func;
			return Rules[rule.type](func, rule, options, context);
		}, options && options.rootFunc || trueFunc);
	}

	function reduceRules(a, b) {
		if (b === falseFunc || a === trueFunc) {
			return a;
		}
		if (a === falseFunc || b === trueFunc) {
			return b;
		}

		return function combine(elem) {
			return a(elem) || b(elem);
		};
	}

	function containsTraversal(t) {
		return t.some(isTraversal);
	}

	//:not, :has and :matches have to compile selectors
	//doing this in lib/pseudos.js would lead to circular dependencies,
	//so we add them here
	filters.not = function (next, token, options, context) {
		var opts = {
			xmlMode: !!(options && options.xmlMode),
			strict: !!(options && options.strict)
		};

		if (opts.strict) {
			if (token.length > 1 || token.some(containsTraversal)) {
				throw new Error("complex selectors in :not aren't allowed in strict mode");
			}
		}

		var func = compileToken(token, opts, context);

		if (func === falseFunc) return next;
		if (func === trueFunc) return falseFunc;

		return function (elem) {
			return !func(elem) && next(elem);
		};
	};

	filters.has = function (next, token, options) {
		var opts = {
			xmlMode: !!(options && options.xmlMode),
			strict: !!(options && options.strict)
		};

		//FIXME: Uses an array as a pointer to the current element (side effects)
		var context = token.some(containsTraversal) ? [PLACEHOLDER_ELEMENT] : null;

		var func = compileToken(token, opts, context);

		if (func === falseFunc) return falseFunc;
		if (func === trueFunc) {
			return function (elem) {
				return adapter.getChildren(elem).some(adapter.isTag) && next(elem);
			};
		}

		func = wrap(func);

		if (context) {
			return function has(elem) {
				return next(elem) && (context[0] = elem, adapter.existsOne(func, adapter.getChildren(elem)));
			};
		}

		return function has(elem) {
			return next(elem) && adapter.existsOne(func, adapter.getChildren(elem));
		};
	};

	filters.matches = function (next, token, options, context) {
		var opts = {
			xmlMode: !!(options && options.xmlMode),
			strict: !!(options && options.strict),
			rootFunc: next
		};

		return compileToken(token, opts, context);
	};

	compile.compileToken = compileToken;
	compile.compileUnsafe = compileUnsafe;
	compile.Pseudos = Pseudos;

	return compile;
}

},{"./css-what.js":3,"./general.js":4,"./procedure.json":6,"./pseudos.js":7,"./sort.js":8,"boolbase":22}],3:[function(require,module,exports){
"use strict";

module.exports = parse;

var re_name = /^(?:\\.|[\w\-\u00c0-\uFFFF])+/,
    re_escape = /\\([\da-f]{1,6}\s?|(\s)|.)/ig,

//modified version of https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L87
re_attr = /^\s*((?:\\.|[\w\u00c0-\uFFFF\-])+)\s*(?:(\S?)=\s*(?:(['"])(.*?)\3|(#?(?:\\.|[\w\u00c0-\uFFFF\-])*)|)|)\s*(i)?\]/;

var actionTypes = {
	__proto__: null,
	"undefined": "exists",
	"": "equals",
	"~": "element",
	"^": "start",
	"$": "end",
	"*": "any",
	"!": "not",
	"|": "hyphen"
};

var simpleSelectors = {
	__proto__: null,
	">": "child",
	"<": "parent",
	"~": "sibling",
	"+": "adjacent"
};

var attribSelectors = {
	__proto__: null,
	"#": ["id", "equals"],
	".": ["class", "element"]
};

//pseudos, whose data-property is parsed as well
var unpackPseudos = {
	__proto__: null,
	"has": true,
	"not": true,
	"matches": true
};

var stripQuotesFromPseudos = {
	__proto__: null,
	"contains": true,
	"icontains": true
};

var quotes = {
	__proto__: null,
	"\"": true,
	"'": true
};

//unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L139
function funescape(_, escaped, escapedWhitespace) {
	var high = "0x" + escaped - 0x10000;
	// NaN means non-codepoint
	// Support: Firefox
	// Workaround erroneous numeric interpretation of +"0x"
	return high !== high || escapedWhitespace ? escaped :
	// BMP codepoint
	high < 0 ? String.fromCharCode(high + 0x10000) :
	// Supplemental Plane codepoint (surrogate pair)
	String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
}

function unescapeCSS(str) {
	return str.replace(re_escape, funescape);
}

function isWhitespace(c) {
	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}

function parse(selector, options) {
	var subselects = [];

	selector = parseSelector(subselects, selector + "", options);

	if (selector !== "") {
		throw new SyntaxError("Unmatched selector: " + selector);
	}

	return subselects;
}

function parseSelector(subselects, selector, options) {
	var tokens = [],
	    sawWS = false,
	    data,
	    firstChar,
	    name,
	    quot;

	function getName() {
		var sub = selector.match(re_name)[0];
		selector = selector.substr(sub.length);
		return unescapeCSS(sub);
	}

	function stripWhitespace(start) {
		while (isWhitespace(selector.charAt(start))) {
			start++;
		}selector = selector.substr(start);
	}

	stripWhitespace(0);

	while (selector !== "") {
		firstChar = selector.charAt(0);

		if (isWhitespace(firstChar)) {
			sawWS = true;
			stripWhitespace(1);
		} else if (firstChar in simpleSelectors) {
			if (firstChar === '>' && selector.charAt(1) === '>') {
				tokens.push({ type: "descendant" });
				stripWhitespace(2);
			} else {
				tokens.push({ type: simpleSelectors[firstChar] });
				stripWhitespace(1);
			}
			sawWS = false;
		} else if (firstChar === ",") {
			if (tokens.length === 0) {
				throw new SyntaxError("empty sub-selector");
			}
			subselects.push(tokens);
			tokens = [];
			sawWS = false;
			stripWhitespace(1);
		} else {
			if (sawWS) {
				if (tokens.length > 0) {
					tokens.push({ type: "descendant" });
				}
				sawWS = false;
			}

			if (firstChar === "*") {
				selector = selector.substr(1);
				tokens.push({ type: "universal" });
			} else if (firstChar in attribSelectors) {
				selector = selector.substr(1);
				tokens.push({
					type: "attribute",
					name: attribSelectors[firstChar][0],
					action: attribSelectors[firstChar][1],
					value: getName(),
					ignoreCase: false
				});
			} else if (firstChar === "[") {
				selector = selector.substr(1);
				data = selector.match(re_attr);
				if (!data) {
					throw new SyntaxError("Malformed attribute selector: " + selector);
				}
				selector = selector.substr(data[0].length);
				name = unescapeCSS(data[1]);

				if (!options || ("lowerCaseAttributeNames" in options ? options.lowerCaseAttributeNames : !options.xmlMode)) {
					name = name.toLowerCase();
				}

				tokens.push({
					type: "attribute",
					name: name,
					action: actionTypes[data[2]],
					value: unescapeCSS(data[4] || data[5] || ""),
					ignoreCase: !!data[6]
				});
			} else if (firstChar === ":") {
				if (selector.charAt(1) === ":") {
					selector = selector.substr(2);
					tokens.push({ type: "pseudo-element", name: getName().toLowerCase() });
					continue;
				}

				selector = selector.substr(1);

				name = getName().toLowerCase();
				data = null;

				if (selector.charAt(0) === "(") {
					if (name in unpackPseudos) {
						quot = selector.charAt(1);
						var quoted = quot in quotes;

						selector = selector.substr(quoted + 1);

						data = [];
						selector = parseSelector(data, selector, options);

						if (quoted) {
							if (selector.charAt(0) !== quot) {
								throw new SyntaxError("unmatched quotes in :" + name);
							} else {
								selector = selector.substr(1);
							}
						}

						if (selector.charAt(0) !== ")") {
							throw new SyntaxError("missing closing parenthesis in :" + name + " " + selector);
						}

						selector = selector.substr(1);
					} else {
						var pos = 1,
						    counter = 1;

						for (; counter > 0 && pos < selector.length; pos++) {
							if (selector.charAt(pos) === "(") counter++;else if (selector.charAt(pos) === ")") counter--;
						}

						if (counter) {
							throw new SyntaxError("parenthesis not matched");
						}

						data = selector.substr(1, pos - 2);
						selector = selector.substr(pos);

						if (name in stripQuotesFromPseudos) {
							quot = data.charAt(0);

							if (quot === data.slice(-1) && quot in quotes) {
								data = data.slice(1, -1);
							}

							data = unescapeCSS(data);
						}
					}
				}

				tokens.push({ type: "pseudo", name: name, data: data });
			} else if (re_name.test(selector)) {
				name = getName();

				if (!options || ("lowerCaseTags" in options ? options.lowerCaseTags : !options.xmlMode)) {
					name = name.toLowerCase();
				}

				tokens.push({ type: "tag", name: name });
			} else {
				if (tokens.length && tokens[tokens.length - 1].type === "descendant") {
					tokens.pop();
				}
				addToken(subselects, tokens);
				return selector;
			}
		}
	}

	addToken(subselects, tokens);

	return selector;
}

function addToken(subselects, tokens) {
	if (subselects.length > 0 && tokens.length === 0) {
		throw new SyntaxError("empty sub-selector");
	}

	subselects.push(tokens);
}

},{}],4:[function(require,module,exports){
"use strict";

var attributeFactory = require("./attributes.js");

function generalFactory(adapter, Pseudos) {
	/*
 	all available rules
 */
	return {
		__proto__: null,

		attribute: attributeFactory(adapter).compile,
		pseudo: Pseudos.compile,

		//tags
		tag: function tag(next, data) {
			var name = data.name;
			return function tag(elem) {
				return adapter.getName(elem) === name && next(elem);
			};
		},

		//traversal
		descendant: function descendant(next) {
			return function descendant(elem) {

				var found = false;

				while (!found && (elem = adapter.getParent(elem))) {
					found = next(elem);
				}

				return found;
			};
		},
		_flexibleDescendant: function _flexibleDescendant(next) {
			// Include element itself, only used while querying an array
			return function descendant(elem) {

				var found = next(elem);

				while (!found && (elem = adapter.getParent(elem))) {
					found = next(elem);
				}

				return found;
			};
		},
		parent: function parent(next, data, options) {
			if (options && options.strict) throw new Error("Parent selector isn't part of CSS3");

			return function parent(elem) {
				return adapter.getChildren(elem).some(test);
			};

			function test(elem) {
				return adapter.isTag(elem) && next(elem);
			}
		},
		child: function child(next) {
			return function child(elem) {
				var parent = adapter.getParent(elem);
				return !!parent && next(parent);
			};
		},
		sibling: function sibling(next) {
			return function sibling(elem) {
				var siblings = adapter.getSiblings(elem);

				for (var i = 0; i < siblings.length; i++) {
					if (adapter.isTag(siblings[i])) {
						if (siblings[i] === elem) break;
						if (next(siblings[i])) return true;
					}
				}

				return false;
			};
		},
		adjacent: function adjacent(next) {
			return function adjacent(elem) {
				var siblings = adapter.getSiblings(elem),
				    lastElement;

				for (var i = 0; i < siblings.length; i++) {
					if (adapter.isTag(siblings[i])) {
						if (siblings[i] === elem) break;
						lastElement = siblings[i];
					}
				}

				return !!lastElement && next(lastElement);
			};
		},
		universal: function universal(next) {
			return next;
		}
	};
}

module.exports = generalFactory;

},{"./attributes.js":1}],5:[function(require,module,exports){
"use strict";

module.exports = CSSselect;

var // DomUtils       = require("domutils"),
falseFunc = require("boolbase").falseFunc,
    compileFactory = require("./compile.js"),
    defaultCompile = compileFactory();

function getSelectorFunc(searchFunc) {
	return function select(query, elems, options) {
		options = options || {};
		var compile = compileFactory(options.adapter);

		if (typeof query !== "function") query = compile.compileUnsafe(query, options, elems);
		if (query.shouldTestNextSiblings) elems = appendNextSiblings(options && options.context || elems, options.adapter);
		if (!Array.isArray(elems)) elems = options.adapter.getChildren(elems);else elems = options.adapter.removeSubsets(elems);
		return searchFunc(query, elems, options);
	};
}

function getNextSiblings(elem, adapter) {
	var siblings = adapter.getSiblings(elem);
	if (!Array.isArray(siblings)) return [];
	siblings = siblings.slice(0);
	while (siblings.shift() !== elem) {}
	return siblings;
}

function appendNextSiblings(elems, adapter) {
	// Order matters because jQuery seems to check the children before the siblings
	if (!Array.isArray(elems)) elems = [elems];
	var newElems = elems.slice(0);

	for (var i = 0, len = elems.length; i < len; i++) {
		var nextSiblings = getNextSiblings(newElems[i], adapter);
		newElems.push.apply(newElems, nextSiblings);
	}
	return newElems;
}

var selectAll = getSelectorFunc(function selectAll(query, elems, options) {
	return query === falseFunc || !elems || elems.length === 0 ? [] : options.adapter.findAll(query, elems);
});

var selectOne = getSelectorFunc(function selectOne(query, elems, options) {
	return query === falseFunc || !elems || elems.length === 0 ? null : options.adapter.findOne(query, elems);
});

function is(elem, query, options) {
	options = options || {};
	var compile = compileFactory(options.adapter);
	return (typeof query === "function" ? query : compile(query, options))(elem);
}

// the exported interface
function CSSselect(query, elems, options) {
	return selectAll(query, elems, options);
}

CSSselect.compile = defaultCompile;
CSSselect.filters = defaultCompile.Pseudos.filters;
CSSselect.pseudos = defaultCompile.Pseudos.pseudos;

CSSselect.selectAll = selectAll;
CSSselect.selectOne = selectOne;

CSSselect.is = is;

// legacy methods (might be removed)
// CSSselect.parse = defaultCompile;
// CSSselect.iterate = selectAll;

// hooks
// CSSselect._compileUnsafe = defaultCompile.compileUnsafe;
// CSSselect._compileToken = defaultCompile.compileToken;

},{"./compile.js":2,"boolbase":22}],6:[function(require,module,exports){
module.exports={
  "universal": 50,
  "tag": 30,
  "attribute": 1,
  "pseudo": 0,
  "descendant": -1,
  "child": -1,
  "parent": -1,
  "sibling": -1,
  "adjacent": -1
}

},{}],7:[function(require,module,exports){
"use strict";

/*
	pseudo selectors

	---

	they are available in two forms:
	* filters called when the selector
	  is compiled and return a function
	  that needs to return next()
	* pseudos get called on execution
	  they need to return a boolean
*/

var getNCheck = require("nth-check"),
    BaseFuncs = require("boolbase"),
    attributesFactory = require("./attributes.js"),
    trueFunc = BaseFuncs.trueFunc,
    falseFunc = BaseFuncs.falseFunc;

function filtersFactory(adapter) {
	var attributes = attributesFactory(adapter),
	    checkAttrib = attributes.rules.equals;

	//helper methods
	function equals(a, b) {
		if (typeof adapter.equals === "function") return adapter.equals(a, b);

		return a === b;
	}

	function getAttribFunc(name, value) {
		var data = { name: name, value: value };
		return function attribFunc(next) {
			return checkAttrib(next, data);
		};
	}

	function getChildFunc(next) {
		return function (elem) {
			return !!adapter.getParent(elem) && next(elem);
		};
	}

	var filters = {
		contains: function contains(next, text) {
			return function contains(elem) {
				return next(elem) && adapter.getText(elem).indexOf(text) >= 0;
			};
		},
		icontains: function icontains(next, text) {
			var itext = text.toLowerCase();
			return function icontains(elem) {
				return next(elem) && adapter.getText(elem).toLowerCase().indexOf(itext) >= 0;
			};
		},

		//location specific methods
		"nth-child": function nthChild(next, rule) {
			var func = getNCheck(rule);

			if (func === falseFunc) return func;
			if (func === trueFunc) return getChildFunc(next);

			return function nthChild(elem) {
				var siblings = adapter.getSiblings(elem);

				for (var i = 0, pos = 0; i < siblings.length; i++) {
					if (adapter.isTag(siblings[i])) {
						if (siblings[i] === elem) break;else pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},
		"nth-last-child": function nthLastChild(next, rule) {
			var func = getNCheck(rule);

			if (func === falseFunc) return func;
			if (func === trueFunc) return getChildFunc(next);

			return function nthLastChild(elem) {
				var siblings = adapter.getSiblings(elem);

				for (var pos = 0, i = siblings.length - 1; i >= 0; i--) {
					if (adapter.isTag(siblings[i])) {
						if (siblings[i] === elem) break;else pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},
		"nth-of-type": function nthOfType(next, rule) {
			var func = getNCheck(rule);

			if (func === falseFunc) return func;
			if (func === trueFunc) return getChildFunc(next);

			return function nthOfType(elem) {
				var siblings = adapter.getSiblings(elem);

				for (var pos = 0, i = 0; i < siblings.length; i++) {
					if (adapter.isTag(siblings[i])) {
						if (siblings[i] === elem) break;
						if (adapter.getName(siblings[i]) === adapter.getName(elem)) pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},
		"nth-last-of-type": function nthLastOfType(next, rule) {
			var func = getNCheck(rule);

			if (func === falseFunc) return func;
			if (func === trueFunc) return getChildFunc(next);

			return function nthLastOfType(elem) {
				var siblings = adapter.getSiblings(elem);

				for (var pos = 0, i = siblings.length - 1; i >= 0; i--) {
					if (adapter.isTag(siblings[i])) {
						if (siblings[i] === elem) break;
						if (adapter.getName(siblings[i]) === adapter.getName(elem)) pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},

		//TODO determine the actual root element
		root: function root(next) {
			return function (elem) {
				return !adapter.getParent(elem) && next(elem);
			};
		},

		scope: function scope(next, rule, options, context) {
			if (!context || context.length === 0) {
				//equivalent to :root
				return filters.root(next);
			}

			if (context.length === 1) {
				//NOTE: can't be unpacked, as :has uses this for side-effects
				return function (elem) {
					return equals(context[0], elem) && next(elem);
				};
			}

			return function (elem) {
				return context.indexOf(elem) >= 0 && next(elem);
			};
		}

		//jQuery extensions (others follow as pseudos)
		/*
  checkbox: getAttribFunc("type", "checkbox"),
  file: getAttribFunc("type", "file"),
  password: getAttribFunc("type", "password"),
  radio: getAttribFunc("type", "radio"),
  reset: getAttribFunc("type", "reset"),
  image: getAttribFunc("type", "image"),
  submit: getAttribFunc("type", "submit")
  */
	};
	return filters;
}

function pseudosFactory(adapter) {
	//helper methods
	function getFirstElement(elems) {
		for (var i = 0; elems && i < elems.length; i++) {
			if (adapter.isTag(elems[i])) return elems[i];
		}
	}

	//while filters are precompiled, pseudos get called when they are needed
	var pseudos = {
		empty: function empty(elem) {
			return !adapter.getChildren(elem).some(function (elem) {
				return adapter.isTag(elem) || elem.type === "text";
			});
		},

		"first-child": function firstChild(elem) {
			return getFirstElement(adapter.getSiblings(elem)) === elem;
		},
		"last-child": function lastChild(elem) {
			var siblings = adapter.getSiblings(elem);

			for (var i = siblings.length - 1; i >= 0; i--) {
				if (siblings[i] === elem) return true;
				if (adapter.isTag(siblings[i])) break;
			}

			return false;
		},
		"first-of-type": function firstOfType(elem) {
			var siblings = adapter.getSiblings(elem);

			for (var i = 0; i < siblings.length; i++) {
				if (adapter.isTag(siblings[i])) {
					if (siblings[i] === elem) return true;
					if (adapter.getName(siblings[i]) === adapter.getName(elem)) break;
				}
			}

			return false;
		},
		"last-of-type": function lastOfType(elem) {
			var siblings = adapter.getSiblings(elem);

			for (var i = siblings.length - 1; i >= 0; i--) {
				if (adapter.isTag(siblings[i])) {
					if (siblings[i] === elem) return true;
					if (adapter.getName(siblings[i]) === adapter.getName(elem)) break;
				}
			}

			return false;
		},
		"only-of-type": function onlyOfType(elem) {
			var siblings = adapter.getSiblings(elem);

			for (var i = 0, j = siblings.length; i < j; i++) {
				if (adapter.isTag(siblings[i])) {
					if (siblings[i] === elem) continue;
					if (adapter.getName(siblings[i]) === adapter.getName(elem)) return false;
				}
			}

			return true;
		},
		"only-child": function onlyChild(elem) {
			var siblings = adapter.getSiblings(elem);

			for (var i = 0; i < siblings.length; i++) {
				if (adapter.isTag(siblings[i]) && siblings[i] !== elem) return false;
			}

			return true;
		}

		/*
  //:matches(a, area, link)[href]
  link: function(elem){
  	return adapter.hasAttrib(elem, "href");
  },
  visited: falseFunc, //seems to be a valid implementation
  //TODO: :any-link once the name is finalized (as an alias of :link)
  	//forms
  //to consider: :target
  	//:matches([selected], select:not([multiple]):not(> option[selected]) > option:first-of-type)
  selected: function(elem){
  	if(adapter.hasAttrib(elem, "selected")) return true;
  	else if(adapter.getName(elem) !== "option") return false;
  		//the first <option> in a <select> is also selected
  	var parent = adapter.getParent(elem);
  		if(
  		!parent ||
  		adapter.getName(parent) !== "select" ||
  		adapter.hasAttrib(parent, "multiple")
  	) return false;
  		var siblings = adapter.getChildren(parent),
  		sawElem  = false;
  		for(var i = 0; i < siblings.length; i++){
  		if(adapter.isTag(siblings[i])){
  			if(siblings[i] === elem){
  				sawElem = true;
  			} else if(!sawElem){
  				return false;
  			} else if(adapter.hasAttrib(siblings[i], "selected")){
  				return false;
  			}
  		}
  	}
  		return sawElem;
  },
  //https://html.spec.whatwg.org/multipage/scripting.html#disabled-elements
  //:matches(
  //  :matches(button, input, select, textarea, menuitem, optgroup, option)[disabled],
  //  optgroup[disabled] > option),
  // fieldset[disabled] * //TODO not child of first <legend>
  //)
  disabled: function(elem){
  	return adapter.hasAttrib(elem, "disabled");
  },
  enabled: function(elem){
  	return !adapter.hasAttrib(elem, "disabled");
  },
  //:matches(:matches(:radio, :checkbox)[checked], :selected) (TODO menuitem)
  checked: function(elem){
  	return adapter.hasAttrib(elem, "checked") || pseudos.selected(elem);
  },
  //:matches(input, select, textarea)[required]
  required: function(elem){
  	return adapter.hasAttrib(elem, "required");
  },
  //:matches(input, select, textarea):not([required])
  optional: function(elem){
  	return !adapter.hasAttrib(elem, "required");
  },
  	//jQuery extensions
  	//:not(:empty)
  parent: function(elem){
  	return !pseudos.empty(elem);
  },
  //:matches(h1, h2, h3, h4, h5, h6)
  header: function(elem){
  	var name = adapter.getName(elem);
  	return name === "h1" ||
  			name === "h2" ||
  			name === "h3" ||
  			name === "h4" ||
  			name === "h5" ||
  			name === "h6";
  },
  	//:matches(button, input[type=button])
  button: function(elem){
  	var name = adapter.getName(elem);
  	return name === "button" ||
  			name === "input" &&
  			adapter.getAttributeValue(elem, "type") === "button";
  },
  //:matches(input, textarea, select, button)
  input: function(elem){
  	var name = adapter.getName(elem);
  	return name === "input" ||
  			name === "textarea" ||
  			name === "select" ||
  			name === "button";
  },
  //input:matches(:not([type!='']), [type='text' i])
  text: function(elem){
  	var attr;
  	return adapter.getName(elem) === "input" && (
  		!(attr = adapter.getAttributeValue(elem, "type")) ||
  		attr.toLowerCase() === "text"
  	);
  }
  */
	};

	return pseudos;
}

function verifyArgs(func, name, subselect) {
	if (subselect === null) {
		if (func.length > 1 && name !== "scope") {
			throw new Error("pseudo-selector :" + name + " requires an argument");
		}
	} else {
		if (func.length === 1) {
			throw new Error("pseudo-selector :" + name + " doesn't have any arguments");
		}
	}
}

//FIXME this feels hacky
var re_CSS3 = /^(?:(?:nth|last|first|only)-(?:child|of-type)|root|empty|(?:en|dis)abled|checked|not)$/;

function factory(adapter) {
	var pseudos = pseudosFactory(adapter);
	var filters = filtersFactory(adapter);

	return {
		compile: function compile(next, data, options, context) {
			var name = data.name,
			    subselect = data.data;

			if (options && options.strict && !re_CSS3.test(name)) {
				throw new Error(":" + name + " isn't part of CSS3");
			}

			if (typeof filters[name] === "function") {
				verifyArgs(filters[name], name, subselect);
				return filters[name](next, subselect, options, context);
			} else if (typeof pseudos[name] === "function") {
				var func = pseudos[name];
				verifyArgs(func, name, subselect);

				if (next === trueFunc) return func;

				return function pseudoArgs(elem) {
					return func(elem, subselect) && next(elem);
				};
			} else {
				throw new Error("unmatched pseudo-class :" + name);
			}
		},
		filters: filters,
		pseudos: pseudos
	};
}

module.exports = factory;

},{"./attributes.js":1,"boolbase":22,"nth-check":103}],8:[function(require,module,exports){
"use strict";

module.exports = sortByProcedure;

/*
	sort the parts of the passed selector,
	as there is potential for optimization
	(some types of selectors are faster than others)
*/

var procedure = require("./procedure.json");

var attributes = {
	__proto__: null,
	exists: 10,
	equals: 8,
	not: 7,
	start: 6,
	end: 6,
	any: 5,
	hyphen: 4,
	element: 4
};

function sortByProcedure(arr) {
	var procs = arr.map(getProcedure);
	for (var i = 1; i < arr.length; i++) {
		var procNew = procs[i];

		if (procNew < 0) continue;

		for (var j = i - 1; j >= 0 && procNew < procs[j]; j--) {
			var token = arr[j + 1];
			arr[j + 1] = arr[j];
			arr[j] = token;
			procs[j + 1] = procs[j];
			procs[j] = procNew;
		}
	}
}

function getProcedure(token) {
	var proc = procedure[token.type];

	if (proc === procedure.attribute) {
		proc = attributes[token.action];

		if (proc === attributes.equals && token.name === "id") {
			//prefer ID selectors (eg. #ID)
			proc = 9;
		}

		if (token.ignoreCase) {
			//ignoreCase adds some overhead, prefer "normal" token
			//this is a binary operation, to ensure it's still an int
			proc >>= 1;
		}
	} else if (proc === procedure.pseudo) {
		if (!token.data) {
			proc = 3;
		} else if (token.name === "has" || token.name === "contains") {
			proc = 0; //expensive in any case
		} else if (token.name === "matches" || token.name === "not") {
			proc = 0;
			for (var i = 0; i < token.data.length; i++) {
				//TODO better handling of complex selectors
				if (token.data[i].length !== 1) continue;
				var cur = getProcedure(token.data[i][0]);
				//avoid executing :has or :contains
				if (cur === 0) {
					proc = 0;
					break;
				}
				if (cur > proc) proc = cur;
			}
			if (token.data.length > 1 && proc > 0) proc -= 1;
		} else {
			proc = 1;
		}
	}
	return proc;
}

},{"./procedure.json":6}],9:[function(require,module,exports){
'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MarkConvert = function MarkConvert(Mark) {
	var m = Mark; // holding reference to the Mark interface

	// convert DOM elment into Mark object
	function toMark(elmt, options) {
		if (!elmt) return null;
		var obj = m(options.format === 'xml' ? elmt.tagName : elmt.tagName.toLowerCase());
		if (elmt.hasAttributes()) {
			var attrs = elmt.attributes;
			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs[i];
				if (attr.specified) obj[attr.name] = attr.value;
			}
		}
		if (elmt.hasChildNodes()) {
			for (var i = 0; i < elmt.childNodes.length; i++) {
				var child = elmt.childNodes[i];
				if (child.nodeType === 3) {
					// text node
					if (options.ignoreSpace && /^\s*$/.test(child.textContent)) {
						// console.log("skip whitespace text", text);
					} else {
						console.log((0, _stringify2.default)(obj));
						obj.push(child.textContent);
					}
				} else if (child.nodeType === 1) {
					// element
					obj.push(toMark(child, options));
				} else if (child.nodeType === 8) {
					// comment
					obj.push(m.pragma('!--' + child.nodeValue, obj));
				}
				// todo: other node types are ignore
			}
		}
		return obj;
	}

	// parse html into Mark objects
	MarkConvert.parse = function (source, options) {
		if (!options) {
			options = { ignoreWhitespace: false };
		}
		// console.log('options:', options);
		if (typeof document !== 'undefined') {
			// in browser environment
			if (source.match(/^\s*(<!doctype|<html)/i)) {
				// treat as whole doc
				// console.log('parse html doc');
				// doc.documentElement.innerHTML = source; // innerHTML is insufficient, as global attributes on root html element will be ignored
				var parser = new DOMParser();
				var doc = parser.parseFromString(source, "text/html"); // console.log('doc elmt', doc.documentElement);
				// todo: error handling
				return toMark(doc.documentElement, options);
			} else if (source.match(/^\s*(<\?xml)/i)) {
				var parser = new DOMParser(); // console.log('parse xml', source);
				var doc = parser.parseFromString(source, "text/xml");
				// todo: error handling - dump(oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName);
				return toMark(doc.documentElement, options);
			} else {
				// treat as html fragment
				// console.log('parse html fragment');
				var doc = document.implementation.createHTMLDocument(null);
				doc.body.innerHTML = source;
				var children = doc.body.children;
				if (!children) return null;
				if (children.length > 1) {
					var result = [];
					for (var i = 0; i < children.length; i++) {
						result.push(toMark(children[i], options));
					}
					return result;
				} else {
					return toMark(doc.body.children[0], options);
				}
			}
		} else {
			// use htmlparser2 to parse
			// console.log('parse doc with htmlparser2');

			// setup the parser
			var htmlparser = require("htmlparser2");
			var parent = [],
			    stack = [];
			var opt = { decodeEntities: true };
			if (options.format == 'xml') {
				opt.xmlMode = true;
			}
			var parser = new htmlparser.Parser({
				onopentag: function onopentag(name, attribs) {
					var obj = m(name, attribs, null, parent);
					if (parent) {
						parent.push(obj);stack.push(parent);parent = obj;
					} else {
						parent = obj;
					}
				},
				ontext: function ontext(text) {
					if (options.ignoreSpace && /^\s*$/.test(text)) {
						// console.log("skip whitespace text", text);
					} else {
						parent.push(text);
					}
				},
				oncomment: function oncomment(comment) {
					parent.push(Mark.pragma('!--' + comment, parent));
				},
				onclosetag: function onclosetag(tagname) {
					parent = stack.pop();
				}
				// todo: onprocessinginstruction
			}, opt);

			// start parsing
			parser.write(source.trim());
			parser.end();
			// result might be an array
			return parent.length == 1 ? parent[0] : parent;
		}
	};

	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;' // &apos; is not defined in HTML4
	};
	var htmlEscaper = /[&<>"']/g;

	// escape unsafe chars in the string into HTML/XML entities
	function escapeStr(str) {
		return ('' + str).replace(htmlEscaper, function (match) {
			return htmlEscapes[match];
		});
	}

	// convert Mark into HTML
	MarkConvert.toHtml = function (object) {
		// ref: https://github.com/mixu/htmlparser-to-html
		var emptyTags = {
			"area": 1,
			"base": 1,
			"basefont": 1,
			"br": 1,
			"col": 1,
			"frame": 1,
			"hr": 1,
			"img": 1,
			"input": 1,
			"isindex": 1,
			"link": 1,
			"meta": 1,
			"param": 1,
			"embed": 1
		};

		function htm(obj) {
			if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) !== 'object') {
				return '';
			} // skip invalid object
			var pragma = obj.pragma();
			if (pragma) {
				// html comment
				return (pragma.substr(0, 3) === '!--' ? '<' : '<!--') + pragma + '-->';
			}

			// print opening tag
			var buffer = "<" + obj.constructor.name;
			// print object attributes
			for (var prop in obj) {
				var value = obj[prop];
				// https://stackoverflow.com/questions/2647867/how-to-determine-if-variable-is-undefined-or-null
				if (value != null && typeof value !== 'function') {
					// exclude null, undefined and function
					// todo: ensure 'prop' is proper html name
					buffer += ' ' + prop + '="' + escapeStr(value) + '"';
				}
			}
			buffer += ">";
			// print object content
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(obj), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var item = _step.value;

					if (typeof item === "string") {
						buffer += escapeStr(item);
					} else if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) === "object") {
						buffer += htm(item);
					} else {
						console.log("unknown object", item);
					}
				}

				// print closing tag for non-empty element
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			if (!emptyTags[obj.constructor.name]) {
				buffer += "</" + obj.constructor.name + ">";
			}
			return buffer;
		}

		var html = htm(object);
		if (html && object.constructor.name == 'html') {
			return "<!DOCTYPE html>" + html; // return full html
		} else {
			return html; // return html fragment
		}
	};

	// convert Mark into XML
	MarkConvert.toXml = function (object) {
		function xml(obj) {
			if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) !== 'object') {
				return '';
			} // skip invalid object
			if (obj.pragma()) {
				var pragma = obj.pragma();
				return pragma.startsWith('!--') ? '<' + pragma + '-->' : // comment
				'<?' + pragma + '?>'; // processing instruction
			}

			// print opening tag
			var buffer = "<" + obj.constructor.name;
			// print object attributes
			for (var prop in obj) {
				var value = obj[prop];
				// https://stackoverflow.com/questions/2647867/how-to-determine-if-variable-is-undefined-or-null
				if (value != null && typeof value !== 'function') {
					// exclude null, undefined and function
					// todo: ensure 'prop' is proper xml name
					buffer += ' ' + prop + '="' + escapeStr(value) + '"';
				}
			}
			if (obj[0]) {
				buffer += ">";
				// print object content
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = (0, _getIterator3.default)(obj), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var item = _step2.value;

						if (typeof item === "string") {
							buffer += escapeStr(item);
						} else if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) === "object") {
							buffer += xml(item);
						} else {
							console.log("unknown object", item);
						}
					}
					// print closing tag
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				buffer += "</" + obj.constructor.name + ">";
			} else {
				buffer += "/>";
			}
			return buffer;
		}

		// no fragment support
		var result = xml(object);
		return '<?xml version="1.0" encoding="UTF-8"?>' + result;
	};
	return MarkConvert;
};

if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object') module.exports = MarkConvert;

},{"babel-runtime/core-js/get-iterator":12,"babel-runtime/core-js/json/stringify":13,"babel-runtime/helpers/typeof":20,"htmlparser2":"htmlparser2"}],10:[function(require,module,exports){
"use strict";

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CSSselect = require("./css-select/index.js");

function isTag(node) {
	return (typeof node === "undefined" ? "undefined" : (0, _typeof3.default)(node)) === 'object' && node.constructor;
} // node.constructor.name !== 'Object' // JSON is included

function getParent(node) {
	return node.parent();
}

function getChildren(node) {
	return node[0] ? node.contents() : [];
}

// DOM adaptor for mark object hierarchy 
var adapter = {
	// is the node a tag?
	// isTag: (node:Node) => isTag:Boolean
	isTag: isTag,

	// does at least one of passed element nodes pass the test predicate?
	// existsOne: (test:Predicate, elems:[ElementNode]) => existsOne:Boolean
	existsOne: function existsOne(test, elems) {
		return elems.some(function (elem) {
			return isTag(elem) ? test(elem) || adapter.existsOne(test, getChildren(elem)) : false;
		});
	},
	// get the attribute value
	// getAttributeValue: ( elem:ElementNode, name:String ) => value:String
	getAttributeValue: function getAttributeValue(elem, name) {
		return elem[name];
	},

	// get the node's children
	// getChildren: (node:Node) => children:[Node]
	getChildren: getChildren,

	// get the name of the tag
	// getName: (elem:ElementNode) => tagName:String,
	getName: function getName(elem) {
		return elem.constructor.name;
	},

	// get the parent of the node
	// getParent: (node:Node) => parentNode:Node,
	getParent: getParent,

	// get the siblings of the node. Note that unlike jQuery's `siblings` method, this is expected to include the current node as well
	// getSiblings: (node:Node) => siblings:[Node],
	getSiblings: function getSiblings(node) {
		var parent = getParent(node);
		return parent && getChildren(parent);
	},

	// get the text content of the node, and its children if it has any
	// getText: (node:Node) => text:String,
	/*
 getText: function(node) {
 	if (typeof node === 'string') { return node; }
 	else if (node.constructor.name === 'Object') { return ''; } // JSON of Mark pragma
 	// element
 	var texts = [];
 	for (let c of node) { texts.push(getText(c)); }
 	return texts.join("");
 },
 */

	// does the element have the named attribute?
	// hasAttrib: (elem:ElementNode, name:String) => hasAttrib:Boolean,
	hasAttrib: function hasAttrib(elem, name) {
		return name in elem;
	},

	// takes an array of nodes, and removes any duplicates, as well as any nodes whose ancestors are also in the array
	// removeSubsets: (nodes:[Node]) => unique:[Node],
	/*
 removeSubsets: function(nodes) {
 	var idx = nodes.length, node, ancestor, replace;
 	// check if each node (or one of its ancestors) is already contained in the array.
 	while (--idx > -1) {
 		node = ancestor = nodes[idx];
 
 		// Temporarily remove the node under consideration
 		nodes[idx] = null;
 		replace = true;
 
 		while (ancestor) {
 			if (nodes.indexOf(ancestor) > -1) {
 				replace = false;
 				nodes.splice(idx, 1);
 				break;
 			}
 			ancestor = getParent(ancestor)
 		}
 
 		// If the node has been found to be unique, re-insert it.
 		if (replace) {
 			nodes[idx] = node;
 		}
 	}
 	return nodes;
 },
 */

	// finds all of the element nodes in the array that match the test predicate,
	// as well as any of their children that match it
	// findAll: (test:Predicate, nodes:[Node]) => elems:[ElementNode],
	findAll: function findAll(test, elems) {
		var result = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = (0, _getIterator3.default)(elems), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var elem = _step.value;

				if (!isTag(elem)) continue;
				if (test(elem)) result.push(elem);
				var childs = getChildren(elem);
				if (childs) result = result.concat(findAll(test, childs));
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return result;
	}

	// finds the first node in the array that matches the test predicate, or one
	// of its children 
	// findOne: (test:Predicate, elems:[ElementNode]) => findOne:ElementNode,
	/*
 findOne: function findOne(test, arr) {
 	var elem = null;
 	for (var i = 0, l = arr.length; i < l && !elem; i++) {
 		if (test(arr[i])) {
 			elem = arr[i];
 		} else {
 			var childs = getChildren(arr[i]);
 			if (childs && childs.length > 0) {
 				elem = findOne(test, childs);
 			}
 		}
 	}
 	return elem;
 }, 
 */

	/*
 The adapter can also optionally include an equals method, if your DOM
 structure needs a custom equality test to compare two objects which refer
 to the same underlying node. If not provided, `css-select` will fall back to
 `a === b`.
 */
	// equals: (a:Node, b:Node) => Boolean
};

module.exports = function (elmt) {
	return {
		find: function find(query, options) {
			// matches on children of elmt, not elmt itself
			try {
				return CSSselect(query, elmt, { xmlMode: options && options.caseSensitive, adapter: adapter });
			} catch (error) {
				console.error(error);
				return [];
			}
		},
		matches: function matches(query, options) {
			// tests whether or not an element is matched by query
			try {
				return CSSselect.is(elmt, query, { xmlMode: options && options.caseSensitive, adapter: adapter });
			} catch (error) {
				console.error(error);
				return false;
			}
		}
	};
};

},{"./css-select/index.js":5,"babel-runtime/core-js/get-iterator":12,"babel-runtime/helpers/typeof":20}],11:[function(require,module,exports){
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _iterator7 = require('babel-runtime/core-js/symbol/iterator');

var _iterator8 = _interopRequireDefault(_iterator7);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// mark.js
// Objective Markup Notation. See README.md for details.
//
// This file is based directly of JSON5 at:
// https://github.com/json5/json5/blob/master/lib/json5.js
// which is further based of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

// symbols used internally
var $length = (0, _symbol2.default)('Mark.length');
var $parent = (0, _symbol2.default)('Mark.parent');
var $pragma = (0, _symbol2.default)('Mark.pragma');

// static Mark API
var MARK = function () {
	"use strict";
	// cached constructors for the Mark objects

	var constructors = {};

	// Mark object constructor
	function Mark(typeName, props, contents, parent) {
		"use strict";
		// 1. prepare the constructor

		var con = constructors[typeName];
		if (!con) {
			if (typeof typeName !== 'string') {
				throw "Type name should be a string";
			}
			con = constructors[typeName] = function () {};
			// con.prototype.constructor is set to con by JS
			// sets the type name
			Object.defineProperty(con, 'name', { value: typeName, configurable: true }); // non-writable, as we don't want the name to be changed

			// con.prototype.__proto__ = Array.prototype; // Mark no longer extends Array; Mark is array like, but not array.

			// con is set to extend Mark, instead of copying all the API functions
			// for (let a in api) { Object.defineProperty(con.prototype, a, {value:api[a], writable:true, configurable:true}); } // make API functions non-enumerable
			(0, _setPrototypeOf2.default)(con.prototype, Mark.prototype);
		}

		// 2. create object
		var obj = (0, _create2.default)(con.prototype);

		// 3. copy properties, numeric keys are not allowed
		if (props) {
			for (var p in props) {
				// propsTraps.set(obj, p, props[p]); 
				// accept only non-numeric key
				if (isNaN(p * 1)) {
					obj[p] = props[p];
				}
			}
		}

		// 4. copy contents if any
		var len = 0;
		if (contents) {
			var addContents = function addContents(items) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = (0, _getIterator3.default)(items), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var val = _step.value;

						var t = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);
						if (t === 'string') {
							if (!val.length) continue; // skip empty text '', ""
							if (prev_type === 'string') {
								len--;val = obj[len] + val; // merge text nodes
							}
						} else if (t === 'object') {
							if (val === null) continue; // skip null value
							else if (val instanceof Array) {
									// expanded it inline
									addContents(val);continue;
								}
							// else, assume Mark object
						} else {
							// other primitive values
							val = val.toString(); // convert to string, as Mark only accept text and Mark object as content
							if (prev_type === 'string') {
								len--;val = obj[len] + val; // merge text nodes
							}
						}
						(0, _defineProperty2.default)(obj, len, { value: val, writable: true, configurable: true }); // make content non-enumerable
						prev_type = t;len++;
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			};

			var prev_type = null;

			addContents(contents);
		}
		// set $length
		obj[$length] = len;

		// set $parent
		if (parent) {
			obj[$parent] = parent;
		}
		return obj;
	};

	// reset content of this object
	function replaceWith(trg, obj) {
		// console.log('src obj:', obj);
		// reset properties and contents
		for (var p in trg) {
			if (typeof trg[p] !== 'function') delete trg[p];
		}
		for (var i = 0, len = trg[$length]; i < len; i++) {
			delete trg[i];
		} // console.log('obj afte reset:', trg);
		// copy over new constructr, properties and contents
		(0, _setPrototypeOf2.default)(trg, (0, _getPrototypeOf2.default)(obj));
		for (var _p in obj) {
			trg[_p] = obj[_p];
		}
		var length = obj[$length];
		for (var _i = 0; _i < length; _i++) {
			(0, _defineProperty2.default)(trg, _i, { value: obj[_i], writable: true, configurable: true }); // make content item non-enumerable
		}
		trg[$length] = length; // console.log('obj afte copy:', trg);
	}

	// Mark object API functions
	var api = {
		// object 'properties': just use JS Object.keys(), Object.values(), Object.entries() to work with the properties	
		contents: function contents() {
			var list = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (0, _getIterator3.default)(this), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var c = _step2.value;
					list.push(c);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return list;
		},
		// get contents length
		length: function length() {
			return this[$length];
		},
		// to set or get a property
		prop: function prop(name, value) {
			// accept only non-numeric key
			if (typeof name === 'string' && isNaN(name * 1)) {
				if (value !== undefined) {
					this[name] = value;return this;
				} // returns this, so that the call can be chained
				else return this[name];
			} else {
				throw "Property name should not be numeric";
			}
		},
		// to set or get parent
		parent: function parent(pa) {
			if (pa !== undefined) {
				this[$parent] = pa;return this;
			} // returns this, so that the call can be chained
			else return this[$parent];
		},
		// to set or get pragma content
		pragma: function pragma(value) {
			if (value !== undefined) {
				this[$pragma] = value;return this;
			} // returns this, so that the call can be chained
			else return this[$pragma];
		},

		// todo: do content normalization
		push: function push() {
			// copy the arguments
			var length = this[$length];
			for (var i = 0; i < arguments.length; i++) {
				(0, _defineProperty2.default)(this, length + i, { value: arguments[i], writable: true, configurable: true }); // make content item non-enumerable
			}
			length += arguments.length;
			this[$length] = length;
			return length;
		},
		pop: function pop() {
			var length = this[$length];
			if (length > 0) {
				var item = this[length - 1];delete this[length - 1];
				this[$length] = length - 1;
				return item;
			} else {
				return undefined;
			}
		},
		// insert item(s) at the given index  // todo: do content normalization
		insert: function insert(item, index) {
			index = index || 0;
			var length = this[$length];
			if (index < 0 || index > length) {
				throw "Invalid index";
			}
			var offset = item instanceof Array ? item.length : 1;
			// shift items after index
			for (var i = length - 1; i >= index; i--) {
				(0, _defineProperty2.default)(this, i + offset, { value: this[i], writable: true, configurable: true }); // make content item non-enumerable
			}
			// insert items
			if (offset > 1) {
				for (var _i2 = 0; _i2 < offset; _i2++) {
					(0, _defineProperty2.default)(this, index + _i2, { value: item[_i2], writable: true, configurable: true }); // make content item non-enumerable
				}
			} else {
				(0, _defineProperty2.default)(this, index, { value: item, writable: true, configurable: true }); // make content item non-enumerable
			}
			this[$length] = length + offset;
			return this; // for call chaining
		},
		// can consider support 2nd param of cnt (for no. of items to remove)
		// consider remove self
		remove: function remove(index) {
			if (arguments.length) {
				// shift the items
				var length = this[$length];
				if (index >= 0 && index < length) {
					for (var i = index; i < length - 1; i++) {
						this[i] = this[i + 1];
					}
					this[$length] = length - 1;
				}
				// else invalid index
			}
			return this; // for call chaining
		},
		// todo: another useful jQuery API?

		// filter: like Array.prototype.filter
		filter: function filter(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			var obj = Object(this);
			var res = [],
			    i = 0;
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)(obj), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var n = _step3.value;

					if (func.call(thisArg || obj, n, i, obj)) {
						res.push(n);
					}
					i++;
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return res;
		},

		// map: like Array.prototype.map
		map: function map(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			var obj = Object(this);
			var res = [],
			    i = 0;
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = (0, _getIterator3.default)(obj), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var n = _step4.value;

					res[i] = func.call(thisArg || obj, n, i, obj);
					i++;
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return res;
		},

		// reduce: like Array.prototype.reduce
		reduce: function reduce(func) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			var obj = Object(this),
			    len = obj[$length],
			    k = 0,
			    value = void 0;
			if (arguments.length == 2) {
				value = arguments[1];
			} else {
				if (k >= len) {
					throw new TypeError('Reduce of empty contents with no initial value');
				}
				value = obj[k++];
			}
			for (; k < len; k++) {
				value = func(value, obj[k], k, obj);
			}
			return value;
		},

		// every: like Array.prototype.every
		every: function every(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			var i = 0,
			    obj = Object(this);
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = (0, _getIterator3.default)(obj), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var n = _step5.value;

					var result = func.call(thisArg || obj, n, i, obj);
					if (!result) {
						return false;
					}
					i++;
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			return true;
		},

		// some: like Array.prototype.some
		some: function some(func, thisArg) {
			if (!(typeof func === 'function' && this)) throw new TypeError();
			var i = 0,
			    obj = Object(this);
			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = (0, _getIterator3.default)(obj), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var n = _step6.value;

					if (func.call(thisArg || obj, n, i, obj)) {
						return true;
					}
					i++;
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}

			return false;
		},

		// Mark selector APIs
		// find() is similar to jQuery find(), diff from Array.prototype.find()
		find: function find(selector) {
			// load helper on demand
			if (!MARK.$select) {
				MARK.$select = require('./lib/mark.selector.js');
			}
			return MARK.$select(this).find(selector);
		},
		matches: function matches(selector) {
			// load helper on demand
			if (!MARK.$select) {
				MARK.$select = require('./lib/mark.selector.js');
			}
			return MARK.$select(this).matches(selector);
		},

		// conversion APIs
		source: function source() {
			// get the source
			if (!arguments.length) {
				return MARK.stringify(this);
			}
			// set the source
			replaceWith(this, MARK.parse(arguments[0]));
			return this; // for call chaining
		},
		// json: function() {}
		html: function html() {
			if (!arguments.length) {
				// get html source
				// load helper on demand
				if (!MARK.$convert) {
					MARK.$convert = require('./lib/mark.convert.js')(Mark);
				}
				return MARK.$convert.toHtml(this);
			} else {
				// set html source
				var options = arguments[1] || {};options.format = 'html';
				replaceWith(this, MARK.parse(arguments[0], options));
				return this; // for call chaining
			}
		},
		xml: function xml() {
			if (!arguments.length) {
				// get xml source
				// load helper on demand
				if (!MARK.$convert) {
					MARK.$convert = require('./lib/mark.convert.js')(Mark);
				}
				return MARK.$convert.toXml(this);
			} else {
				// set html source
				var options = arguments[1] || {};options.format = 'xml';
				replaceWith(this, MARK.parse(arguments[0], options));
				return this; // for call chaining
			}
		}
		// set the APIs
	};for (var a in api) {
		var func = { value: api[a], writable: true, configurable: true };
		// Mark.prototype[a] = api[a];  // direct assignment will make the API functions enumerable
		(0, _defineProperty2.default)(Mark.prototype, a, func); // make API functions non-enumerable

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
	Mark.prototype[_iterator8.default] = /*#__PURE__*/_regenerator2.default.mark(function _callee() {
		var length, i;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						length = this[$length];
						i = 0;

					case 2:
						if (!(i < length)) {
							_context.next = 8;
							break;
						}

						_context.next = 5;
						return this[i];

					case 5:
						i++;
						_context.next = 2;
						break;

					case 8:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	});

	// Mark pragma constructor
	Mark.pragma = function (pragma, parent) {
		var con = constructors['!pragma'];
		if (!con) {
			con = (0, _create2.default)(null); // con = {};  Object.setPrototypeOf(con, null);
			Object.defineProperty(con, 'pragma', { value: api.pragma });
			Object.defineProperty(con, 'parent', { value: api.parent });
			Object.defineProperty(con, 'valueOf', { value: Object.valueOf });
			Object.defineProperty(con, 'toString', { value: function value() {
					return '[object Pragma]';
				} });
			// any other API?
			constructors['!pragma'] = con;
		}
		// let obj = {}; // pragma has no other property or content
		// Object.setPrototypeOf(obj, con);
		var obj = (0, _create2.default)(con);
		obj[$pragma] = pragma; // pragma conent stored as Symbol
		if (parent) {
			obj[$parent] = parent;
		}
		return obj;
	};

	function isNameChar(c) {
		return 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || '0' <= c && c <= '9' || c === '_' || c === '$' || c === '.' || c === '-';
	}
	function isNameStart(c) {
		return 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || c === '_' || c === '$';
	}
	// exported for convenience
	Mark.isName = function (key) {
		if (typeof key !== 'string') {
			return false;
		}
		if (!isNameStart(key[0])) {
			return false;
		}
		var i = 1,
		    length = key.length;
		while (i < length) {
			if (!isNameChar(key[i])) {
				return false;
			}
			i++;
		}
		return true;
	};

	return Mark;
}();

// parse() is only defined on the static Mark API
MARK.parse = function () {
	// This is a function that can parse a Mark text, producing a JavaScript data structure. 
	// It is a simple, recursive descent parser. It does not use eval or regular expressions, 
	// so it can be used as a model for implementing a Mark parser in other languages.
	"use strict";

	var UNEXPECT_END = "Unexpected end of input";

	var at = void 0,
	    // The index of the current character
	lineNumber = void 0,
	    // The current line number
	columnNumber = void 0,
	    // The current column number
	ch = void 0,
	    // The current character
	text = void 0,
	    // The text being parsed

	escapee = {
		"'": "'",
		'"': '"',
		'\\': '\\',
		'/': '/',
		'\n': '', // Replace escaped newlines in strings w/ empty string
		b: '\b',
		f: '\f',
		n: '\n',
		r: '\r',
		t: '\t'
	},
	    ws = [' ', '\t', '\r', '\n', '\v', '\f', '\xA0', '\uFEFF'],
	    renderChar = function renderChar(chr) {
		return chr === '' ? 'EOF' : "'" + chr + "'";
	},
	    error = function error(m) {
		// Call error when something is wrong.
		// todo: Still to read can scan to end of line
		var msg = m + " at line " + lineNumber + " column " + columnNumber + " of the Mark data. Still to read: " + (0, _stringify2.default)(text.substring(at - 1, at + 30) + "...");
		var error = new SyntaxError(msg);
		// beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
		error.at = at;
		// These two property names have been chosen to agree with the ones in Gecko, the only popular
		// environment which seems to supply this info on JSON.parse
		error.lineNumber = lineNumber;
		error.columnNumber = columnNumber;
		throw error;
	},
	    next = function next(c) {
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
	    peek = function peek() {
		// Get the next character without consuming it or
		// assigning it to the ch varaible.
		return text.charAt(at);
	},


	// Parse an identifier.
	identifier = function identifier() {
		// Normally, reserved words are disallowed here, but we
		// only use this for unquoted object keys, where reserved words are allowed,
		// so we don't check for those here. References:
		// - http://es5.github.com/#x7.6
		// - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
		// - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
		// TODO Identifiers can have Unicode "letters" in them; add support for those.

		var key = ch;

		// Identifiers must start with a letter, _ or $.
		if (ch !== '_' && ch !== '$' && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
			error("Bad identifier as unquoted key");
		}

		// Subsequent characters can contain digits.
		while (next() && ('a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || '0' <= ch && ch <= '9' || ch === '_' || ch === '$' || ch === '.' || ch === '-' // add 2 special chars commonly used in html and xml names, which are not valid JS name chars
		)) {
			key += ch;
		}

		return key;
	},


	// Parse a number value.
	number = function number() {
		var number = void 0,
		    sign = '',
		    string = '',
		    base = 10;

		if (ch === '-' || ch === '+') {
			sign = ch;next(ch);
		}

		// support for Infinity (could tweak to allow other words):
		if (ch === 'I') {
			number = word();
			if (typeof number !== 'number' || isNaN(number)) {
				error('Unexpected word for number');
			}
			return sign === '-' ? -number : number;
		}

		// support for NaN
		if (ch === 'N') {
			number = word();
			if (!isNaN(number)) {
				error('expected word to be NaN');
			}
			// ignore sign as -NaN also is NaN
			return number;
		}

		if (ch === '0') {
			string += ch;next();
		} else {
			while (ch >= '0' && ch <= '9') {
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
	string = function string() {
		var hex,
		    i,
		    string = '',
		    triple = false,
		    delim,
		    // double quote or single quote
		uffff;

		// when parsing for string values, we must look for ' or " and \ characters.
		if (ch === '"' || ch === "'") {
			delim = ch;
			if (peek() === delim && text.charAt(at + 1) === delim) {
				// got tripple quote
				triple = true;next();next();
			}
			while (next()) {
				if (ch === delim) {
					next();
					if (!triple) {
						// end of string
						return string;
					} else if (ch === delim && peek() === delim) {
						// end of tripple quoted text
						next();next();return string;
					} else {
						string += delim;
					}
					// continue
				}
				if (ch === '\\') {
					// escape sequence
					if (triple) {
						string += '\\';
					} // treated as normal char
					else {
							// escape sequence
							next();
							if (ch === 'u') {
								// unicode escape sequence
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
								// ignore the line-end, as defined in ES5
								if (peek() === '\n') {
									next();
								}
							} else if (typeof escapee[ch] === 'string') {
								string += escapee[ch];
							} else {
								break; // bad escape
							}
						}
				}
				// else if (ch === '\n') {
				// unescaped newlines are invalid in JSON, but valid in Mark; 
				// see: https://github.com/json5/json5/issues/24
				// break;
				// } 
				else {
						// normal char
						string += ch;
					}
			}
		}
		error("Bad string");
	},


	// Skip an inline comment
	inlineComment = function inlineComment() {
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
	blockComment = function blockComment() {
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
	comment = function comment() {
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
	white = function white() {
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
	word = function word() {
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
	    value = void 0,
	    // Place holder for the value function.

	// parse an array value
	array = function array() {
		var array = [];

		next(); // skip the starting '['
		white();
		while (ch) {
			if (ch === ']') {
				next();
				return array; // Potentially empty array
			}
			// ES5 allows omitting elements in arrays, e.g. [,] and [,null]. JSON and Mark don't allow this.
			if (ch === ',') {
				error("Missing array element");
			} else {
				array.push(value());
			}
			white();

			// comma is optional in Mark
			if (ch === ',') {
				next();white();
			}
		}
	},


	// Parse an object value
	object = function object(parent) {
		var key = void 0,
		    obj = {},
		    extended = false,
		    // whether the is extended Mark object or legacy JSON object
		hasBrace = false,
		    // whether the object has any unescaped brace
		index = 0;
		// all 3 types: Mark object, JSON object, Mark pragma store reference to parent 
		if (parent) {
			obj[$parent] = parent;
		}

		next(); // skip the starting '{'
		// store the current source position, in case we need to backtrack later
		var bkAt = at,
		    bkLineNumber = lineNumber,
		    bkColumnNumber = columnNumber;

		try {
			var putText = function putText(text) {
				// check preceding node
				if (index > 0 && typeof obj[index - 1] === 'string') {
					// merge with previous text
					obj[index - 1] += text;
				} else {
					(0, _defineProperty2.default)(obj, index, { value: text, writable: true, configurable: true }); // make content non-enumerable
					index++;
				}
			},
			    parseContent = function parseContent() {
				while (ch) {
					if (ch === '{') {
						// child object
						hasBrace = true;
						(0, _defineProperty2.default)(obj, index, { value: object(obj), writable: true, configurable: true }); // make content non-enumerable
						index++;
					} else if (ch === '"' || ch === "'") {
						// text node
						var _str = string();
						// only output non empty text
						if (_str) putText(_str);
					} else if (ch === '}') {
						next();obj[$length] = index;
						return;
					} else {
						error("Unexpected character " + renderChar(ch));
					}
					white();
				}
				error(UNEXPECT_END);
			};

			white();
			while (ch) {
				if (ch === '}') {
					// end of the object
					next();
					if (extended) {
						obj[$length] = index;
					}
					return obj; // potentially empty object
				}

				// scan the key
				if (ch === '"' || ch === "'") {
					// quoted key
					var str = string();white();
					if (ch == ':') {
						// property, legacy JSON
						key = str;
					} else {
						if (extended) {
							// got text node
							// only output non-empty text
							if (str) putText(str);
							parseContent();
							return obj;
						} else if (!key) {
							// at the starting of the object
							// create the object
							obj = MARK(str, null, null, parent);
							extended = true;key = str;
							continue;
						}
						// else bad object
					}
				} else if (ch === '{') {
					// child object
					if (extended) {
						hasBrace = true;parseContent();return obj;
					}
					error("Unexpected character '{'");
				} else {
					// JSON5 or Mark unquoted key, which needs to be valid JS identifier.
					var ident = identifier();
					white();
					if (!key) {
						// at the starting of the object						
						if (ch != ':') {
							// assume is Mark object
							// console.log("got Mark object of type: ", ident);
							// create the object
							obj = MARK(ident, null, null, parent);
							extended = true;key = ident;
							continue;
						} else {
							// JSON object
							if (!obj.constructor.name) {
								obj.constructor.name = 'Object';
							} // IE11 does not set constructor.name to 'Object'
						}
					}
					key = ident;
				}

				if (ch == ':') {
					// key-value pair
					next();
					if (ch === '{') {
						hasBrace = true;
					}
					var val = value();
					if (extended && !isNaN(key * 1)) {
						// any numeric key is rejected for Mark object
						error("Numeric key not allowed as Mark property name");
					}
					obj[key] = val;
					white();
					// ',' is optional in Mark
					if (ch === ',') {
						next();white();
					}
					/*
     if (ch === '}') { // end of the object
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
     */
				} else {
					error("Bad object");
				}
			}
			error(UNEXPECT_END);
		} catch (e) {
			if (hasBrace) {
				throw e;
			} // cannot be parsed as Mark pragma and throw the error again, as brace needs to be escaped in Mark pragma
			// restore parsing position, and try parse as Mark pragma
			at = bkAt;lineNumber = bkLineNumber;columnNumber = bkColumnNumber;
			ch = text.charAt(at - 1);

			var pragma = '';
			while (ch) {
				if (ch === '}') {
					// end of pragma
					next();
					return MARK.pragma(pragma, parent);
				} else if (ch === '\\') {
					// escape '{' or '}', as html, xml comment may contain '{' and '}'
					next();
					if (ch !== '{' && ch !== '}') {
						pragma += '\\';
					}
				} else if (ch === '{' || ch === '}') {
					error("Brace character '" + ch + "' should be escaped in Mark pragma");
				}
				pragma += ch;
				next();
			}
			error(UNEXPECT_END);
		}
	};

	// Parse a JSON value. 
	value = function value() {
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
	return function (source, options) {
		// initialize the contextual variables
		at = 0;
		lineNumber = 1;
		columnNumber = 1;
		ch = ' ';
		text = String(source);

		if (!source) {
			text = '';error(UNEXPECT_END);
		}
		if ((typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object' && options.format != 'mark') {
			// parse as other formats
			// is it better to use a Symbol here?
			if (!MARK.$convert) {
				MARK.$convert = require('./lib/mark.convert.js')(MARK);
			}
			return MARK.$convert.parse(source, options);
		}
		// else // parse as Mark

		// start parsing as a JSON value
		var result = value();
		white();
		if (ch) {
			error("Syntax error");
		}

		// Supporting the legacy JSON reviver function:
		// If there is a reviver function, we recursively walk the new structure,
		// passing each name/value pair to the reviver function for possible
		// transformation, starting with a temporary root object that holds the result
		// in an empty key. If there is not a reviver function, we simply return the result.
		return typeof options === 'function' ? function walk(holder, key) {
			var k,
			    v,
			    value = holder[key];
			if (value && (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
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
		}({ '': result }, '') : result;
	};
}();

// stringify() is only defined on the static Mark API
// Mark stringify will not quote keys where appropriate
MARK.stringify = function (obj, options, space) {
	"use strict";

	var replacer = null;
	if (options) {
		if (typeof options === "function" || isArray(options)) {
			replacer = options;
		} else if ((typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) !== "object") throw new Error('Option must be a function or an object');
	}
	var getReplacedValueOrUndefined = function getReplacedValueOrUndefined(holder, key, isTopLevel) {
		var value = holder[key];

		// Replace the value with its toJSON value first, if possible
		// if (value && value.toJSON && typeof value.toJSON === "function") {
		//    value = value.toJSON();
		// }

		// If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
		// presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
		if (typeof replacer === "function") {
			return replacer.call(holder, key, value);
		} else if (replacer) {
			if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
				return value;
			} else {
				return undefined;
			}
		} else {
			return value;
		}
	};

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
	var omitComma = options && options.omitComma;

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
		'"': '\\"',
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

	function internalStringify(holder, key, isTopLevel) {
		var buffer, res;

		// Replace the value, if necessary
		var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

		if (obj_part && !isDate(obj_part)) {
			// unbox objects, don't unbox dates, since will turn it into number
			obj_part = obj_part.valueOf();
		}
		switch (typeof obj_part === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj_part)) {
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
					checkForCircular(obj_part); // console.log('print array', obj_part);
					buffer = "[";
					objStack.push(obj_part);

					for (var i = 0; i < obj_part.length; i++) {
						res = internalStringify(obj_part, i, false);
						if (indentStr) buffer += makeIndent(indentStr, objStack.length);
						if (res === null || typeof res === "undefined") {
							buffer += "null";
						} else {
							buffer += res;
						}
						if (i < obj_part.length - 1) {
							buffer += omitComma ? ' ' : ',';
						} else if (indentStr) {
							buffer += "\n";
						}
					}
					objStack.pop();
					if (obj_part.length && indentStr) {
						buffer += makeIndent(indentStr, objStack.length, true);
					}
					buffer += "]";
				} else {
					checkForCircular(obj_part); // console.log('print obj', obj_part);
					buffer = "{";
					var nonEmpty = false;
					objStack.push(obj_part);
					// print object type-name, if any
					if (!obj_part.constructor) {
						// assume Mark pragma
						// todo: should escape '{','}' in $pragma
						return obj_part[$pragma] ? '{' + obj_part[$pragma] + '}' : 'null' /* unknown object */;
					}
					if (obj_part.constructor.name !== 'Object' || obj_part instanceof MARK) {
						buffer += obj_part.constructor.name;nonEmpty = true;
					}
					// else JSON

					// print object attributes
					var hasAttr = false;
					for (var prop in obj_part) {
						var value = internalStringify(obj_part, prop, false);
						isTopLevel = false;
						if (typeof value !== "undefined" && value !== null) {
							// buffer += makeIndent(indentStr, objStack.length);                            
							key = MARK.isName(prop) ? prop : escapeString(prop);
							buffer += (hasAttr ? omitComma ? ' ' : ', ' : nonEmpty ? ' ' : '') + key + ":" + value;
							hasAttr = true;nonEmpty = true;
						}
					}
					// print object content
					var length = obj_part[$length];
					if (length) {
						for (var i = 0; i < length; i++) {
							buffer += ' ';
							var item = obj_part[i];
							if (typeof item === "string") {
								if (indentStr) buffer += makeIndent(indentStr, objStack.length);
								buffer += escapeString(item.toString());
							} else if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) === "object") {
								if (indentStr) buffer += makeIndent(indentStr, objStack.length);
								buffer += internalStringify({ "": item }, '', false);
							} else {
								console.log("unknown object", item);
							}
						}
					}
					objStack.pop();
					if (nonEmpty) {
						// buffer = buffer.substring(0, buffer.length-1) + makeIndent(indentStr, objStack.length) + "}";
						if (length && indentStr) {
							buffer += makeIndent(indentStr, objStack.length);
						}
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
	var topLevelHolder = { "": obj };
	if (obj === undefined) {
		return getReplacedValueOrUndefined(topLevelHolder, '', true);
	}
	return internalStringify(topLevelHolder, '', true);
};

// export the Mark interface
if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object') module.exports = MARK;

},{"./lib/mark.convert.js":9,"./lib/mark.selector.js":10,"babel-runtime/core-js/get-iterator":12,"babel-runtime/core-js/json/stringify":13,"babel-runtime/core-js/object/create":14,"babel-runtime/core-js/object/define-property":15,"babel-runtime/core-js/object/get-prototype-of":16,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":18,"babel-runtime/core-js/symbol/iterator":19,"babel-runtime/helpers/typeof":20,"babel-runtime/regenerator":21}],12:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":23}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":24}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":25}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":26}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":27}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":28}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":29}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":30}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":18,"../core-js/symbol/iterator":19}],21:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":105}],22:[function(require,module,exports){
module.exports = {
	trueFunc: function trueFunc(){
		return true;
	},
	falseFunc: function falseFunc(){
		return false;
	}
};
},{}],23:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');

},{"../modules/core.get-iterator":90,"../modules/es6.string.iterator":97,"../modules/web.dom.iterable":101}],24:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":37}],25:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":37,"../../modules/es6.object.create":92}],26:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":37,"../../modules/es6.object.define-property":93}],27:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":37,"../../modules/es6.object.get-prototype-of":94}],28:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":37,"../../modules/es6.object.set-prototype-of":95}],29:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":37,"../../modules/es6.object.to-string":96,"../../modules/es6.symbol":98,"../../modules/es7.symbol.async-iterator":99,"../../modules/es7.symbol.observable":100}],30:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":87,"../../modules/es6.string.iterator":97,"../../modules/web.dom.iterable":101}],31:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],32:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],33:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":53}],34:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":79,"./_to-iobject":81,"./_to-length":82}],35:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":36,"./_wks":88}],36:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],37:[function(require,module,exports){
var core = module.exports = { version: '2.5.3' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],38:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":31}],39:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],40:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":45}],41:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":46,"./_is-object":53}],42:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],43:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":66,"./_object-keys":69,"./_object-pie":70}],44:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && key in exports) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":37,"./_ctx":38,"./_global":46,"./_hide":48}],45:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],46:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],47:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],48:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":40,"./_object-dp":61,"./_property-desc":72}],49:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":46}],50:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":40,"./_dom-create":41,"./_fails":45}],51:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":36}],52:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":36}],53:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],54:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":48,"./_object-create":60,"./_property-desc":72,"./_set-to-string-tag":75,"./_wks":88}],55:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var has = require('./_has');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = (!BUGGY && $native) || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":44,"./_has":47,"./_hide":48,"./_iter-create":54,"./_iterators":57,"./_library":58,"./_object-gpo":67,"./_redefine":73,"./_set-to-string-tag":75,"./_wks":88}],56:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],57:[function(require,module,exports){
module.exports = {};

},{}],58:[function(require,module,exports){
module.exports = true;

},{}],59:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":45,"./_has":47,"./_is-object":53,"./_object-dp":61,"./_uid":85}],60:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":33,"./_dom-create":41,"./_enum-bug-keys":42,"./_html":49,"./_object-dps":62,"./_shared-key":76}],61:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":33,"./_descriptors":40,"./_ie8-dom-define":50,"./_to-primitive":84}],62:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":33,"./_descriptors":40,"./_object-dp":61,"./_object-keys":69}],63:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":40,"./_has":47,"./_ie8-dom-define":50,"./_object-pie":70,"./_property-desc":72,"./_to-iobject":81,"./_to-primitive":84}],64:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":65,"./_to-iobject":81}],65:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":42,"./_object-keys-internal":68}],66:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],67:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":47,"./_shared-key":76,"./_to-object":83}],68:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":34,"./_has":47,"./_shared-key":76,"./_to-iobject":81}],69:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":42,"./_object-keys-internal":68}],70:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],71:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":37,"./_export":44,"./_fails":45}],72:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],73:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":48}],74:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":33,"./_ctx":38,"./_is-object":53,"./_object-gopd":63}],75:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":47,"./_object-dp":61,"./_wks":88}],76:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":77,"./_uid":85}],77:[function(require,module,exports){
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};

},{"./_global":46}],78:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":39,"./_to-integer":80}],79:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":80}],80:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],81:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":39,"./_iobject":51}],82:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":80}],83:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":39}],84:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":53}],85:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],86:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":37,"./_global":46,"./_library":58,"./_object-dp":61,"./_wks-ext":87}],87:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":88}],88:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":46,"./_shared":77,"./_uid":85}],89:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":35,"./_core":37,"./_iterators":57,"./_wks":88}],90:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":33,"./_core":37,"./core.get-iterator-method":89}],91:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":32,"./_iter-define":55,"./_iter-step":56,"./_iterators":57,"./_to-iobject":81}],92:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":44,"./_object-create":60}],93:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":40,"./_export":44,"./_object-dp":61}],94:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":67,"./_object-sap":71,"./_to-object":83}],95:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":44,"./_set-proto":74}],96:[function(require,module,exports){

},{}],97:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":55,"./_string-at":78}],98:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":33,"./_descriptors":40,"./_enum-keys":43,"./_export":44,"./_fails":45,"./_global":46,"./_has":47,"./_hide":48,"./_is-array":52,"./_is-object":53,"./_library":58,"./_meta":59,"./_object-create":60,"./_object-dp":61,"./_object-gopd":63,"./_object-gopn":65,"./_object-gopn-ext":64,"./_object-gops":66,"./_object-keys":69,"./_object-pie":70,"./_property-desc":72,"./_redefine":73,"./_set-to-string-tag":75,"./_shared":77,"./_to-iobject":81,"./_to-primitive":84,"./_uid":85,"./_wks":88,"./_wks-define":86,"./_wks-ext":87}],99:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":86}],100:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":86}],101:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":46,"./_hide":48,"./_iterators":57,"./_wks":88,"./es6.array.iterator":91}],102:[function(require,module,exports){
module.exports = compile;

var BaseFuncs = require("boolbase"),
    trueFunc  = BaseFuncs.trueFunc,
    falseFunc = BaseFuncs.falseFunc;

/*
	returns a function that checks if an elements index matches the given rule
	highly optimized to return the fastest solution
*/
function compile(parsed){
	var a = parsed[0],
	    b = parsed[1] - 1;

	//when b <= 0, a*n won't be possible for any matches when a < 0
	//besides, the specification says that no element is matched when a and b are 0
	if(b < 0 && a <= 0) return falseFunc;

	//when a is in the range -1..1, it matches any element (so only b is checked)
	if(a ===-1) return function(pos){ return pos <= b; };
	if(a === 0) return function(pos){ return pos === b; };
	//when b <= 0 and a === 1, they match any element
	if(a === 1) return b < 0 ? trueFunc : function(pos){ return pos >= b; };

	//when a > 0, modulo can be used to check if there is a match
	var bMod = b % a;
	if(bMod < 0) bMod += a;

	if(a > 1){
		return function(pos){
			return pos >= b && pos % a === bMod;
		};
	}

	a *= -1; //make `a` positive

	return function(pos){
		return pos <= b && pos % a === bMod;
	};
}
},{"boolbase":22}],103:[function(require,module,exports){
var parse = require("./parse.js"),
    compile = require("./compile.js");

module.exports = function nthCheck(formula){
	return compile(parse(formula));
};

module.exports.parse = parse;
module.exports.compile = compile;
},{"./compile.js":102,"./parse.js":104}],104:[function(require,module,exports){
module.exports = parse;

//following http://www.w3.org/TR/css3-selectors/#nth-child-pseudo

//[ ['-'|'+']? INTEGER? {N} [ S* ['-'|'+'] S* INTEGER ]?
var re_nthElement = /^([+\-]?\d*n)?\s*(?:([+\-]?)\s*(\d+))?$/;

/*
	parses a nth-check formula, returns an array of two numbers
*/
function parse(formula){
	formula = formula.trim().toLowerCase();

	if(formula === "even"){
		return [2, 0];
	} else if(formula === "odd"){
		return [2, 1];
	} else {
		var parsed = formula.match(re_nthElement);

		if(!parsed){
			throw new SyntaxError("n-th rule couldn't be parsed ('" + formula + "')");
		}

		var a;

		if(parsed[1]){
			a = parseInt(parsed[1], 10);
			if(isNaN(a)){
				if(parsed[1].charAt(0) === "-") a = -1;
				else a = 1;
			}
		} else a = 0;

		return [
			a,
			parsed[3] ? parseInt((parsed[2] || "") + parsed[3], 10) : 0
		];
	}
}

},{}],105:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":106}],106:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}]},{},[11])(11)
});