var gulp = require('gulp')
var shell = require('gulp-shell')
var downloadatomshell = require('gulp-download-atom-shell')

gulp.task('downloadatomshell', function(cb){
	downloadatomshell({
		version: '0.19.4',
		outputDir: 'binaries'
	}, cb);
});

var demo_cl;

switch (process.platform) {
	case 'win32':
		demo_cl = 'binaries\\atom.exe index.js';
		break;
	case 'darwin':
		demo_cl = 'binaries/Atom.app/Contents/MacOS/Atom index.js';
		break;
	default:
		demo_cl = 'binaries/atom index.js';
};

gulp.task('demo', shell.task([ demo_cl ]));