const test = require('tape');
const Mark = require('./../mark.js');

test('Mark DOM', function(assert) {
	var div = Mark.parse("<div <span class:'bold'> <br>; 'text'; {a:1}>");
	assert.equal(div[0].parent().constructor.name, 'div', "Parent of span should be div");
	assert.equal(div[1].parent().constructor.name, 'div', "Parent of br should be div");
	assert.equal(div[2].parent, undefined, "Parent of text node is undefined");
	assert.equal(Mark.parent(div[3]).constructor.name, 'div', "Parent of nested map should be div");

	// test Mark object with 'parent' overridden
	div = Mark.parse("<div <span class:'bold', parent:\"a property\">>");
	assert.equal(Mark.parent(div[0]).constructor.name, 'div', "parent() of span should be div");
	assert.equal(div[0].parent, 'a property', ".parent of span should be 'a property'");
	assert.end();	
});
