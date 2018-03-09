const Mark = require('./../../mark.js');

var obj = Mark.parse(`{div {span 'Hello World!'}}`);
console.log("Greeting from Mark: " + Mark.stringify(obj, {space:'  ', format:'xml'}));