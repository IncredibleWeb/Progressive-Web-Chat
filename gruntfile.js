var vendorBundle = [
    "<%= paths.vendor %>/knockout-3.3.0.js",
    "<%= paths.vendor %>/utils.js",
    "<%= paths.vendor %>/lodash.js",
    "<%= paths.vendor %>/sammy.js",
    "<%= paths.vendor %>/jquery.incredible.srcset.js",
    "<%= paths.vendor %>/fastclick.js",
    "<%= paths.vendor %>/jquery.validate.min.js",
    "<%= paths.vendor %>/jquery.validate.unobtrusive.min.js",
    "<%= paths.vendor %>/response.js",
    "<%= paths.vendor %>/jquery.signalR-2.2.0.js",
];

module.exports = function(grunt) {
    global.vendorBundle = vendorBundle;
    require('load-grunt-config')(grunt, {
        data: {
            init: true,
            paths: {
                css: 'css',
                js: 'js',
                build: 'js/build',
                vendor: 'js/vendor'
            }
        }
    });
};
