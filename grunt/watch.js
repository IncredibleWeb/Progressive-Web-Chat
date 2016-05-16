module.exports = {
    js: {
        files: ['<%= paths.js %>/**/*.js', '!<%= paths.build %>/**/*.js'],
        tasks: ['jshint', 'uglify:dev'],
        options: {
            spawn: false,
            livereload: true
        }
    },
    scss: {
        files: 'sass/**/*.scss',
        tasks: ['compass:dev'],
        options: {
            spawn: false,
            livereload: true
        },
    }
};
