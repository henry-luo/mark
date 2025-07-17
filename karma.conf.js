'use strict';
const tapSpec = require('tap-spec');

module.exports = function(karma) {
  // Determine browsers based on platform, using headless versions to avoid popups
  let browsers;
  if (process.platform === 'darwin') {
    // macOS - use headless Chrome to avoid Safari popups
    browsers = ['ChromeHeadless'];
  } else if (process.platform === 'win32') {
    // Windows
    browsers = ['ChromeHeadless'];
  } else {
    // Linux and others
    browsers = ['ChromeHeadless'];
  }

  karma.set({
    frameworks: ['jasmine', 'browserify'],
    files: [
		'test/mark-full-suite.js',
		{pattern: 'test/data/*.xml', included: false, served: true},
	],
	exclude: [],
	reporters: ['progress'],
    //tapReporter: {prettify: tapSpec},
	
    preprocessors: {
		'test/mark-full-suite.js': ['browserify']
    },

    browsers: browsers,
    
    // Reduce timeout for faster feedback
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 30000,
    captureTimeout: 10000,
    
    // Custom launcher configurations
    customLaunchers: {
      SafariNoPopup: {
        base: 'Safari',
        flags: ['--disable-web-security', '--allow-running-insecure-content']
      },
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-web-security']
      }
    }, 
    browserConsoleLogOptions: {level: 'error', format: '%b %T: %m', terminal: false},	

    //logLevel: 'LOG_DEBUG',

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
		debug: true,
		transform:
			process.env.BROWSER == 'ie' ? [['babelify', {presets:['es2015'], plugins:['transform-runtime', "transform-remove-strict-mode"]}]]:[]
    }
  });
};