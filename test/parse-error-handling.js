const test = require('tape') ;
const Mark = require('./../mark.js');

test('Mark parse error handling ', function(assert) {
	// Mark parser
	assert.throws(function () { Mark.parse(null); }, /Unexpected end of input/, "Mark should throw error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse(''); }, /Unexpected end of input/, "Mark should throw error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse('  '); }, /Unexpected character EOF/, "Mark should throw error with empty source, following JSON.parse");
	
	assert.throws(function () { Mark.parse('{div'); }, /Unexpected end of input/, "Missing closing bracket");
	assert.throws(function () { Mark.parse('{div "text"'); }, /Unexpected end of input/, "Missing closing bracket");
	assert.throws(function () { Mark.parse('Infinte'); }, /Expected 'i' instead of 't'/, "Unexpected word for number");
	// assert.throws(function () { Mark.parse('{div "123":123}'); }, /Numeric key not allowed as Mark property name/, "Number not allowed as key");
	
	assert.throws(function () { Mark.parse('[1,,2]'); }, /Missing array element/, "Missing array element");
	
	// Mark constructor
	assert.throws(function () { Mark(123); }, /Type name should be a string/, "Type name should be a string");
	assert.end();
});