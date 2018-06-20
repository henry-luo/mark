'use strict';
const tapSpec = require('tap-spec');

module.exports = function(karma) {
  karma.set({
    frameworks: ['tap','browserify'], //'tap',
    files: [
		'test/*.js',
		{pattern: 'test/data/*.xml', included: false, served: true},
	],
	exclude: [
		'test/parse-html-jsdom.js',
		'test/parse-xml-jsdom.js',
	],
	reporters: ['tap-pretty'],
    tapReporter: {prettify: tapSpec},
	
    preprocessors: {
		'test/*.js': ['browserify']
    },

    browsers: ['Edge', 'Chrome', 'Firefox'], // 'IE', 
    browserConsoleLogOptions: {level: 'error', format: '%b %T: %m', terminal: false},	

    //logLevel: 'LOG_DEBUG',

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
		// debug: true,
		transform:
			process.env.BROWSER == 'ie' ? [['babelify', {presets:['es2015'], plugins:['transform-runtime', "transform-remove-strict-mode"]}]]:[]
    }
  });
};