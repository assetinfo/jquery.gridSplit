require.config({
  "paths": {
    "jquery": "bower_components/jquery/dist/jquery",
    "core": "bower_components/jquery-ui/ui/core",
    "mouse": "bower_components/jquery-ui/ui/mouse",
    "widget": "bower_components/jquery-ui/ui/widget",
    "jqueryui-draggable": "bower_components/jquery-ui/ui/draggable",
    "gridsplit": "src/js/jquery.gridsplit"
  },
  "shim": {
    "jquery":        { "exports": "$" },
    "jqueryui-draggable":     ["jquery", "core", "mouse", "widget"]
  } 
});