var gulp = require('gulp')
var shell = require('gulp-shell')
var downloadatomshell = require('gulp-download-atom-shell')
var atom  = require('gulp-atom');

gulp.task('downloadatomshell', function(cb){
	downloadatomshell({
		version: '0.19.4',
		outputDir: 'binaries'
	}, cb);
});

var demo_cl;

switch (process.platform) {
	case 'win32':
		demo_cl = 'binaries\\atom.exe src\\index.js';
		break;
	case 'darwin':
		demo_cl = 'binaries/Atom.app/Contents/MacOS/Atom src/index.js';
		break;
	default:
		demo_cl = 'binaries/atom src/index.js';
};

gulp.task('run', shell.task([ demo_cl ]));

// Build project
gulp.task('package', function() {
  return atom({
      srcPath: './src',
      releasePath: './release',
      cachePath: './cache',
      version: 'v0.19.4',
      rebuild: false,
      platforms: ['darwin-x64', 'linux-ia32', 'linux-x64', 'win32-ia32']
  });
})