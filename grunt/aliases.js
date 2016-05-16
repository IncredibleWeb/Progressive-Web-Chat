module.exports = function (grunt) {
    grunt.registerTask('dev', ['clean', 'jshint', 'uglify:dev']);
    grunt.registerTask('dev_watch', ['jshint', 'uglify:dev', 'watch']);
	grunt.registerTask('prod', ['clean', 'uglify:prod']);
};