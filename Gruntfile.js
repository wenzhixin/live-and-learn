var fs = require('fs');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        release: {
            options: {
                additionalFiles: ['live-and-learn.jquery.json'],
                afterBump: ['docs']
            }
        }
    });

    // A very basic default task.
    grunt.registerTask('docs', 'build the docs', function() {
        var version = require('./package.json').version;
        console.log('docs');
    });

    grunt.loadNpmTasks('grunt-release');

    // Default task(s).
    grunt.registerTask('default', []);

};
