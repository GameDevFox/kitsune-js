let gulpHelp = require("gulp-help");
let gulp = gulpHelp(require("gulp"));

let gulpLoadPlugins = require("gulp-load-plugins");
let g = gulpLoadPlugins();

let jshintStylish = require("jshint-stylish");

let appSrcPath = "./src/**/*.js";
let testSrcPath = "./test/**/*.spec.js";

gulp.task("default", 'runs "test"', ["test"]);

let lintStream = function(stream) {
	return stream
		.pipe(g.jshint({ esnext: true }))
		.pipe(g.jshint.reporter(jshintStylish))
		.pipe(g.jshint.reporter("fail"));
};

gulp.task("lint", "Builds project", function() {
	let input = gulp.src(appSrcPath);
	return lintStream(input);
});

gulp.task("lint-test", function() {
	let input = gulp.src(testSrcPath);
	return lintStream(input);
});

gulp.task("test", function() {
    let stream = gulp.src(testSrcPath)
	    .pipe(g.mocha());
    return stream;
});

// Watch tasks
gulp.task("watch", 'Runs app in "development mode", reloading app and running tests on files changes', ["watch-src", "watch-test"]);

gulp.task("watch-src", function() {
	gulp.watch(appSrcPath, () => gulp.start("lint"));
});
gulp.task("watch-test", function() {
	gulp.watch(testSrcPath, () => gulp.start("test"));
});
