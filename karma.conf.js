'use strict';
const tapSpec = require('tap-spec');

module.exports = function(karma) {
  karma.set({
    frameworks: ['tap','browserify'],
    files: [
		'test/*.js',
		{pattern: 'test/data/*.xml', included: false, served: true},
	],
	reporters: ['tap-pretty'],
    tapReporter: {prettify: tapSpec},
	
    preprocessors: {
      'test/*.js': ['browserify']
    },

    browsers: ['Chrome'], // 'Chrome', 'Edge', 'IE'
    browserConsoleLogOptions: {level: 'error', format: '%b %T: %m', terminal: false},	

    //logLevel: 'LOG_DEBUG',

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true
      // transform: [ 'brfs', 'browserify-shim' ]
    }
  });
};