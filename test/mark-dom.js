const test = require('tape');
const Mark = require('./../mark.js');
const $parent = Symbol.for('Mark.parent');

test('Mark DOM', function(assert) {
	var div = Mark.parse("{div {span class:'bold'} {br} 'text' {!--pragma--} }");
	assert.equal(div[0].parent.constructor.name, 'div', "Parent of span should be div");
	assert.equal(div[1].parent.constructor.name, 'div', "Parent of br should be div");
	assert.equal(div[2].parent, undefined, "Parent of text node is undefined");
	assert.equal(div[3][$parent].constructor.name, 'div', "Parent of pragma should be div");
	assert.end();	
});
