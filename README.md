# [jQuery.gridSplit](https://github.com/assetinfo/jquery.gridSplit)         [![Build Status](https://travis-ci.org/assetinfo/jquery.gridSplit.png)](https://travis-ci.org/assetinfo/jquery.gridSplit)

   >A jQuery grid system designed so that each cell can be "split" either horizontally or vertically. Useful for creating interactive/dynamic grids from static HTML, JSON objects or user interaction.

--------

## Demo

* We only have the one example but its fairly comprehensive, see [github.io](https://assetinfo.github.io/jquery.gridSplit) or [jsfiddle](http://jsfiddle.net/graydixon/jo42v1q9/). For more details check our [documentation](https://assetinfo.github.io/jquery.gridSplit/docs/) and [jasmine test's](https://github.com/assetinfo/jquery.gridSplit/tree/master/spec).

## Documentation

* [jQuery.gridSplit's documentation](https://assetinfo.github.io/jquery.gridSplit/docs/) has been generated using [jsDocs 3.2.2](https://github.com/jsdoc3/jsdoc)

## Installing, building and testing

1. [Download](https://github.com/assetinfo/jquery.gridSplit/archive/master.zip) or clone this repo...
   ```
   $ git clone git@github.com:assetinfo/jquery.gridSplit.git
   ```

2. Navigate to the directory containing jquery.gridSplit and run...

   ```
   $ npm install
   ```

3. Followed by...

   ```
   $ bower install
   ```

4. Then to build run...

   ```
   $ grunt
   ```

5. And to test run...

   ```
   $ grunt test
   ```

6. To use in your own project...
   
   * include dependencies and minified version of jquery.gridSplit.js

   ```html
   <link rel="stylesheet" href="./src/css/jquery.gridsplit.css"/>
   <script src="./bower_components/jquery/dist/jquery.js"></script>
   <script src="./bower_components/jquery-ui/jquery-ui.js"></script>
   <script src="./dist/jquery.gridsplit.min.js"></script>
   ```
 
   * or include the optimised versions from ./dist/:

   ```html
   <link rel="stylesheet" href="./dist/jquery.gridsplit.optimised.css"/>
   <script src="./dist/jquery.gridsplit.optimised.js"></script>
   ```

   * alternatively, [require](http://requirejs.org/) jquery.gridSplit in a [module](https://github.com/assetinfo/jquery.gridSplit/blob/master/main.js) with the following in your config file...

   ```javascript
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
           "jquery": { "exports": "$" },
           "jqueryui-draggable": ["jquery", "core", "mouse", "widget"]
       }
   });
   ```

## Initialising a grid

* A grid is initialised against a div that must have an id, and a class of .grid.

    * HTML
    ```html
    <div id="grid1" class="grid"></div>
    ```
    * Javascript
    ```javascript
    var grid = $('#grid1').gridSplit();
    ```
* A grid can be defined prior to initialisation...
    * HTML
    ```html
    <div id="grid2" class="grid">
        <div class="innerGrid" >
            <div class="gridColumn" gs-width="100%">
                <div class="gridCell" gs-height="50%">
                    <div class="fillCell"><a>Test1</a></div>
                </div>
                <div class="gridCell" gs-height="50%">
                    <div class="fillCell"><a>Test2</a></div>
                </div>
            </div>
        </div>
    </div>
    ```
    * Javascript
    ```
    var grid = $('#grid2').gridSplit({'useContent': true});
    ```
  
* You can also set other options and events at initialisation...

    * disable 'resizable' functionality...
    ```javascript
    var grid = $('#grid').gridSplit({'resizable':false});
    ```
    * split vertically by halfing column...
    ```javascript
    var grid = $('#grid').gridSplit({'splitMethodV':'half'});
    ```
    * split vertically by evenly distributing the columns widths...
    ```javascript
    var grid = $('#grid').gridSplit({'splitMethodV':''});
    ```
* for more options see the [documentation](https://assetinfo.github.io/jquery.gridSplit/docs/$.fn.gridSplit.html).
    
## Manipulating a grid

* A grid can be split with x/y co-ordinates, where x=column and y=cell. 
  * Adding a column splits the focus cell vertically (into 2 columns). 
  * Adding a cell splits the focus cell horizontally (adding 2 cells).

  ```javascript
  grid.splitAt(0).splitAt(1,0).splitAt(0).addColumn(1).addCell(0,0).splitAt(1,0);
  ```
* Cells can also be deleted using x/y co-ordinates:

  ```javascript
  grid.delCell(1,0).delAt(0,0).delColumn(1).delAt(0);
  ``` 
* Cells can be split into two columns by providing true as the 3rd param. This effectivaly adds a new grid with two columns into the cell, returning the new grid as the current grids context.

  ```javascript
  var grid2 = grid.splitAt(1,0,true);
  ``` 
* Nearly all functions which manipulate the grid will return 'this' (the current grids context), so in order to chain commands without breaking, use this.parent() to move the context to the grids parent grid (the top grids.parent() will === grids):

  ```javascript
  var grid = grid.splitAt(1,0,true).parent().splitAt(1,0).splitAt(1,1,true).parent(); // grid is still #grids gridSplit instance
  ``` 
* Grids can be rebuilt using JSON, the structure for which can be returned by calling:

  ```javascript
  var meta = grid.returnMeta(); // "{"0":{"c":{"w":"20%"}},"1":{"0":{"0":{"c":{"w":"50%"}},"1":{"c":{"w":"50%"}},"h":"50%"},"1":{"h":"50%"},"c":{"w":"80%"}}}"
  ``` 
* The grid can be cloned by initialising a new grid with the parsed meta object being passed in as 'data':

  ```javascript
  var grid3 = $('#grid-clone').gridSplit({data:JSON.parse(meta)});
  ``` 

* The grids $elements can be accessed using grids.gridsCells:

  ```javascript
  var $el00 = grid3.gridsCells[0][0];
  var $el10_00 = grid3.gridsCells[1][0].data("grid").gridsCells[0][0];
  ```

* To destroy the grid and any reference it adds:

  ```javascript
  grid3 = grid3.destroy(); // this will not remove the element, but will empty it
  ```

## License

  * [Licensed](https://github.com/assetinfo/jquery.gridSplit/blob/master/LICENSE) under the MIT License (MIT).

## Acknowledgements 

* [Hoxton-one - Golden-layout](https://github.com/hoxton-one/golden-layout) - "The ultimate Javascript layout manager."
  * This library has similar functionality, but it's more fleshed out than jquery.gridSplit. We didn't see golden-layout until we had just about finished gridSplit, we think we have the edge on simplicity, but having not done a thorough comparison: we wouldn't want to discourage you from trying it. [Examples](https://golden-layout.com/examples) can be found on their [homepage](https://golden-layout.com/).

## Contact us

* [Contact us](mailto:gdixon@assetinfo.co.uk?Subject=jQuery.gridSplit%20Enquiry...) if you need any further information or guidance (email: gdixon@assetinfo.co.uk).
<br/>
---
---
