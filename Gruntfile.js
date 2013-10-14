module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      options: {
        debounceDelay: 250
      },
      css: {
        files: '**/*.scss',
        tasks: ['sass']
      },
      jade: {
        files: 'views/*.jade',
        tasks: ['jade'],
      },
    },
    sass: {                          
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'client/stylesheets/style.css': 'client/stylesheets/style.scss'
        }
      }
    },
    jade: {
        compile: {
            files: [ { 
              expand: true, 
              src: "*.jade", 
              dest: "client/partials",
              cwd: 'views',
              ext: '.html'
            }]
        }
    },
  });


  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');


  grunt.registerTask('default', ['sass', 'jade', 'watch']);

};