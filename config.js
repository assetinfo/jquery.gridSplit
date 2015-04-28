require.config({
  "paths": {
    "jquery": "bower_components/jquery/dist/jquery",
    "jqueryui": "bower_components/jquery-ui/jquery-ui",
    "underscore": "bower_components/underscore/underscore-min",
    "gridsplit": "src/js/jquery.gridsplit"
  },
  "shim": {
    "jquery":        { "exports": "$" },
    "jqueryui":     ["jquery"]
  } 
});