const CSSselect = require("./css-select/index.js");

function isTag(node) { return typeof node === 'object' && node.constructor; } // node.constructor.name !== 'Object' // JSON is included

function getParent(node) { return node.parent(); }

function getChildren(node) {
	return node[0] ? node.contents():[];
}

// DOM adaptor for mark object hierarchy 
const adapter = {
	// is the node a tag?
	// isTag: (node:Node) => isTag:Boolean
	isTag: isTag,

	// does at least one of passed element nodes pass the test predicate?
	// existsOne: (test:Predicate, elems:[ElementNode]) => existsOne:Boolean
	existsOne: function(test, elems) {
		return elems.some(function(elem){
			return isTag(elem) ?
				test(elem) || adapter.existsOne(test, getChildren(elem)) :
				false;
		});
	},
	// get the attribute value
	// getAttributeValue: ( elem:ElementNode, name:String ) => value:String
	getAttributeValue: function(elem, name) { return elem[name]; },

	// get the node's children
	// getChildren: (node:Node) => children:[Node]
	getChildren: getChildren,

	// get the name of the tag
	// getName: (elem:ElementNode) => tagName:String,
	getName: function(elem) { return elem.constructor.name; },

	// get the parent of the node
	// getParent: (node:Node) => parentNode:Node,
	getParent: getParent,

	// get the siblings of the node. Note that unlike jQuery's `siblings` method, this is expected to include the current node as well
	// getSiblings: (node:Node) => siblings:[Node],
	getSiblings: function(node) {
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
	hasAttrib: function(elem, name) { return name in elem; },

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
		for (var elem of elems) {
			if (!isTag(elem)) continue;
			if (test(elem)) result.push(elem);
			var childs = getChildren(elem);
			if (childs) result = result.concat(findAll(test, childs));
		}
		return result;
	},	
	
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
}

module.exports = function(elmt) {
	return {
		find: function(query, options) {
			// matches on children of elmt, not elmt itself
			try {
				return CSSselect(query, elmt, {xmlMode:(options && options.caseSensitive), adapter:adapter});
			} 
			catch (error) {
				console.error(error);
				return [];
			}
		},
		matches: function(query, options) {
			// tests whether or not an element is matched by query
			try {
				return CSSselect.is(elmt, query, {xmlMode:(options && options.caseSensitive), adapter:adapter});
			} 
			catch (error) {
				console.error(error);
				return false;
			}			
		}
	};
};