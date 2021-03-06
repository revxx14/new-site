// JavaScript Document

// Scripts written by __gulp_init_author_name__ @ __gulp_init_author_company__

module.exports = {
    init(gulp, plugins, on_error) {
        const REPLACE = require("gulp-replace");
        const MOMENT  = require("moment");
        const SPDX    = require("spdx-license-list/full");

        let project_data = {};

        const GET_PROJECT_DEFAULTS = () => {
            return new Promise((resolve) => {
                if (plugins.fs.existsSync(".config/.init")) {
                    project_data = plugins.json.readFileSync(".config/.init");
                }

                resolve();
            });
        };

        // gather project data
        const GET_PROJECT_DATA = () => {
            return new Promise((resolve) => {
                return gulp.src("gulpfile.js")
                    // prevent breaking on error
                    .pipe(plugins.plumber({ errorHandler: on_error }))
                    // prompt for project data if defaults are not set
                    .pipe(plugins.gulpif(Object.getOwnPropertyNames(project_data).length === 0, plugins.prompt.prompt([
                        {
                            name:     "full_name",
                            message:  "Project Name:",
                            type:     "input",
                            validate: (response) => {
                                if (response.trim().length > 0 && response.match(/\w/)) {
                                    return true;
                                } else {
                                    return "Please enter a full name.";
                                }
                            },
                        },
                        {
                            name:     "short_name",
                            message:  "Project Short Name:",
                            type:     "input",
                            validate: (response) => {
                                if (response.trim().length > 0 && response.match(/\w/)) {
                                    return true;
                                } else {
                                    return "Please enter a short name.";
                                }
                            },
                        },
                        {
                            name:     "version",
                            message:  "Project Version:",
                            type:     "input",
                            default:  "0.1.0",
                            validate: (response) => {
                                if (response.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/)) {
                                    return true;
                                } else {
                                    return "Please enter a valid version number (semver).";
                                }
                            },
                        },
                        {
                            name:     "description",
                            message:  "Project Description:",
                            type:     "input",
                            validate: (response) => {
                                if (response.trim().length > 0 && response.match(/\w/)) {
                                    return true;
                                } else {
                                    return "Please enter a description.";
                                }
                            },
                        },
                        {
                            name:     "homepage",
                            message:  "Project URL:",
                            type:     "input",
                            validate: (response) => {
                                if (response.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/)) {
                                    return true;
                                } else {
                                    return "Please enter a valid URL.";
                                }
                            },
                        },
                        {
                            name:     "repository",
                            message:  "Project Repository:",
                            type:     "input",
                            validate: (response) => {
                                if (response.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/)) {
                                    return true;
                                } else {
                                    return "Please enter a valid URL.";
                                }
                            },
                        },
                        {
                            name:     "ci_badge",
                            message:  "CI Badge:",
                            type:     "input",
                            default:  "[![pipeline status](${repository}/badges/master/pipeline.svg)](${repository}/commits/master)",
                        },
                        {
                            name:     "license",
                            message:  "License:",
                            type:     "text",
                            validate: (response) => {
                                if (response in SPDX) {
                                    return true;
                                } else if (response === "" || response === "UNLICENSED") {
                                    return true;
                                } else {
                                    return "Please enter a valid SPDX license, or UNLICENSED for no license.";
                                }
                            }
                        },
                        {
                            name:    "author_name",
                            message: "Author Name:",
                            type:    "input",
                            validate: (response) => {
                                if (response.trim().length > 0 && response.match(/\w/)) {
                                    return true;
                                } else {
                                    return "Please enter a name.";
                                }
                            },
                        },
                        {
                            name:     "author_email",
                            message:  "Author Email:",
                            type:     "input",
                            validate: (response) => {
                                if (response.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                                    return true;
                                } else {
                                    return "Please enter a valid email address.";
                                }
                            }
                        },
                        {
                            name:     "author_company",
                            message:  "Author Company:",
                            type:     "input",
                            validate: (response) => {
                                if (response.trim().length > 0 && response.match(/\w/)) {
                                    return true;
                                } else {
                                    return "Please enter a company.";
                                }
                            },
                        },
                        {
                            name:     "author_url",
                            message:  "Author URL:",
                            type:     "input",
                            validate: (response) => {
                                if (response.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/)) {
                                    return true;
                                } else {
                                    return "Please enter a valid URL.";
                                }
                            },
                        },
                        {
                            name:     "theme_color",
                            message:  "Theme Color:",
                            type:     "input",
                            default:  "#448AFF",
                            validate: (response) => {
                                if (response.match(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/)) {
                                    return true;
                                } else {
                                    return "Please enter a valid hex color.";
                                }
                            },
                        },
                    ], (res) => {
                        // store the project data
                        project_data = res;
                    })))
                    // consume the stream the stream
                    .on("data", () => {
                        // do nothing
                    })
                    // resolve the promise
                    .on("end", () => {
                        resolve();
                    });
            });
        };

        // write project data
        const WRITE_PROJECT_DATA = () => {
            return new Promise((resolve, reject) => {
                return gulp.src(["*", ".*", "gulp-tasks/*", "src/**/*"], { base: "./" })
                    // prevent breaking on error
                    .pipe(plugins.plumber({ errorHandler: on_error }))
                    // check if a file is a binary
                    .pipe(plugins.is_binary())
                    // skip file if it's a binary
                    .pipe(plugins.through.obj((file, enc, next) => {
                        if (file.isBinary()) {
                            next();
                            return;
                        }

                        // go to next file
                        next(null, file);
                    }))
                    // replace variables
                    .pipe(REPLACE(/__gulp_init_[a-z0-9_]+?__/g, (match) =>{
                        const KEYWORD = match.match(/__gulp_init_([a-z0-9_]+?)__/)[1];

                        const REPLACEMENTS = {
                            full_name:      project_data.full_name,
                            short_name:     project_data.short_name,
                            npm_name:       project_data.full_name.toLowerCase().replace(/[^A-Za-z ]/, "").replace(/ /g, "-"),
                            namespace:      project_data.short_name.toLowerCase().replace(/[^A-Za-z ]/, "").replace(/ /g, "_"),
                            version:        project_data.version,
                            description:    project_data.description,
                            homepage_url:   project_data.homepage,
                            repository:     project_data.repository.replace(/(\.git$)|(\/$)/, ""),
                            license:        project_data.license,
                            author_name:    project_data.author_name,
                            author_email:   project_data.author_email,
                            author_company: project_data.author_company,
                            author_url:     project_data.author_url,
                            theme_color:    project_data.theme_color,
                            creation_date:  MOMENT().format("Y-MM-DD HH:mmZ"),
                        };

                        if (KEYWORD in REPLACEMENTS) {
                            return REPLACEMENTS[KEYWORD];
                        } else {
                            console.log(`Error! ${KEYWORD} not found in provided project data!`);
                            reject();
                        }
                    }))
                    // write the file
                    .pipe(gulp.dest("./"))
                    // resolve the promise
                    .on("end", () => {
                        resolve();
                    });
            });
        };

        // write the README
        const WRITE_README = () => {
            return new Promise((resolve, reject) => {
                const CI_BADGE = project_data.ci_badge && project_data.ci_badge != false ? `${project_data.ci_badge.replace(/\${repository}/g, project_data.repository)}\n\n` : "";

                plugins.fs.writeFile("./README.md", `# ${project_data.full_name}\n\n${CI_BADGE}${project_data.description}\n`, (err) => {
                    if (!err) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        };

        // write the LICENSE
        const WRITE_LICENSE = () => {
            return new Promise((resolve, reject) => {
                let license = {
                    name:        "UNLICESNED",
                    url:         "",
                    osiApproved: false,
                    licenseText: `Copyright (c) ${MOMENT().format("Y")} ${project_data.full_name} <${project_data.homepage}>\n\n${project_data.full_name} retains all rights to this website and does not permit distribution, reproduction, or derivative works.\n`,
                };

                if (project_data.license && project_data.license !== "UNLICENSED") {
                    license = SPDX[project_data.license];
                }

                plugins.fs.writeFile("./LICENSE.md", `${license.licenseText}\n`, (err) => {
                    if (!err) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        };

        return new Promise ((resolve) => {
            GET_PROJECT_DEFAULTS().then(() => {
                return GET_PROJECT_DATA();
            }).then(() => {
                return WRITE_PROJECT_DATA();
            }).then(() => {
                return WRITE_README();
            }).then(() => {
                return WRITE_LICENSE();
            }).then(() => {
                resolve();
            });
        });
    }
};
