# jquery.gridSplit         [![Build Status](https://travis-ci.org/assetinfo/jquery.gridSplit.png)](https://travis-ci.org/assetinfo/jquery.gridSplit)

A jQuery grid system designed so that each cell can be "split" either horizontally or vertically. It is intended to be used as part of a larger system allowing the user free control of their widget environment. 

--------

Firstly, we need to include the required packages in our page:

```html
<link rel="stylesheet" href="./bower_components/bootstrap/dist/css/bootstrap.css">
<link rel="stylesheet" href="./src/css/jquery.gridsplit.css">
<script src="./bower_components/jquery/dist/jquery.js"></script>
<script src="./bower_components/jquery-ui/jquery-ui.js"></script>
<script src="./bower_components/underscore/underscore-min.js"></script>
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
Now were ready to build grids (see [example.html](https://github.com/assetinfo/jquery.gridSplit/blob/master/example.html) OR [example.amd.html](https://github.com/assetinfo/jquery.gridSplit/blob/master/example.amd.html) and [main.js](https://github.com/assetinfo/jquery.gridSplit/blob/master/main.js) for initialisation methods)

# Demo

We only have the one example at the moment, but its fairly comprehensive. [github.io](https://assetinfo.github.io/jquery.gridSplit) and [jsfiddle](http://jsfiddle.net/graydixon/bupjuntd/)

# Generated Documentation

[Documentation](https://assetinfo.github.io/jquery.gridSplit/docs/) has been generated using [jsDocs2.2](https://github.com/jsdoc3/jsdoc)

# Quick Reference 
<br/>

* A grid is initialised against a div that must have an id and a class of .grid.
<br/>

  ```html
  <div id="grid" class="grid"></div>
  ```
* The simplest grid (one cell) would be initialised like so:
<br/>

  ```html
  var grid = $('#grid').gridSplit();
  ```
* You can set various options at initialisation, for more detail see the [documentation](https://assetinfo.github.io/jquery.gridSplit/docs/$.fn.gridSplit.html):
<br/>

  ```html
   var grid = $('#grid').gridSplit({resizable:false});
  ```
* A grid can be split using x/y co-ordinates using several methods that can be called in similar ways:
<br/>

  ```html
   grid.splitAt(0).splitAt(1,0).splitAt(0).addColumn(1).addCell(0,0).splitAt(1,0);
  ```
* Cells can also be deleted using x/y co-ordinates:
<br/>

  ```html
   grid.delCell(1,0).delAt(0,0).delColumn(1).delAt(0);
  ``` 
* This adds a grid to the cell and splits that new cell/grid vertically into two columns:
<br/>

  ```html
   var grid2 = grid.splitAt(1,0,true);
  ``` 
* .returnMeta() will provide an array that represents the grid:
<br/>

  ```html
   var meta = grid.returnMeta(); // "{"0":{"c":{"w":"19%"}},"1":{"0":{"0":{"c":{"w":"50%"}},"1":{"c":{"w":"50%"}},"h":"50%"},"1":{"h":"50%"},"c":{"w":"81%"}}}"
  ``` 
* This data can be used to duplicate or recreate the grid:
<br/>

  ```html
    var grid3 = $('#grid-clone').gridSplit({data:JSON.parse(meta)});
  ``` 
--------