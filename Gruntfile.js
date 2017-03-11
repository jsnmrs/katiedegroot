module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      dist: {
        options: {
          curly: true, // always put curly braces around blocks in loops and conditionals
          eqeqeq: true, // use === and !== instead of == and != to avoid value coercion
          eqnull: true, // suppress warnings about == null comparisons
          browser: true, // defines globals exposed by modern browsers
          globals: {
            jQuery: true // defines globals exposed by jQuery
          }
        },
        files: {
          src: ['Gruntfile.js', 'js/lib/scripts.js']
        }
      }
    },

    concat: {
      dist: {
        src: ['js/vendor/jquery.js', 'js/vendor/jquery.fancybox.js', 'js/lib/scripts.js'],
        dest: 'js/scripts.js',
      },
    },

    uglify: {
      dist: {
        options : {
          mangle : true, // allow names to be changed, simplified
          compress : true // enable source compression
        },
        src: ['js/scripts.js'],
        dest: 'js/scripts.js'
      }
    },

    sass: {
      options: {
        sourceMapEmbed: true, // embed sourcemap directly in file
        style: 'nested' // nested output for readability
      },
      dist: {
        files: {
          // All SCSS is routed through _scss/style.scss
          'css/style.css': '_scss/style.scss'
        }
      }
    },

    postcss: {
      options: {
        map: {
          inline: true // maintain embedded sourcemap
        },
        processors: [
          require('autoprefixer')({browsers: ['last 2 versions']}), // autoprefixer setting
          require('cssnano')() // minify the result
        ]
      },
      dist: {
        // Overwrite compiled, nested CSS with autoprefixed, minified version
        src: 'css/*.css'
      }
    },

    imagemin: {
      dynamic: {
        options: {
          optimizationLevel: 5,
          progressive: true
        },
        files: [{
          expand: true,
          cwd: 'img/', // source directory
          src: ['**/*.{png,jpg,gif,svg}'],
          dest: 'img/' // output directory
        }]
      }
    },

    clean: {
      build: {
        src: ['_site/']
      }
    },

    shell: {
      jekyllBuild: {
        command: 'bundle exec jekyll build'
      },

      jekyllBuildDev: {
        command: 'bundle exec jekyll build'
      },

      htmlproofer: {
        command: 'htmlproofer ./_site --allow-hash-href --check-html --empty-alt-ignore'
      }
    },

    copy: {
      // Copy post-process CSS files into _site
      css: {
        files: [
          {expand: true, src: ['css/*'], dest: '_site/', filter: 'isFile'}
        ]
      },
      // Copy post-process JS files into _site
      js: {
        files: [
          {expand: true, src: ['js/*'], dest: '_site/', filter: 'isFile'}
        ]
      },
      // Copy optimized images files into _site
      img: {
        files: [
          {expand: true, src: ['img/*'], dest: '_site/', filter: 'isFile'}
        ]
      }
    },

    connect: {
      server: {
        options: {
          hostname: '127.0.0.1',
          port: 4000,
          base: '_site' // specify base path of server
        },
        // Enable in-browser live reload
        // Requires installing browser extension: http://livereload.com/extensions/
        livereload: {
          options: {
            open: {
              target: 'http://127.0.0.1:4000/'
            },
            base: ['_site']
          }
        }
      }
    },

    watch: {
      options: {
        // Enable in-browser live reload
        // Requires installing browser extension: http://livereload.com/extensions/
        livereload: {
          host: '127.0.0.1',
          port: 35729
        }
      },

      css: {
        files: '_scss/**/*.scss',
        tasks: ['css', 'copy:css']
      },

      js: {
        files: 'js/**/*.js',
        tasks: ['js', 'copy:js']
      },

      img: {
        files: 'img/**/*',
        tasks: ['imagemin', 'copy:img']
      },

      posts: {
        files:[
            '_config.yml',
            '*.html',
            '*.md',
            '_content/**',
            '_layouts/**',
            '_posts/**',
            '_drafts/**',
            '_includes/**',
            'assets/**/*.*'
        ],
        tasks: ['shell:jekyllBuildDev']
      }
    },

    htmllint: {
      all: {
        options: {
          ignore: [
            'Element “main” does not need a “role” attribute.',
            'Element “nav” does not need a “role” attribute.',
            'The “banner” role is unnecessary for element “header”.',
            'The “complementary” role is unnecessary for element “aside”.',
            'The “contentinfo” role is unnecessary for element “footer”.',
            'The “frameborder” attribute on the “iframe” element is obsolete. Use CSS instead.',
            'This document appears to be written in Italian but the “html” start tag has “lang="en"”. Consider using “lang="it"” (or variant) instead.',
            'This document appears to be written in Somali but the “html” start tag has “lang="en"”. Consider using “lang="so"” (or variant) instead.'
          ]
        },
        src: ["_site/**/*.html", ]
      }
    },

    accessibility: {
      options : {
        accessibilityLevel: 'WCAG2A',
        reportLevels: {
          notice: false, // don't display notices
          warning: true, // display warnings, still pass
          error: true // display errors
        },
        ignore: [
          'WCAG2A.Principle1.Guideline1_1.1_1_1.H67.2', // empty alt tag warning
          'WCAG2A.Principle1.Guideline1_3.1_3_1.H48', // navigation false positive warning
          'WCAG2A.Principle1.Guideline1_3.1_3_1.H42', // suspected heading
          'WCAG2A.Principle1.Guideline1_3.1_3_1.H39.3.NoCaption', // No table caption
          'WCAG2A.Principle1.Guideline1_3.1_3_1.H73.3.NoSummary' // No table summary
          ]
      },
      test : {
        src: ['_site/**/*.html']
      }
    },

    scsslint: {
      allFiles: [
        '_scss/**/*.scss',
      ],
      options: {
        bundleExec: true,
        config: '.scss-lint.yml',
        colorizeOutput: true,
        failOnWarning: false
      }
    },

    parker: {
      options: {},
      src: [
        '_site/css/style.css'
      ],
    },

    devUpdate: {
      main: {
        options: {
          updateType: 'prompt', // user prompt for update
          reportUpdated: false,
          semver: false,
          packages: {
            devDependencies: true,
            dependencies: false
          },
          packageJson: null
        }
      }
    }

  });

  //  --------------------------------------
  //  Grunt Tasks
  //  --------------------------------------

  // "grunt" - runs "serve" task
  grunt.registerTask('default', ['serve']);

  // "grunt css"
  // 1. Compiles SCSS
  // 2. Autoprefixes compiled CSS
  // 3. Minifies prefixed, compiled CSS
  grunt.registerTask('css', ['sass', 'postcss', 'scsslint']);

  // "grunt js"
  // 1. Lints JS files
  // 2. Concatenates JS files
  // 3. Uglifies JS files
  grunt.registerTask('js', ['jshint', 'concat', 'uglify']);

  // "grunt build"
  // 1. Cleans compiled directories
  // 2. Runs "grunt js" task
  // 3. Runs "grunt css" task
  // 4. Runs SCSS linter
  // 5. Runs image optimization
  // 6. Builds Jekyll site
  grunt.registerTask('build', ['clean', 'js', 'css', 'imagemin', 'shell:jekyllBuildDev']);

  // "grunt serve"
  // 1. runs "grunt build" task
  // 2. establishes local server
  // 3. watches for file changes
  grunt.registerTask('serve', ['build', 'connect', 'watch']);

  // "grunt travis"
  // Task for TravisCI to run for build validation
  // 1. runs "grunt build" task
  // 2. runs htmlproofer scan
  // 3. runs accessibility scan
  grunt.registerTask('travis', ['build', 'shell:htmlproofer', 'accessibility']);

  // "grunt lint"
  // 1. Runs JS lint
  // 2. Runs HTML validation (htmlproofer + htmllint)
  // 3. Runs accessibility scan
  // 4. Runs SCSS linter
  grunt.registerTask('lint', ['jshint', 'htmllint', 'shell:htmlproofer', 'accessibility', 'scsslint']);

  // "grunt css-report"
  // 1. Output CSS stats to console
  grunt.registerTask('css-report', ['parker']);

  // "grunt update"
  // 1. Updates grunt dependencies
  grunt.registerTask('update', ['devUpdate']);

};
