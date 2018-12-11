const test = require('tape');
const Mark = require('./../mark.js');

function allInKeys(obj) {
	var keys = [];  for (let p in obj) { if (typeof obj[p] !== 'function') keys.push(p); }  // console.log('all in keys', obj, keys);
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

test('Mark object model', function(assert) {
	// Mark constructor
	assert.equal(Mark('div').constructor.name, 'div', "div.constructor.name should be 'div'");
	assert.equal(Mark('div').constructor(), undefined, "div.constructor returns nothing"); // for test coverage
	assert.equal(Mark.stringify(Mark('div', {width:123})), '{div width:123}', "div with width");
	assert.equal(Mark.stringify(Mark('div', {width:123}, ['text', '', Mark('br')])), '{div width:123 "text" {br}}', "div with prop and contents");
	assert.equal(Mark.stringify(Mark('div', null, ['text', '', 123, Mark('br'), ['nested'], null])), '{div "text123" {br} "nested"}', "div with nested contents");
	assert.equal(Mark.stringify(Mark('div', null, [''])), '{div}', "div with empty text");
	assert.equal(Mark.stringify(Mark('div', null, ['text', 'merged', ''])), '{div "textmerged"}', "merging text nodes");
	assert.equal(Mark.stringify(Mark('div', null, 123)), '{div "123"}', "number as content");
	assert.equal(Mark.stringify(Mark('div', null, {p:123})), '{div {p:123}}', "JSON as content");
	
	// type name
	var div = Mark.parse('{div}');
	assert.equal(div.constructor.name, 'div', "div.constructor.name should be 'div'");
	assert.equal(div instanceof Mark, true, "div should be instance of Mark");

	// properties API
	assert.deepEqual(Object.keys(Mark.parse('{div}')), [], "Mark object {div} keys should be empty");
	div = Mark.parse('{div class:"test"}');
	assert.deepEqual(Object.keys(div), ['class'], "Mark object {div class:'test'} keys should be ['class']");
	div.length = '12px';
	assert.equal(div.length, '12px', "Mark length property set to 12px");
	assert.deepEqual(Object.keys(div), ['class','length'], "Mark object keys should be ['class','length']");
	
	// length prop and length API
	div = Mark.parse('{div length:12, width:20 "text"}');
	assert.equal(div.length, 12, "length property of Mark object should be 12");
	assert.equal(Mark.lengthOf(div), 1, "content length of Mark object should be 1");
	assert.equal(div.contents().length, 1, "length of Mark object contents should be 1");
	assert.looseEqual(Object.keys(div), ['length','width'], "Mark object keys() should be ['length', 'width']");
	
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
		
	// filter
	div = Mark.parse('{div "text" {br} "more" {b "bold"} (!-- comment --)}');
	assert.deepEqual(div.filter(n => typeof n === 'string'), ["text", "more"], "Mark filter API");
	// map
	assert.deepEqual(div.map(n => typeof n), ["string", "object", "string", "object", "object"], "Mark map API");
	// reduce
	assert.equal(div.reduce((result, n, i) => result + (i?', ':'') + (typeof n), 'type: '), "type: string, object, string, object, object", "Mark reduce API");
	// every
	assert.equal(div.every(n => typeof n != 'number'), true, "Mark every API");
	assert.equal(div.every(n => typeof n != 'object'), false, "Mark every API");
	// some
	assert.equal(div.some(n => n.constructor && n.constructor.name == 'b'), true, "Mark some API");
	assert.equal(div.some(n => n.constructor && n.constructor.name == 'div'), false, "Mark some API");
	// each
	let types = [];  div.each(n => types.push(typeof n));
	assert.deepEqual(types, ["string", "object", "string", "object", "object"], "Mark each API");
	types = [];  div.forEach(n => types.push(typeof n));
	assert.deepEqual(types, ["string", "object", "string", "object", "object"], "Mark forEach API");
	// includes
	assert.equal(div.includes("more"), true, "Mark includes API");
	assert.equal(div.includes("test"), false, "Mark includes API");
	// indexOf
	assert.equal(div.indexOf("more"), 2, "Mark indexOf API");
	// lastIndexOf
	assert.equal(div.lastIndexOf("more"), 2, "Mark lastIndexOf API");
	// slice
	let items = [div[1], "more"];
	assert.deepEqual(div.slice(1,3), items, "Mark slice API");
	
	// direct content assignment - not advisable
	var div = Mark.parse('{div "text"}');
	div[0] = Mark('br');
	assert.equal(Mark.stringify(div), '{div {br}}', "Set Mark content");
	assert.looseEqual(allInKeys(div), [], "Set Mark content");
	
	// set property
	div.set('width', '10px');
	assert.equal(div.width, '10px', "Set width to 10px");
	
	// replaceWith
	assert.equal(div.replaceWith(Mark.parse('<?xml version="1.0" encoding="UTF-8"?><div><p>text</p></div>', {format:'xml'})).xml(),
		'<?xml version="1.0" encoding="UTF-8"?><div><p>text</p></div>', "Mark replaceWith API");
		
	// push API
	assert.equal(Mark.parse('{div}').push("text").length, 1, "push text into Mark object");
	var div = Mark.parse('{div}');  
	assert.equal(div.length, 0, "length should be 0 before push");
	div.push(Mark.parse('{br}'));
	assert.equal(Mark.stringify(div), "{div {br}}", "push {br} into Mark object {div}");
	assert.equal(div.length, 1, "length should be 1 after push");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after push");
	div.push(Mark('p'), Mark('hr'));
	assert.equal(Mark.stringify(div), "{div {br} {p} {hr}}", "push {p} {hr} into Mark object {div}");
	div.push(); // empty push 
	assert.equal(Mark.stringify(div), "{div {br} {p} {hr}}", "push null into Mark object {div}");
	div.push([['text']]); // nested array
	assert.equal(Mark.stringify(div), '{div {br} {p} {hr} "text"}', "push nested array into Mark object {div}");
	assert.equal(div.length, 4, "div legnth should be 4");
	
	// pop API
	div = Mark.parse('{div "text" {br}}');  var item = div.pop();
	assert.equal(Mark.stringify(item), '{br}', "popped item from Mark object should be {br}");
	assert.equal(Mark.stringify(div), '{div "text"}', "pop from Mark object");
	assert.equal(div.length, 1, "length should be 1 after pop");
	assert.deepEqual(Object.keys(div), [], "length should not be enumerable after pop");
	div.pop();  item = div.pop();
	assert.equal(item, undefined, "undefiend after pop");
	
	// splice API
	div = Mark.parse('{div {br} {p}}');
	assert.equal(Mark.stringify(div.splice(0, 0, 'test')), '{div "test" {br} {p}}', "Mark insert text");
	assert.equal(Mark.stringify(div.splice(2, 0, 'child', Mark.parse('{hr}'))), '{div "test" {br} "child" {hr} {p}}', "Mark insert items");
	assert.equal(Mark.stringify(div.splice(0, 0, 'merge', '-')), '{div "merge-test" {br} "child" {hr} {p}}', "Mark merge inserted items");
	assert.equal(Mark.stringify(div.splice(1, 1)), '{div "merge-testchild" {hr} {p}}', "Mark merge inserted items");
	
	div = Mark.parse('{div "text" {br} {p}}');  div.splice(1, 1);
	assert.equal(Mark.stringify(div), '{div "text" {p}}', "Mark remove item");
	assert.equal(div.length, 2, "div length after removing should be 2");
	
	// source API
	div = Mark.parse('{div width:10 "text"}');
	assert.equal(div.source(), '{div width:10 "text"}', "Mark source()");
	
	// text API
	div = Mark.parse('{div width:10 "text " {span "more"} (!--comment--)}');
	assert.equal(div.text(), "text more", "Mark text()");
	
	// JSON API
	// assert.equal(JSON.stringify(div.json()), '{"0":"div","1":"text ","2":{"0":"span","1":"more"},"3":{".":"!--comment--"},"width":10}', "Mark json()");
	
	// isName
	assert.equal(Mark.isName(123), false, "123 is not name");
	assert.equal(Mark.isName(':123'), false, "name should not start with :");
	assert.equal(Mark.isName('name:name'), false, "name should not contain :");
	assert.equal(Mark.isName('$name_-.'), true, "$name_-. is valid name");
	
	assert.end();
});

test('Mark pragma model', function(assert) {
	var pragma = Mark.pragma("test");
	assert.equal(typeof pragma, 'object', "typeof pragma is 'object'");
	assert.equal(pragma.pragma(), 'test', "get pragma content");
	assert.equal(pragma.parent(), undefined, "get pragma parent");
	assert.equal(pragma.valueOf() === pragma, true, "valueOf pragma should return itself");
	assert.equal(pragma.toString(), "[object Pragma]", "pragma toString() should return [object Pragma]");
	
	pragma.set("new value");
	assert.equal(pragma.pragma(), "new value", "pragma set content");
	assert.end();
});