module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
       options: {
        separator: '\n;'
      },
      dist: {
        src: ['views/javascripts/main.js', 'views/javascripts/*.js'],
        dest: 'client/javascripts/<%= pkg.name %>_app.js'
      }
    },
    sass: {                          
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'client/stylesheets/style.css': 'views/stylesheets/style.scss'
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
    watch: {
      options: {
        debounceDelay: 250
      },
      js: {
        files: 'views/javascripts/*.js',
        tasks: ['concat']
      },
      css: {
        files: 'views/stylesheets/*.scss',
        tasks: ['sass']
      },
      jade: {
        files: 'views/*.jade',
        tasks: ['jade'],
      },
    }
  });


  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-concat');


  grunt.registerTask('default', ['concat', 'sass', 'jade', 'watch']);

};