module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
       options: {
        separator: '\n;'
      },
      dist: {
        src: ['views/main.js', 'views/**/*.js'],
        dest: 'client/<%= pkg.name %>_app.js'
      }
    },
    sass: {                          
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          'client/style.css': 'views/main.scss'
        }
      }
    },
    jade: {
      compile: {
        options: {
          pretty: true
        },
        files: grunt.file.expandMapping(['**/*.jade'], 'client/partials/', {
            cwd: 'views',
            rename: function(destBase, destPath) {
              return destBase + destPath.split('/').pop();
            },
            ext: '.html'
        })
      }
    },
    watch: {
      options: {
        debounceDelay: 250
      },
      js: {
        files: 'views/**/*.js',
        tasks: ['concat']
      },
      css: {
        files: 'views/**/*.scss',
        tasks: ['sass']
      },
      jade: {
        files: 'views/**/*.jade',
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