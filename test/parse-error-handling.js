const test = require('tape') ;
const Mark = require('./../mark.js');

test('Mark parse error handling ', function(assert) {
	assert.throws(function () { Mark.parse(null); }, /Unexpected end of data/, "Mark should throw error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse(''); }, /Unexpected end of data/, "Mark should throw error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse('  '); }, /Unexpected character EOF/, "Mark should throw error with empty source, following JSON.parse");
	
	assert.throws(function () { Mark.parse('{div'); }, /Unexpected end of data/, "Missing closing bracket");
	assert.throws(function() { Mark.parse('{div {width:1}}') }, "JSON object not allowed as Mark content");
	assert.throws(function() { Mark.parse('{div {"width":1}}') }, "JSON object not allowed as Mark content");
	
	assert.end();
});