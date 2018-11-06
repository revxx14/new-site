// JavaScript Document

// Scripts written by __gulp_init_author_name__ @ __gulp_init_author_company__

const GULP    = require("gulp");
const PLUGINS = {
    // general stuff
    argv:       require("yargs").options({
        "d": {
            alias: "dist",
            type:  "boolean",
        },
        "e": {
            alias: "experimental",
            type:  "array",
        },
        "r": {
            alias: "rsync",
            type:  "boolean",
        },
        "s": {
            alias: "sync",
            type:  "boolean",
        },
        "u": {
            alias: "upload",
            type:  "boolean",
        },
    }).argv,
    fs:         require("fs"),
    gulpif:     require("gulp-if"),
    hash:       require("gulp-hash"),
    is_binary:  require("gulp-is-binary"),
    json:       require("jsonfile"),
    merge:      require("merge-stream"),
    newer:      require("gulp-newer"),
    notify:     require("gulp-notify"),
    path:       require("path"),
    plumber:    require("gulp-plumber"),
    prompt:     require("gulp-prompt"),
    sourcemaps: require("gulp-sourcemaps"),
    through:    require("through2"),
    watch:      require("gulp-watch"),
};

if (PLUGINS.argv.sync) {
    PLUGINS.browser_sync = require("browser-sync");
}

// store global environment paths
global.settings = {
    paths: {
        src:    "./src",
        dev:    "./dev",
        dist:   "./dist",
        vendor: "./vendor",
    }
};

// store which tasks where ran
const RAN_TASKS = [];

// error handling
const ON_ERROR = function (err) {
    PLUGINS.notify.onError({
        title:    "Gulp",
        subtitle: "Error!",
        message:  "<%= error.message %>",
        sound:    "Beep",
    })(err);

    this.emit("end");
};

// import custom modules
const STYLES_MODULE  = require("./gulp-tasks/styles");
const SCRIPTS_MODULE = require("./gulp-tasks/scripts");
const HTML_MODULE    = require("./gulp-tasks/html");
const MEDIA_MODULE   = require("./gulp-tasks/media");
const SYNC_MODULE    = require("./gulp-tasks/sync");
const UPLOAD_MODULE  = require("./gulp-tasks/upload");
const RSYNC_MODULE   = require("./gulp-tasks/rsync");
const CONFIG_MODULE  = require("./gulp-tasks/config");
const INIT_MODULE    = require("./gulp-tasks/init");

// primary tasks
GULP.task("styles", () => {
    return STYLES_MODULE.styles(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
});
GULP.task("scripts", () => {
    return SCRIPTS_MODULE.scripts(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
});
GULP.task("html", () => {
    return HTML_MODULE.html(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
});
GULP.task("php", () => {
    return HTML_MODULE.html(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
});
GULP.task("media", () => {
    return MEDIA_MODULE.media(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
});

// secondary tasks
GULP.task("upload", () => {
    return CONFIG_MODULE.config(GULP, PLUGINS, "ftp").then(() => {
        return UPLOAD_MODULE.upload(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
    });
});
GULP.task("rsync", () => {
    return CONFIG_MODULE.config(GULP, PLUGINS, "rsync").then(() => {
        return RSYNC_MODULE.rsync(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
    });
});

// configuration tasks
GULP.task("init", () => {
    return INIT_MODULE.init(GULP, PLUGINS, ON_ERROR);
});
GULP.task("config", () => {
    return CONFIG_MODULE.config(GULP, PLUGINS, (PLUGINS.argv.ftp || PLUGINS.argv.sftp ? "ftp" : (PLUGINS.argv.browsersync ? "browsersync" : "")));
});

// default task, runs through all primary tasks
GULP.task("default", ["styles", "scripts", "html", "media"], () => {
    // notify that task is complete
    GULP.src("gulpfile.js")
        .pipe(PLUGINS.gulpif(RAN_TASKS.length, PLUGINS.notify({title: "Success!", message: `${RAN_TASKS.length} task ${(RAN_TASKS.length > 1 ? "s" : "")} complete! [${RAN_TASKS.join(", ")}]`, onLast: true})));

    // handle optional tasks sequentially
    new Promise((resolve) => {
        // trigger upload task if --upload is passed
        if (PLUGINS.argv.upload) {
            return CONFIG_MODULE.config(GULP, PLUGINS, "ftp").then(() => {
                return UPLOAD_MODULE.upload(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
            }).then(() => {
                return resolve();
            });
        }

        // resole the promise automatically if upload wasn't requested
        return resolve();
    }).then(() => {
        // trigger rsync task if --rsync is passed
        return new Promise((resolve) => {
            if (PLUGINS.argv.rsync) {
                return CONFIG_MODULE.config(GULP, PLUGINS, "rsync").then(() => {
                    return RSYNC_MODULE.rsync(GULP, PLUGINS, RAN_TASKS, ON_ERROR);
                }).then(() => {
                    return resolve();
                });
            }

            // resole the promise automatically if rsync wasn't requested
            return resolve();
        });
    }).then(() => {
        // trigger sync task if --sync is passed
        return new Promise((resolve) => {
            if (PLUGINS.argv.sync) {
                PLUGINS.browser_sync.reload();
            }

            return resolve();
        });
    });

    // reset ran_tasks array
    RAN_TASKS.length = 0;

    // end the task
    return;
});

// watch task, runs through all primary tasks, triggers when a file is saved
GULP.task("watch", () => {
    // set up a browser_sync server, if --sync is passed
    if (PLUGINS.argv.sync) {
        CONFIG_MODULE.config(GULP, PLUGINS, "browsersync").then(() => {
            SYNC_MODULE.sync(PLUGINS);
        });
    }

    // watch for any changes
    PLUGINS.watch("./src/**/*", () => {
        // start the default task
        GULP.start("default");
    });

    // end the task
    return;
});
