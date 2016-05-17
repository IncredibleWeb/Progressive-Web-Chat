module.exports = {
    options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
    },
    all: [
        '<%= paths.js %>/**/*.js',
        '!<%= paths.vendor %>/*.js',
        '!<%= paths.build %>/*.js'
    ]
};