const test = require('tape');
const Mark = require('./../mark.js');
const selector = require('./../lib/mark.query.js');

test('Mark Select', function(assert) {
	let vtree = Mark.parse("{div {span class:'bold', width:'100px' 'text'} {br}}");
	assert.equal(selector(vtree).find("span.bold").length, 1, "Match span.bold");
	assert.equal(vtree.find("span.bold").length, 1, "Match span.bold");
	assert.equal(vtree.find("span[width='100px']").length, 1, "Match span[width='100px']");
	assert.equal(vtree.find("div > span.bold").length, 1, "Match div > span.bold");
	assert.equal(vtree.find("div").length, 0, "Find should not match on div itself");
	
	assert.equal(vtree.match("div"), true, "match() should match on div itself");
	assert.end();
});