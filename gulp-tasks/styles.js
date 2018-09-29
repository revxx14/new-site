// JavaScript Document

// Scripts written by __gulp_init__author_name @ __gulp_init__author_company

module.exports = {
    styles(gulp, plugins, ran_tasks, on_error) {
        // task-specific plugins
        const POSTCSS   = require("gulp-postcss");
        const SASS      = require("gulp-sass");
        const STYLELINT = require("gulp-stylelint");

        // styles task, compiles & prefixes SCSS
        return new Promise ((resolve) => {
            // set CSS directory
            const css_directory = plugins.argv.dist ? global.settings.paths.dist + "/assets/styles" : global.settings.paths.dev + "/assets/styles";

            // generate critical CSS if requested
            if (plugins.argv.experimental && plugins.argv.experimental.length > 0 && plugins.argv.experimental.includes("critical")) {
                const SITEMAP  = plugins.json.readFileSync("./package.json").templates;
                const CRITICAL = require("critical");
                const MKDIRP   = require("mkdirp");

                console.log("Genearting critical CSS, this may take up to " + ((Object.keys(SITEMAP).length * 30) / 60) + " minute" + (((Object.keys(SITEMAP).length * 30) / 60) !== 1 ? "s" : "") + ", go take a coffee break.");

                // create the "critical" directory
                MKDIRP(css_directory + "/critical");

                // loop through all the links
                for (const TEMPLATE in SITEMAP) {
                    // make sure the key isn't a prototype
                    if (SITEMAP.hasOwnProperty(TEMPLATE)) {
                        // generate the critial CSS
                        CRITICAL.generate({
                            base:       css_directory + "/critical",
                            dest:       TEMPLATE + ".css",
                            dimensions: [1920, 1080],
                            minify:     true,
                            src:        SITEMAP[TEMPLATE] + "?disable=critical_css"
                        });
                    }
                }
            }

            // process styles
            return gulp.src(global.settings.paths.src + "/assets/styles/*.scss")
                // prevent breaking on error
                .pipe(plugins.plumber({
                    errorHandler: on_error
                }))
                // check if source is newer than destination
                .pipe(plugins.newer({
                    extra: global.settings.paths.src + "/assets/styles/**/*.scss",
                    dest: css_directory,
                    map: (src) => {
                        const ALL_FILE_NAMES   = plugins.fs.existsSync(css_directory) ? plugins.fs.readdirSync(css_directory) : false;
                        const HASHED_FILE_NAME = ALL_FILE_NAMES ? ALL_FILE_NAMES.find((name) => {
                            return name.match(new RegExp(src.split(".")[0] + ".[a-z0-9]{8}.css"));
                        }) : src;

                        return HASHED_FILE_NAME;
                    },
                }))
                // lint
                .pipe(STYLELINT({
                    debug: true,
                    failAfterError: true,
                    reporters: [
                        {
                            console: true,
                            formatter: "string",
                        },
                    ],
                }))
                // initialize sourcemap
                .pipe(plugins.sourcemaps.init())
                // compile SCSS (compress if --dist is passed)
                .pipe(plugins.gulpif(plugins.argv.dist, SASS({
                    includePaths: "./node_modules",
                    outputStyle:  "compressed",
                }), SASS({
                    includePaths: "./node_modules",
                })))
                // process post CSS stuff
                .pipe(POSTCSS([
                    require("pixrem"),
                    require("postcss-clearfix"),
                    require("postcss-easing-gradients"),
                    require("postcss-inline-svg"),
                    require("postcss-flexibility"),
                    require("postcss-responsive-type"),
                ]))
                // generate a hash and add it to the file name
                .pipe(plugins.hash({
                    template: "<%= name %>.<%= hash %><%= ext %>",
                }))
                // write sourcemap (if --dist isn't passed)
                .pipe(plugins.gulpif(!plugins.argv.dist, plugins.sourcemaps.write()))
                // output styles to compiled directory
                .pipe(gulp.dest(css_directory))
                // notify that task is complete, if not part of default or watch
                .pipe(plugins.gulpif(gulp.seq.indexOf("styles") > gulp.seq.indexOf("default"), plugins.notify({
                    title:   "Success!",
                    message: "Styles task complete!",
                    onLast:  true,
                })))
                // push task to ran_tasks array
                .on("data", () => {
                    if (ran_tasks.indexOf("styles") < 0) {
                        ran_tasks.push("styles");
                    }
                })
                // generate a hash manfiest
                .pipe(plugins.hash.manifest("./.hashmanifest-styles", {
                    deleteOld: true,
                    sourceDir: css_directory,
                }))
                // output hash manifest in root
                .pipe(gulp.dest("."))
                // resolve the promise
                .on("end", () => {
                    return resolve();
                });
        });
    }
};
