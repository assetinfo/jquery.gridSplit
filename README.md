# [jquery.gridSplit](https://github.com/assetinfo/jquery.gridSplit)         [![Build Status](https://travis-ci.org/assetinfo/jquery.gridSplit.png)](https://travis-ci.org/assetinfo/jquery.gridSplit)

A jQuery grid system designed so that each cell can be "split" either horizontally or vertically. It is intended to be used as part of a larger system allowing the user free control of their widget environment. 

--------

First, download or clone this repo, then run 'bower install' and include the required packages in your page:

```html
<link rel="stylesheet" href="./src/css/jquery.gridsplit.css">
<script src="./bower_components/jquery/dist/jquery.js"></script>
<script src="./bower_components/jquery-ui/jquery-ui.js"></script>
<script src="./dist/jquery.gridsplit.min.js"></script>
```
OR include the optimised versions in ./dist/ dir (you can build these yourself using grunt, the package.json and gruntfile I used are included):

```html
<link rel="stylesheet" href="./dist/jquery.gridsplit.optimised.css">
<script src="./dist/jquery.gridsplit.optimised.js"></script>
```

Alternatively, include the plugin using [AMD](https://github.com/assetinfo/jquery.gridSplit/blob/master/main.js) with a config similar to:

```html
require.config({
  "deps": ["main"],
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
});
```
## Demo

We only have the one example but its fairly comprehensive. [github.io](https://assetinfo.github.io/jquery.gridSplit) and [jsfiddle](http://jsfiddle.net/graydixon/bupjuntd/), for more details check our documentation or unit-test.

## Generated Documentation

[Documentation](https://assetinfo.github.io/jquery.gridSplit/docs/) has been generated using [jsDocs 3.2.2](https://github.com/jsdoc3/jsdoc)

## Quick Reference 

* A grid is initialised against a div that must have an id, and a class of .grid.
<br/>

  ```html
  <div id="grid" class="grid"></div>
  ```
* The simplest grid (one cell) would be initialised with something similar to:
<br/>

  ```html
  var grid = $('#grid').gridSplit();
  ```
* You can set various options and events at initialisation, for more detail see the [documentation](https://assetinfo.github.io/jquery.gridSplit/docs/$.fn.gridSplit.html):
<br/>

  ```html
   var grid = $('#grid').gridSplit({resizable:false});
  ```
* A grid can be split with x/y co-ordinates using several methods that can be called in similar ways:
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
* If you want to chain spiltting actions then you might need .parent():
<br/>

  ```html
   var grid = grid.splitAt(1,0,true).parent().splitAt(1,0).splitAt(1,1,true).parent(); // grid is still #grids gridSplit instance
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

* The grids $elements can be accessed using grids.gridsCells:
<br/>

  ```html
    var $el00 = grid3.gridsCells[0][0];
    var $el10_00 = grid3.gridsCells[1][0].data("grid").gridsCells[0][0];
  ```

* To destroy the grid and any reference it adds:
<br/>

  ```html
    grid3 = grid3.destroy(); // this does not remove the element
  ```  
--------