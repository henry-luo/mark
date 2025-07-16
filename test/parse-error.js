const test = require('tape') ;
const Mark = require('../mark.js');

test('Mark parse error handling ', function(assert) {
	assert.throws(function () { Mark(); }, /Type name should be a string/, "Mark construction needs type name");
	
	assert.equal(Mark.parse(null), null, "Mark returns null for empty source; not following JSON.parse");
	assert.equal(Mark.parse(''), null, "Mark returns null for empty source; not following JSON.parse");
	assert.equal(Mark.parse('  '), null, "Mark returns null for empty source; not following JSON.parse");
	
	assert.throws(() => Mark.parse('<div'), /SyntaxError/, "Missing closing bracket");
	assert.throws(() => Mark.parse('<div "text"'), /SyntaxError/, "Missing closing bracket");
	assert.throws(() => Mark.parse('inf!'), /SyntaxError/, "Unexpected character");
	assert.throws(() => Mark.parse('<div "123":123>'), /Numeric key not allowed as Mark property name/, "Number not allowed as key");

	assert.throws(() => Mark.parse('[1,,2]'), /SyntaxError/, "Missing array element");
	assert.throws(() => Mark.parse('<div prop:trueprop2:123>'), /SyntaxError/, "Keyword support");

	// property key must be unique
	assert.throws(() => Mark.parse('{a:1, a:2}'), /Duplicate key not allowed: a/, "Property key in map must be unique");
	assert.throws(() => Mark.parse('<obj a:1, a:2>'), /Duplicate key not allowed: a/, "Property key in element must be unique");

	// Mark constructor
	assert.throws(() => Mark(123), /Invalid element name/, "Type name should be a string");

	try {
		Mark.parse('<obj \n p:true 123>');
	} catch (e) {
		console.log(e.message);
		assert.equal(e.message.lastIndexOf("Unexpected character") === 0, true, "Error message");
		assert.equal(e.lineNumber, 2, "Error line number");
		assert.equal(e.columnNumber, 9, "Error column number");
	}
	
	// Mark binary
	assert.ok(Mark.parse("b'\\64 abc'"), "Padding is optional for base64");
	assert.throws(() => Mark.parse("b'\\64 abc-'"), /Invalid base64 character/, "Based64 character error");
	assert.throws(() => Mark.parse("b'\\64 abcd='"), /Invalid base64 stream length/, "Based64 length error");
	assert.throws(() => Mark.parse("b'\\64 abcde'"), /Invalid base64 stream length/, "Based64 length error");

	assert.end();
});