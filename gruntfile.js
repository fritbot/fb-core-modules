module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-push-release');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');

    grunt.initConfig({
        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            src : [ 'src/**/*.js', '*.js']
        },
        jscs : {
            src : ['src/**/*.js', '*.js']
        },
        bump : {
            npm : true
        }
    });

    grunt.registerTask('style', ['jshint', 'jscs']);
};
