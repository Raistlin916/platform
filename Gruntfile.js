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
        src: ['client/**', 'model/**', 'server/**', 'app.js', 'config.js', 'package.json']
      }
    },
    clean: ['client/partials', 'client/vendor/dist'],
    copy: {
      build: {
        files: [{
          expand: true,
          src: '*',
          dest: 'client/vendor/dist',
          cwd: 'client/vendor/src'
        }]
      }
    },
    cssmin: {
      minify: {
        options: {
          keepSpecialComments: 0
        },
        files: [{
          expand: true,
          src: '*.css',
          dest: 'client/vendor/dist',
          cwd: 'client/vendor/src'
        }]
      }
    },
    uglify: {
      build: {
        files: [{
          expand: true,
          src: '*.js',
          dest: 'client/vendor/dist',
          cwd: 'client/vendor/src'
        }]
      }
    }
  });


  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.registerTask('default', ['clean', 'concat', 'sass', 'jade', 'copy', 'watch']);
  grunt.registerTask('package', ['clean', 'concat', 'sass', 'jade', 'uglify', 'cssmin', 'compress']);
};