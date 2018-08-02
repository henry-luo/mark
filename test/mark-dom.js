const test = require('tape');
const Mark = require('./../mark.js');

test('Mark DOM', function(assert) {
	var div = Mark.parse("{div {span class:'bold'} {br} 'text' (!--pragma--) }");
	assert.equal(div[0].parent().constructor.name, 'div', "Parent of span should be div");
	assert.equal(div[1].parent().constructor.name, 'div', "Parent of br should be div");
	assert.equal(div[2].parent, undefined, "Parent of text node is undefined");
	assert.equal(div[3].parent().constructor.name, 'div', "Parent of pragma should be div");
	
	// test Mark object with 'parent' overridden
	div = Mark.parse("{div {span class:'bold', parent:'a property'}}");
	assert.equal(Mark.prototype.parent.call(div[0]).constructor.name, 'div', "parent() of span should be div");
	assert.equal(div[0].parent, 'a property', ".parent of span should be 'a property'");
	assert.end();	
});
