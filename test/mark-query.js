const test = require('tape');
const Mark = require('./../mark.js');
const selector = require('./../lib/mark.query.js');

test('Mark Select', function(assert) {
	let vtree = Mark.parse("{div {span class:'bold', width:'100px' 'text' {b 'bold'}} {br}}");
	assert.equal(selector(vtree).find("span.bold").length, 1, "Match span.bold");
	assert.equal(vtree.find("span.bold").length, 1, "Match span.bold");
	assert.equal(vtree.find("span[width='100px']").length, 1, "Match span[width='100px']");
	assert.equal(vtree.find("div > span.bold").length, 1, "Match div > span.bold");
	assert.equal(vtree.find("div").length, 0, "Find should not match on div itself");
	assert.equal(vtree.find("[width]").length, 1, "Find [width] should have 1 match");
	
	assert.equal(vtree.matches("div"), true, "vtree should match div");
	assert.equal(vtree[0].matches("div span"), true, "span should match 'div span'");
	assert.equal(vtree[0].matches("div >> span"), true, "span should match 'div >> span'");
	assert.equal(vtree[0].matches("div > span"), true, "span should match 'div > span'");
	assert.equal(vtree[0][1].matches("div >> b"), true, "b should match 'div >> v'");
	assert.end();
});