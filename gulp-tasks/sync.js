// JavaScript Document

// Scripts written by __gulp_init__author_name @ __gulp_init__author_company

module.exports = {
    // sync task, set up a browser_sync server, depends on config
    sync(plugins) {
        return plugins.browser_sync(global.settings.browsersync);
    }
};
