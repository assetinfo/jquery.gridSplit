# jquery.gridSplit         [![Build Status](https://travis-ci.org/assetinfo/jquery.gridSplit.png)](https://travis-ci.org/assetinfo/jquery.gridSplit)

A jQuery grid system designed so that each cell can be "split" either horizontally or vertically. It is intended to be used as part of a larger system allowing the user free control of their widget environment. 

--------

Firstly, we need to include the required packages in our page:

```html
<link rel="stylesheet" href="./bower_components/bootstrap/dist/css/bootstrap.css">
<link rel="stylesheet" href="./src/css/jquery.gridsplit.css">
<script src="./bower_components/jquery/dist/jquery.js"></script>
<script src="./bower_components/jquery-ui/jquery-ui.js"></script>
<script src='./bower_components/underscore/underscore-min.js'></script>
<script src="./dist/jquery.gridsplit.min.js"></script>
```
OR we can include an optimised version of the above:

```html
<link rel="stylesheet" href="./dist/jquery.gridsplit.optimised.css">
<script src="./dist/jquery.gridsplit.optimised.js"></script>
```

We can do something similar to this in our require.config if we are using an AMD:

```html
require.config({
  "deps": ["main"],
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
```
Now were ready to build grids (see example.html OR example-amd.html and main.js)

--------

