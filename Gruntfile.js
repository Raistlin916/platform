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
    },
    compress: {
      main: {
        options: {
          archive: '<%= pkg.name %>.zip'
        },
        src: ['client/**', 'model/**', 'server/**', 'app.js', 'config.js']
      }
    }
  });


  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');


  grunt.registerTask('default', ['concat', 'sass', 'jade', 'watch']);
  grunt.registerTask('package', ['concat', 'sass', 'jade', 'compress']);
};