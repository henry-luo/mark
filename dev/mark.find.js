const debug = function() {}; // require('debug')('mark:find');

var selector = require("cssauron")({
	tag: function(node) { return node.constructor.name; },
	children: function(node) { return node.contents(); },
	parent: function(node) { return node.parent(); },
	contents: function(node) { return (typeof node === 'string') ? node:null; },
	attr: function(node, attr) { return node[attr]; },
	class: 'class',
	id: 'id'
	}, 
	// matchComparison, default is caseSensitiveComparison
	function(type, pattern, data) {
		if (type == 'tag') { // case-insensitive match on tag name
			return pattern && pattern.toLowerCase() == data.toLowerCase();
		} else {
			return pattern === data;
		}
	}
);

function traverse(vtree, fn) {
	debug('traverse', vtree);
	fn(vtree);
	if (vtree.length) {
		for (let node of vtree) {
			// selector only matches element, not text node
			if (typeof node === 'object') {
				traverse(node, fn);
			}
		}
	}
}

module.exports = function(vtree) {
	var select = {};
	select.find = function(sel) {
		var match = selector(sel);
		var matched = [];  debug('match', vtree);
		// traverse each node in the tree and see if it matches our selector
		traverse(vtree, function(node) {
			var result = match(node);
			if (result) {
				if (!Array.isArray(result)) { matched.push(result); }
				else { matched.push.apply(matched, result); }
			}
		});
		return matched;
	}
	return select;
};