const test = require('tape');
const Mark = require('./../mark.js');

function stringArrayBuffer(str) {
    var buffer = new ArrayBuffer(str.length);
    var bytes = new Uint8Array(buffer);
    str.split('').forEach(function(str, i) {
      bytes[i] = str.charCodeAt(0);
    });
    return buffer;
}

test('Stringify JSON object', function(assert) {
	assert.equal(Mark.stringify(Mark.parse(`{a:12.4, b:true, c:false, d:'str', e:null, g:1, h:[1,2,3], i:-12, j:[], k:{}, l:'', m:"", n:0, p:1e-2}`)), 
		`{a:12.4 b:true c:false d:"str" e:null g:1 h:[1 2 3] i:-12 j:[] k:{} l:"" m:"" n:0 p:0.01}`, "Stringify JSON object");
	assert.end() ;
});


test('Stringify Mark object', function(assert) {
	assert.equal(Mark.stringify(Mark.parse('{obj}')), '{obj}', "Stringify {obj}");
	assert.equal(Mark.stringify(Mark.parse('{div width:10}')), '{div width:10}', "Stringify {div width:10}");
	assert.equal(Mark.stringify(Mark.parse('{div "text"}')), '{div "text"}', 'Stringify {div "text"}');
	assert.equal(Mark.stringify(Mark.parse("{div 'text'}")), '{div "text"}', "Stringify {div 'text'}");
	assert.equal(Mark.stringify(Mark.parse('{div {br}}')), '{div {br}}', "Stringify {div {br}}");
	assert.equal(Mark.stringify(Mark.parse('{div width:null}')), '{div width:null}', "Stringify property with null value}");
	// undefined value handling
	var t = {obj:undefined};
	assert.equal(Mark.stringify(t), '{}', "Stringify undefined property");
	assert.equal(Mark.stringify([1, null, undefined]), '[1 null null]', "Stringify undefined value in array");
	// JSON inside Mark
	assert.equal(Mark.stringify(Mark.parse('{div {width:10}}')), '{div {width:10}}', "Stringify {div {width:10}}");
	// stringify with identation
	assert.equal(Mark.stringify(Mark.parse('{div width:10 (!--comment--) "test" {br}}'), {space:'  '}), '{div width:10 \n  (!--comment--) \n  "test" \n  {br}\n}', "Stringify with identation");
	// stringify omitting comma
	assert.equal(Mark.stringify(Mark.parse('{div width:10, height:"15px", margin:[5 10 10 5]}')), '{div width:10 height:"15px" margin:[5 10 10 5]}', "Stringify without comma");

	// stringify base64 data
	assert.equal(Mark.stringify(stringArrayBuffer('Hello')), '[#SGVsbG8=]', "Stringify binary data 'hello'");
	assert.equal(Mark.stringify(stringArrayBuffer('Hello worlds!')), '[#SGVsbG8gd29ybGRzIQ==]', "Stringify binary data 'Hello worlds!'");
	var doc = Mark('doc', {mime:'text/html', data:stringArrayBuffer("<h1>Mark binary!</h1>")});
	assert.equal(Mark.stringify(doc), '{doc mime:"text/html" data:[#PGgxPk1hcmsgYmluYXJ5ITwvaDE+]}', "Stringify nested binary data");
	
	// stringify base85 data
	var bin = stringArrayBuffer('hello');  bin.encoding = 'a85';
	assert.equal(Mark.stringify(bin), "[#~BOu!rDZ~]", "Stringify base85");
	assert.equal(Mark.stringify(Mark("[#~\n@p\ns7\ntD.3~]")), "[#~@ps7tD.3~]", "Stringify base85");
	assert.equal(Mark.stringify(Mark("[#~ @<5pm \rBfIs ~]")), "[#~@<5pmBfIs~]", "Parse base85 of 'ascii85'");	
	
	assert.end();
});