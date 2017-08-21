const test = require('tape');
const Mark = require('./../mark.js');

test('Mark DOM', function(assert) {
	var div = Mark.parse("{div {span class:'bold'} {br} 'text' {!--comment--}}");
	assert.equal(div[0].parent.constructor.name, 'div', "Parent of span should be div");
	assert.equal(div[1].parent.constructor.name, 'div', "Parent of br should be div");
	assert.equal(div[2].parent, undefined, "Parent of text node is undefined");
	assert.equal(div[3].parent.constructor.name, 'div', "Parent of comment should be div");
	assert.end();	
});
