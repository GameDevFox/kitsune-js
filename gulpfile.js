require('source-map-support').install();

var gulp = require("gulp");
var gulpLoadPlugins = require("gulp-load-plugins");
var g = gulpLoadPlugins();

var del = require("del");
var jshintStylish = require("jshint-stylish");
var browserSync = require("browser-sync").create();

var appSrcPath = ["./src/kitsune/**/*.js", "./src/katana/*.js"];

var kitsuneTestPath = "./test/**/*.spec.js";
var katanaTestPath = "./src/katana/test/**/*.spec.js";
var testSrcPath = [kitsuneTestPath, katanaTestPath];

var testBuildPath = ["./build/test/katana/**/*.spec.js", "./build/test/kitsune/**/*.spec.js"];

gulp.task("default", g.sequence("clean", ["build", "build-test-kitsune", "build-test-katana"], "test-run"));

gulp.task("clean", function(done) {
	del(["./build", "./coverage"], done);
});

var buildStream = function(stream, debugTitle) {
	return stream
		.pipe(g.plumber())
		.pipe(g.debug({ title: debugTitle }))
		.pipe(g.jshint({ esnext: true }))
		.pipe(g.jshint.reporter(jshintStylish))
		.pipe(g.jshint.reporter("fail"))
		.pipe(g.babel({ sourceMaps: "inline", optional: ["runtime"] }))
};

gulp.task("build", function() {
	var input = gulp.src(appSrcPath, { base: "./src" })
			.pipe(g.cached("build"))
	return buildStream(input, "build")
		.pipe(gulp.dest("./build"));
});

gulp.task("build-test", g.sequence(["build-test-kitsune", "build-test-katana"]));
gulp.task("build-test-kitsune", function() {	
	var input = gulp.src(kitsuneTestPath)
		.pipe(g.cached("kitsune-src"))
	return buildStream(input, "kistune-test-build")
		.pipe(gulp.dest("./build/test/kitsune"));
});
gulp.task("build-test-katana", function() {
	var input = gulp.src(katanaTestPath)
		.pipe(g.cached("katana-src"))
	return buildStream(input, "katana-test-build")
		.pipe(gulp.dest("./build/test/katana"));
});

gulp.task("test", g.sequence(["build", "build-test-kitsune", "build-test-katana"], "test-run"));
gulp.task("test-run", function() {
	return gulp.src(testBuildPath)
		.pipe(g.cached("mocha"))
		.pipe(g.mocha())
		.on("error", function(e) {
			g.util.log(e.stack);
			this.emit("end");
		});
});

gulp.task("coverage", g.sequence("clean", ["build", "build-test-kitsune", "build-test-katana"], "coverage-run"));
gulp.task("coverage-run", function(done) {
	gulp.src(["./build/**/*.js", "!./build/test/**/*.spec.js"])
		.pipe(g.plumber())
		.pipe(g.istanbul({
			includeUntested: true
		}))
		.pipe(g.istanbul.hookRequire())
		.on("finish", function() {
			gulp.src(testBuildPath)
				.pipe(g.plumber())
				.pipe(g.mocha())
				.pipe(g.istanbul.writeReports())
				.on('error', function(e) {
					g.util.log(e.stack);
					this.emit("end");
				})
				.on("end", done);
		});
});

// gulp.task("prepend-source-map-support", ["build"], function() {
// 	return gulp.src("./app/kitsune.js")
// 		.pipe(insert.prepend("require('source-map-support').install();\n"))
// 		.pipe(gulp.dest("./app"));
// });

gulp.task("start", g.sequence("clean", ["build", "build-test-kitsune", "build-test-katana"], "test-run", "start-run"));
gulp.task("start-run", function() {
	var kitsune = require("kitsune");
	kitsune();
});

// Watch tasks
gulp.task("watch", g.sequence("clean", ["build", "build-test-kitsune", "build-test-katana"], "test-run", ["watch-src", "watch-test"]));

gulp.task("watch-src", function() {	gulp.watch(appSrcPath, ["watch-src-run"]); });
gulp.task("watch-src-run", function(cb) {
	delete g.cached.caches["mocha"];
	g.sequence("build", "test-run")(cb);
});

gulp.task("watch-test", function() { gulp.watch(testSrcPath, ["watch-test-run"]); });
gulp.task("watch-test-run", function(cb) {
	g.sequence(["build-test-kitsune", "build-test-katana"], "test-run")(cb);
});

//
gulp.task("watch-coverage", g.sequence("clean", ["build", "build-test-kitsune", "build-test-katana"], "coverage-run", ["watch-cover-src", "watch-cover-test", "browser-sync-cover"]));

gulp.task("watch-cover-src", function() {	gulp.watch(appSrcPath, ["watch-cover-src-run"]); });
gulp.task("watch-cover-src-run", function(cb) {
	g.sequence("build", "coverage-run", "browser-sync-reload")(cb);
});

gulp.task("watch-cover-test", function() { gulp.watch(testSrcPath, ["watch-cover-test-run"]); });
gulp.task("watch-cover-test-run", function(cb) {
	g.sequence(["build-test-kitsune", "build-test-katana"], "coverage-run", "browser-sync-reload")(cb);
});

gulp.task("browser-sync-cover", function() {
	browserSync.init({
		server: {
			baseDir: "./coverage/lcov-report"
		}
	});
});

gulp.task("browser-sync-reload", function() {
	browserSync.reload();
});
