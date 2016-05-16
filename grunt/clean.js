module.exports = {
    default: {
        src: ['<%= paths.build %>/**/*.*', '<%= paths.css %>/**/*.*', '!<%= paths.css %>/fonts/**/*.*', '!<%= paths.css %>/**/richtext.css']
    }
};
