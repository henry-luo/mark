const test = require('tape');
const Mark = require('./../../mark.js');
const selector = require('./../mark.find.js');

test('Mark Select', function(assert) {
	let vtree = Mark.parse("{div {span class:'bold' 'text'} {br}}");
	assert.equal(selector(vtree).find("span.bold").length, 1, "Match span.bold");
	assert.equal(selector(vtree).find("span.bold").length, 1, "Match span.bold");
	assert.equal(selector(vtree).find("div > span.bold").length, 1, "Match span.bold");
	assert.end();
});