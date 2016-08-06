require('source-map-support').install();

var spawn = require("child_process").spawn;

var gulpHelp = require("gulp-help");
var gulp = gulpHelp(require("gulp"), {
	hideEmpty: true
});

var gulpLoadPlugins = require("gulp-load-plugins");
var g = gulpLoadPlugins();

var del = require("del");
var jshintStylish = require("jshint-stylish");
var browserSync = require("browser-sync").create();

var appSrcPath = ["./src/kitsune/**/*.js", "./src/kitsune-core/*"];

var kitsuneTestPath = "./test/**/*.spec.js";
var testSrcPath = [kitsuneTestPath];

var testBuildPath = ["./build/test/kitsune/**/*.spec.js"];

var softTestFail = false;

gulp.task("default", 'runs "clean" and "build"', g.sequence("clean", ["build", "build-test-kitsune"], "test-run"));

gulp.task("clean", 'Cleans up (deletes) all build files', function(done) {
    del([
        "./node_modules/kitsune",
        "./node_modules/kitsune-core",
        "./build",
        "./coverage"
    ], done);
});

var buildStream = function(stream, debugTitle) {
	return stream
		.pipe(g.plumber())
		.pipe(g.debug({ title: debugTitle }))
		.pipe(g.jshint({ esnext: true }))
		.pipe(g.jshint.reporter(jshintStylish))
		.pipe(g.jshint.reporter("fail"))
		.pipe(g.babel({ presets: ["es2015"], sourceMaps: "inline" }));
};

gulp.task("build", "Builds project", function() {
	var input = gulp.src(appSrcPath, { base: "./src" })
		.pipe(g.cached("build"));
	return buildStream(input, "build")
		.pipe(gulp.dest("./node_modules"));
});

gulp.task("build-test", g.sequence(["build-test-kitsune"]));
gulp.task("build-test-kitsune", function() {
	var input = gulp.src(kitsuneTestPath)
		.pipe(g.cached("kitsune-src"));
	return buildStream(input, "kistune-test-build")
		.pipe(gulp.dest("./build/test/kitsune"));
});

var mochaOpts = {
	require: ["source-map-support"]
};

gulp.task("test", "Runs tests", g.sequence(["build", "build-test-kitsune"], "test-run"));
gulp.task("test-run", function() {
    var stream = gulp.src(testBuildPath)
	    .pipe(g.cached("mocha"))
	    .pipe(g.mocha(mochaOpts));

    if(softTestFail) {
	stream.on("error", function(e) {
	    g.util.log(e.stack);
	    this.emit("end");
	});
    }

    return stream;
});

gulp.task("coverage", "Creates coverage report", g.sequence("clean", ["build", "build-test-kitsune"], "coverage-run"));
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
				.pipe(g.mocha(mochaOpts))
				.pipe(g.istanbul.writeReports())
				.on('error', function(e) {
					g.util.log(e.stack);
					this.emit("end");
				})
				.on("end", done);
		});
});

// gulp.task("prepend-source-map-support", ["build"], function() {
//		return gulp.src("./app/kitsune.js")
//			.pipe(insert.prepend("require('source-map-support').install();\n"))
//			.pipe(gulp.dest("./app"));
// });

var proc;
gulp.task("start", "Runs an instance of kitsune", g.sequence("clean", ["build", "build-test-kitsune"], "test-run", "start-run"));
gulp.task("start-run", function() {

	if(proc != null)
		proc.kill();

	proc = spawn("node", ["node_modules/kitsune/service.js"]);
	proc.stdout.on("data", function(data) {
		process.stdout.write("service: " + data.toString());
	});
	proc.stderr.on("data", function(data) {
		process.stderr.write("service-error: " + data.toString());
	});

	console.log("Process ID: " + proc.pid);

	// var kitsune = require("kitsune");
	// kitsune();
});

// Watch tasks
gulp.task("watch", 'Runs app in "development mode", reloading app and running tests on files changes',
          g.sequence("watch-flag", "clean", ["build", "build-test-kitsune"], "test-run", "start-run", ["watch-src", "watch-test"]));

gulp.task("watch-flag", function() {
    softTestFail = true;
});

gulp.task("watch-src", function() { gulp.watch(appSrcPath, ["watch-src-run"]); });
gulp.task("watch-src-run", function(cb) {
	delete g.cached.caches["mocha"];
	g.sequence("build", "test-run", "start-run")(cb);
});

gulp.task("watch-test", function() { gulp.watch(testSrcPath, ["watch-test-run"]); });
gulp.task("watch-test-run", function(cb) {
	g.sequence(["build-test-kitsune"], "test-run", "start-run")(cb);
});

//
gulp.task("watch-coverage", "Create new coverage report everytime files change", g.sequence("clean", ["build", "build-test-kitsune"], "coverage-run", ["watch-cover-src", "watch-cover-test", "browser-sync-cover"]));

gulp.task("watch-cover-src", function() { gulp.watch(appSrcPath, ["watch-cover-src-run"]); });
gulp.task("watch-cover-src-run", function(cb) {
	g.sequence("build", "coverage-run", "browser-sync-reload")(cb);
});

gulp.task("watch-cover-test", function() { gulp.watch(testSrcPath, ["watch-cover-test-run"]); });
gulp.task("watch-cover-test-run", function(cb) {
	g.sequence(["build-test-kitsune"], "coverage-run", "browser-sync-reload")(cb);
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
