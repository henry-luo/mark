const test = require('tape');
const Mark = require('./../mark.js');

function allInKeys(obj) {
	var keys = [];  for (let p in obj) { keys.push(p); }  // console.log('all in keys', obj, keys);
	return keys;
}
function allOfItems(obj) {
	var keys = [];  for (let p of obj) { keys.push(p); }  // console.log('all of items', obj, keys);
	return keys;
}

// taps deepEqual uses for..in, which does not work for Mark contents
function arrayEqual(array1, array2) {
	return (array1.length == array2.length) && array1.every(function(element, index) {
		return element === array2[index]; 
	});
}

test('Mark Model', function(assert) {
	// Mark constructor
	assert.equal(Mark('div').constructor.name, 'div', "div.constructor.name should be 'div'");
	assert.equal(Mark('div').constructor(), undefined, "div.constructor returns nothing"); // for test coverage
	assert.equal(Mark.stringify(Mark('div', {width:123})), '{div width:123}', "div with width");
	assert.equal(Mark.stringify(Mark('div', {width:123}, ['text', '', Mark('br')])), '{div width:123 "text" {br}}', "div with prop and contents");
	assert.equal(Mark.stringify(Mark('div', null, ['text', '', 123, Mark('br'), ['nested'], null])), '{div "text123" {br} "nested"}', "div with nested contents");
	assert.equal(Mark.stringify(Mark('div', null, [''])), '{div}', "div with empty text");
	
	// type name
	var div = Mark.parse('{div}');
	assert.equal(div.constructor.name, 'div', "div.constructor.name should be 'div'");
	assert.equal(div instanceof Mark, true, "div should be instance of Mark");

	// properties API
	assert.deepEqual(Object.keys(Mark.parse('{div}')), [], "Mark object {div} keys should be empty");
	assert.deepEqual(Object.keys(Mark.parse('{div class:"test"}')), ['class'], "Mark object {div class:'test'} keys should be ['class']");
	
	// length and prop('length')
	div = Mark.parse('{div length:12, width:20 "text"}');
	assert.equal(div.length, 1, "length of Mark object should be 1");
	assert.equal(div.contents().length, 1, "length of Mark object contents should be 1");
	assert.equal(div.prop('length'), 12, "length property of Mark object should be 12");
	assert.looseEqual(Object.keys(div), ['width'], "Mark object keys() should be ['width']");
	
	// contents API
	div = Mark.parse('{div class:"test" "text"}');
	assert.deepEqual(Object.keys(div), ['class'], "Mark object {div class:'test' 'text'} keys should be ['class']");
	assert.equal(div.contents()[0], "text", "Mark object div contents should be ['text']");
	assert.equal(div.contents().length, 1, "Mark object div contents length should be 1");
	assert.looseEqual(Object.getOwnPropertyNames(div.contents()), ["0", "length"], "Mark object div contents properties should be ['0', 'length']");
	div.push(Mark('br'));
	var contents = [];  for (let n of div) { contents.push(n); }  // test for-of loop
	assert.looseEqual(contents, ['text', Mark('br')], "Mark object div contents should be ['text', Mark('br')]");
	var div = Mark.parse('{div length:4 "text"}');
	contents = [];  for (let n of div) { contents.push(n); }  // test for-of loop with overridden length
	var div_contents = div.contents();
	assert.looseEqual(contents, ['text'], "Mark object div contents should be ['text']");
	assert.equal(div_contents.length == 1 && div_contents[0] == 'text', true, "Mark object div contents should be ['text']");
	assert.equal(div_contents instanceof Array, true, "Mark object div contents instanceof Array should be true");
	assert.equal(Array.isArray(div_contents), true, "Mark object div contents isArray() should be true");
	assert.equal(JSON.stringify(div_contents), '["text"]', "Mark object div contents should be ['text']");
	assert.equal(arrayEqual(div_contents, ["text"]), true, "Mark object div contents should be ['text']");
	
	// push API
	assert.equal(Mark.parse('{div}').push("text"), 1, "push text into Mark object");
	var div = Mark.parse('{div}');  
	assert.equal(div.length, 0, "length should be 0 before push");
	div.push(Mark.parse('{br}'));
	assert.equal(Mark.stringify(div), "{div {br}}", "push {br} into Mark object {div}");
	assert.equal(div.length, 1, "length should be 1 after push");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after push");
	div.push(Mark('p'), Mark('hr'));
	assert.equal(Mark.stringify(div), "{div {br} {p} {hr}}", "push {p} {hr} into Mark object {div}");
	div.push(); // empty push 
	assert.equal(Mark.stringify(div), "{div {br} {p} {hr}}", "push {p} {hr} into Mark object {div}");
	
	// pop API
	div = Mark.parse('{div "text" {br}}');  var item = div.pop();
	assert.equal(Mark.stringify(item), '{br}', "popped item from Mark object should be {br}");
	assert.equal(Mark.stringify(div), '{div "text"}', "pop from Mark object");
	assert.equal(div.length, 1, "length should be 1 after pop");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after pop");
	div.pop();  item = div.pop();
	assert.equal(item, undefined, "undefiend after pop");
	
	// remove API
	div = Mark.parse('{div "text" {br} {p}}');  var item = div.remove(1);
	assert.equal(Mark.stringify(div), '{div "text" {p}}', "Mark remove() test");
	assert.equal(div.length, 2, "div length after delete should be 2");
	assert.equal(Mark.stringify(item), "{br}", "item deleted should be {br}");
	assert.end();	
});

test('Mark shift() API', function(assert) {
	var div = Mark.parse('{div "text" {br}}');  var item = div.shift();
	assert.equal(item, 'text', "shift from Mark object");
	assert.equal(div.length, 1, "length should be 1 after shift");
	assert.equal(Mark.stringify(div), '{div {br}}', "shift from Mark object");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after shift");
	div.shift();  item = div.shift();
	assert.equal(item, undefined, "undefiend after shift");	
	assert.end();
});

test('Mark unshift() API', function(assert) {
	var div = Mark.parse('{div "text"}');  var len = div.unshift(Mark('br'), Mark('p'));
	assert.equal(len, 3, "length after unshift should be 3");
	assert.equal(Mark.stringify(div), '{div {br} {p} "text"}', "unshift to Mark object");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after unshift");
	div.unshift();  // unshift push 
	assert.equal(Mark.stringify(div), '{div {br} {p} "text"}', "unshift to Mark object");
	assert.end();	
});

test('Mark operation', function(assert) {
	var div = Mark.parse('{div "text"}');
	div[0] = Mark('br');
	assert.equal(Mark.stringify(div), '{div {br}}', "Set Mark content");
	assert.looseEqual(allInKeys(div), [], "Set Mark content");
	assert.end();	
});
