/*! 
* Script: jquery.gridSplit.min.js - v.0.0.1 
* Copyright: (c) 2015 Graham Dixon (assetinfo(MML))
* Licensed: MIT 
* Depends on: jQuery && jQuery-ui, underscore, bootstrap 3.*
*/

;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery and underscore.
        // shim ../bower_components/jquery-ui/jquery-ui(draggable) to ../bower_components/jquery/src/jquery as jquery
        define(['jquery', 'jqueryui', 'underscore'], factory);
    } else {
        // No AMD. Register plugin with global jQuery and underscore objects.
        factory(jQuery, jQuery, _);
    }
}(function($, jui, _) {
    /**
    * $.fn.gridSplit - calls - new gridSplit(el, options) - using this as el. 
    *
    * @param {object} el the $el this grid is being applied to [assumed when initialised via $.fn]
    * @param {object} options the settings being applied to this $el
    * @param {String} options.horizRail - horizontal rail $el to be cloned
    * @param {String} options.vertRail - vertical rail $el to be cloned
    * @param {String} options.gridColClass - Column class
    * @param {String} options.gridCellClass - Cell class
    * @param {String} options.innerGridClass - Inner grid class
    * @param {String} options.hasChildrenClass - Cell has children class
    * @param {String} options.resizableClass - Is resizable class
    * @param {String} options.draggingClass - Rail is being dragged class
    * @param {String} options.data - Data to initialise the grid with
    * @param {String} options.setMeta - Meta to bet set against the current grid
    * @param {String} options.parentGrid - The parent of the current grid
    * @param {String} options.nestedIn - The ID of the grid this grid is nested in
    * @param {String} options.resizable - Is resizable?
    * @param {String} options.splitMethodH - Method to use when splitting cells horizontally ["half"|""]
    * @param {String} options.splitMethodV -  Method to use when splitting columns vertically ["half"|""]
    * @param {String} options.horizMin - Minimum cell height
    * @param {String} options.vertMin - Minimum column width
    * @param {String} options.hideBorder - CSS obj to hide the border
    * @class $.fn.gridSplit
    * @memberOf! $.fn
    */
    $.fn.gridSplit = (function(options) {
        var grid,
            init = function(that) {
                if (undefined == $(that).data('grid')) {
                    grid = new gridSplit(that, options);
                    $(that).data('grid', grid);
                } else {
                    // do option based functions
                    if (typeof options !== "undefined") {
                        // allow recreate on .gridSplit({data:object});
                        if (typeof options['data'] !== "undefined") {
                            grid = that.data('grid').init(that, options);
                        } else if (typeof options['setMeta'] !== "undefined") {
                            grid = that.data('grid');
                            grid.setMeta(options['setMeta'], false);
                        } else {
                            grid = that.data('grid');                            
                        }
                    } else {
                        grid = that.data('grid');
                    }
                }
            };
        init(this);
        // --------       
        // return grid to enable chaining of gridSplit functions;
        return grid;
    });
    /**
     * @fileOverview  gridSplit - A jQuery grid system designed so that each cell can be "split" either horizontally or vertically. <br/><br/>
     * new gridSplit($el, options)
     * @version 0.0.01
     * @author Graham Dixon - gdixon@assetinfo.co.uk 
     * @namespace gridSplit
     */
    var gridSplit = function(el, options) {
        var grid = this;
        var defaults = {
            horizRail: $('<div/>').addClass("horizrail"),
            vertRail: $('<div/>').addClass("vertrail"),
            gridColClass: 'column',
            gridCellClass: 'gridCell',
            innerGridClass: 'inner-grid',
            insideCellClass: 'insideCell',
            hasChildrenClass: 'hasChildren',
            resizableClass: 'isResizable',
            draggingClass: 'dragging',
            data: '',
            parentGrid: '',
            nestedIn: '',
            resizable: true,
            splitMethodH: "",
            splitMethodV: "half",
            horizMin: 5,
            vertMin: 2,
            hideBorder: {
                "border": "0px solid #000"
            }
        };      
        /**
         * Iniatialise the grid and apply the options contained in the passed in object.
         * 
         * @function gridSplit.init
         * @param {object} el the $element we are applying the grid to.
         * @param {object} options the options being passed through to init from $(el).gridSplit(options) or new gridSplit(options).
         * @param {String} options.horizRail - horizontal rail $el to be cloned
         * @param {String} options.vertRail - vertical rail $el to be cloned
         * @param {String} options.gridColClass - Column class
         * @param {String} options.gridCellClass - Cell class
         * @param {String} options.innerGridClass - Inner grid class
         * @param {String} options.hasChildrenClass - Cell has children class
         * @param {String} options.resizableClass - Is resizable class
         * @param {String} options.draggingClass - Rail is being dragged class
         * @param {String} options.data - Data to initialise the grid with
         * @param {String} options.setMeta - Meta to bet set against the current grid
         * @param {String} options.parentGrid - The parent of the current grid
         * @param {String} options.nestedIn - The ID of the grid this grid is nested in
         * @param {String} options.resizable - Is resizable?
         * @param {String} options.splitMethodH - Method to use when splitting cells horizontally ["half"|""]
         * @param {String} options.splitMethodV -  Method to use when splitting columns vertically ["half"|""]
         * @param {String} options.horizMin - Minimum cell height
         * @param {String} options.vertMin - Minimum column width
         * @param {String} options.hideBorder - CSS obj to hide the border
         * @return {object} this
         * @property {object} this.settings - object of settings extended by options
         * @property {String} this.id - the grid elements ID 
         * @property {object} this.$el - the grid $el
         * @property {object} this.el - the grid document node
         * @property {string} this.focusGrid - reference to ID
         * @property {object} this.gridsColumns - object of columns (only relevent to this grid)
         * @property {object} this.gridsCells - object of cells (only relevent to this grid)
         * @property {object} this.gridsStructure - object representing the simplified structure (all nested grid)
         * @property {object} this.timeoutFPH - object to hold timouts for forcePercentHeight
         * @property {object} this.metaAt - object of the complete structure and meta (all nested grid)
         * @memberOf gridSplit
         */        
        grid.init = function(el, options) {
            var oThis = this;
            this.settings = {};
            this.settings = $.extend({}, defaults, options);
            this.id = el.attr("id");
            this.$el = $('#' + this.id);
            this.el = this.$el[0];
            this.focusGrid = this.id;
            this.gridsColumns = [];
            this.gridsCells = [];
            this.gridsStructure = [];
            this.timeoutFPH = [];
            this.metaAt = {};
            // remove inner-grid to avoid multiple instances when setting data
            $("#" + this.id + " ." + this.settings.innerGridClass).remove();
            this.elInner = $('<div />').addClass(this.settings.innerGridClass).appendTo(this.$el);
            if (this.settings.splitCellInColumn == true) {
                this.settings.useInsideCell = this.settings.insideCellClass + '' + this.settings.nestedIn;
            }
            if (this.settings.data == '') {
                // to force the addCol/addCell function to go straight to setting these values.
                this.gridsStructure[0] = "need to set";
                this.addColumn(0);
                this.gridsStructure[0][0] = "need to set";
                this.addCell(0, 0);
                // when where splitting a Cell in a colum we need to split horizontally
                if (this.settings.splitCellInColumn == true) {
                    this.addColumn(0);
                }
            } else {
                // add grid data and set meta
                this.buildGrid(this.settings.data);
            }
            $(window).on("resize", function() {
                oThis.centerInner(oThis)
            });
            return this;
        }
        /**
         * this.buildGrid()<br/><br/>Build the grid when provided with {data:object} via .init(el, object)
         * 
         * @function gridSplit.buildGrid
         * @param {string} data the provided JSON data.
         * @param {string} undefined easy reference to an undefined var
         * @return {object} this
         * @memberOf gridSplit
         */  
        grid.buildGrid = function(data, undefined) {
            // use data to build grid.
            var oThis = this;
            // each column
            oThis.buildingGrid = true;
            _.each(data, function(column, x) {
                if (!isNaN(x)) {
                    oThis.gridsStructure[x] = "need to set";
                    oThis.addColumn(x, undefined, true);
                    oThis.gridsColumns[x].css("float", "left");
                    // console.log("add Column " + x);
                    // each cell
                    if (oThis.countCells(column) > 0) {
                        _.each(column, function(cell, y) {
                            if (!isNaN(y)) {
                                // console.log("adding Cell " + x);
                                oThis.addCell(x, y);
                                // console.log("cellData:" + cell);
                                if (typeof cell[0] === "object") {
                                    oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass);
                                    var el = oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y, cell);
                                }
                            }
                        });
                    } else {
                        // single cell.
                        oThis.addCell(x, 0);
                    }
                }
            });
            // set widths/heights from meta.
            oThis.setMeta(data);
        }
        /**
         * thie.setMeta<br/><br/>Set the widths and height of the columns / cells when provided with an appropriate object.
         * 
         * @function gridSplit.setMeta
         * @param {object} data the data we are applying to the grid.
         * @return {object} this
         * @memberOf gridSplit
         */  
        grid.setMeta = function(data) {
            var oThis = this;
            _.each(data, function(column, x) {
                if (!isNaN(x)) {
                    if (typeof column['c'] !== "undefined") {
                        var wid = column['c']['w'];
                        oThis.gridsColumns[x].css("width", wid);
                        oThis.resizeColumn(x, wid);
                    }
                    if (oThis.countCells(column) > 0) {
                        _.each(column, function(cell, y) {
                            //console.log("x id: "+ x +", y is: "+ y)
                            if (!isNaN(y)) {
                                if (typeof oThis.gridsCells[x][y] !== "undefined") {
                                    oThis.gridsCells[x][y].css("height", cell['h']);
                                    oThis.resizeCell(x, y, cell['h']);
                                }
                            }
                            if (typeof cell[0] === "object") {
                                if (typeof oThis.gridsCells[x][y] !== "undefined") {
                                    oThis.gridsCells[x][y].data("grid").setMeta(cell);
                                }
                            }
                        });
                    }
                }
            });
            oThis.buildingGrid = false;
            return this;
        }
        grid.countCells = function(arr) {
            // data is array not object so no .length
            var t = 0;
            _.each(arr, function(arrr, k) {
                if (!isNaN(k)) {
                    t++;
                }
            });
            return t;
        }
        /**
         * this.addCell()<br/><br/>Add a cell at an x,y co-ordinate, append to grid or insertAfter 'after'
         * 
         * @function gridSplit.addCell
         * @param {int} x the target column
         * @param {int} y the target cell.
         * @param {object} after $element.
         * @return {object} this
         * @memberOf gridSplit
         */ 
        grid.addCell = function(x, y, after) {
            // add a cell by sharing the available height between all cells in the column.
            if (typeof x == "undefined" || typeof y == "undefined") {
                return this;
            }
            // set to structure length if x is less so can add to last using addCell(99999,99999);
            if ((this.gridsStructure.length - 1) < x) {
                x = this.gridsStructure.length - 1;
            }
            // if needs to set, already been through this.splitAt()
            // if cell exists then do a split at location
            // otherwise delete reference to the attempt and split the last in the object
            if (this.gridsStructure[x][y] == "need to set") {
                // inserting the actual cell
                el = $('<div class="' + this.settings.gridCellClass + ' ' + (this.settings.splitCellInColumn == true ? this.settings.insideCellClass + ' ' + this.settings.useInsideCell : '') + '" ></div>')
                if (typeof after !== "undefined") {
                    el.insertAfter(after);
                } else {
                    el.appendTo(this.gridsColumns[x]);
                }
                this.gridsStructure[x][y] = true;
                this.gridsCells[x][y] = el;
                this.addControls(this.gridsCells[x][y], x, y);
            } else if ((this.gridsStructure[x].length) > y) {
                // split at provided
                this.splitAt(x, y);
            } else {
                // split last and delete reference to attempt
                if (x < (this.gridsStructure.length - 1)) {
                    this.splitAt(this.gridsStructure.length, y);
                } else {
                    this.splitAt(x, this.gridsStructure[x].length - 1);
                }
                delete(this.gridsStructure[x][y]);
            }
            return this;
        }
        /**
         * this.addColumn()<br/><br/>Add a column at position, append to grid or insertAfter 'after', skip auto adjust columns?
         * 
         * @function gridSplit.addColumn
         * @param {int} x the target column
         * @param {object} after $element.
         * @param {bool} skip skip the auto adjust of column width?
         * @return {object} this
         * @memberOf gridSplit
         */ 
        grid.addColumn = function(x, after, skip) {
            // add a column by halving the target column.
            var oThis = this;
            if (typeof x == "undefined") {
                return;
            }
            // if === needs to set, already been through this.splitAt()
            // if column exists then do a split at location instead.
            // otherwise delete reference to the attempt and split the last in the object
            if (this.gridsStructure[x] == "need to set") {
                // inserting the actual cell
                var el = $('<div class="' + this.settings.gridColClass + '" ></div>')
                if (typeof after !== "undefined") {
                    el.insertAfter(after);
                } else {
                    el.appendTo(this.elInner);
                }
                this.gridsStructure[x] = [];
                this.gridsCells[x] = [];
                this.gridsColumns[x] = el.data("tpe", "c");
                this.addControls(this.gridsColumns[x], x);
            } else if ((this.gridsStructure.length) > x) {
                // split at provided
                this.splitAt(x);
            } else {
                // split last and delete reference to attempt
                this.splitAt(this.gridsStructure.length - 1);
                delete(this.gridsStructure[x]);
            }
            if (!skip == true) {
                clearTimeout(oThis.timeoutFP);
                oThis.timeoutFP = setTimeout(function() {
                    oThis.forcePerWidth();
                });
            }
            return this;
        }
        /**
         * this.splitAt()<br/><br/> provides a gateway to addColumn and addCell, providing addition methods.
         * 
         * @function gridSplit.splitAt
         * @param {int} x the target column (if no y provided, columns is split vertically)
         * @param {int} y the target cell (if y is provided, cell is split horizontally)
         * @param {bool} cell split the cell vertically by providing true.         
         * @return {object} this
         * @memberOf gridSplit
         */ 
        grid.splitAt = function(x, y, cell) {
            // split the column([x] - vertically)[ .splitAt(0)] 
            // split the cell ([x][y] - horizontally)[ .splitAt(0,0)]
            // split the cell ([x][y] - vertically)[ .splitAt(0,0,true)]
            var oThis = this;
            // spliting the cell horizontally
            if (typeof y !== "undefined") {
                if (typeof cell !== "undefined") {
                    oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass);
                    return oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y);
                }
                if ((y + 1) == oThis.gridsStructure[x].length) {
                    // tell cell it needs to set.
                    oThis.gridsStructure[x][(y + 1)] = "need to set";
                    oThis.addCell(x, (y + 1));
                } else {
                    // shift everything after y in x right to make space;
                    var reEx = [];
                    var reExm = {};
                    var reExs = [];
                    // need to keep reference to col width.
                    reExm['c'] = oThis.metaAt[x]['c'];
                    _.each(oThis.gridsCells[x], function(acY, ly) {
                        if (ly >= (y + 1)) {
                            reEx[(ly + 1)] = oThis.gridsCells[x][ly];
                            reExm[(ly + 1)] = oThis.metaAt[x][ly];
                            reExs[(ly + 1)] = oThis.gridsStructure[x][ly];
                        } else {
                            reEx[ly] = oThis.gridsCells[x][ly];
                            reExm[ly] = oThis.metaAt[x][ly];
                            reExs[ly] = oThis.gridsStructure[x][ly];
                        }
                    });
                    oThis.gridsCells[x] = reEx;
                    oThis.metaAt[x] = reExm;
                    oThis.gridsStructure[x] = reExs;
                    // tell cell it needs to set.
                    oThis.gridsStructure[x][(y + 1)] = "need to set";
                    oThis.addCell(x, (y + 1), oThis.gridsCells[x][y]);
                }
                var first = oThis.gridsCells[x][y];
                var second = oThis.gridsCells[x][(y + 1)];
                var no = oThis.gridsCells[x].length;
                if(typeof first !== "undefined" && oThis.buildingGrid !== true && oThis.settings.splitMethodH == "half"){
                    var height = first.outerHeight();
                    // set height divides the firsts' height by the .length of gridCells[x]
                    var setHeight = oThis.halfOf(first, second, height, "h");
                    oThis.resizeCell(x, y, setHeight );
                    oThis.resizeCell(x, (y + 1), setHeight);
                        clearTimeout(oThis.timeoutFPH[x]);
                        oThis.timeoutFPH[x] = setTimeout(function() {
                            oThis.forcePerHeight(x);
                        });
                }else{
                    var setHeight = this.halfOf(first, second, 0, "h", oThis.gridsCells[x]);
                    // set all of the heights in the column by this value
                    _.each(this.gridsCells[x], function(acY, ly) {
                        oThis.resizeCell(x, ly, setHeight);
                    });
                }
            } else {
                // splitting the column virticaly
                if ((x + 1) == oThis.gridsStructure.length) {
                    // conditions are good get straight to splitting.
                    // tell column it needs to set.
                    oThis.gridsStructure[(x + 1)] = "need to set";
                    oThis.addColumn((x + 1));
                } else {
                    // make space available by shifting everything after x right;
                    var reEx = [];
                    var reExm = {};
                    var reExc = [];
                    var reExs = [];
                    _.each(oThis.gridsColumns, function(acX, lx) {
                        if (lx >= (x + 1)) {
                            reEx[(lx + 1)] = oThis.gridsColumns[lx];
                            reExm[(lx + 1)] = oThis.metaAt[lx];
                            reExc[(lx + 1)] = oThis.gridsCells[lx];
                            reExs[(lx + 1)] = oThis.gridsStructure[lx];
                        } else {
                            reEx[lx] = oThis.gridsColumns[lx];
                            reExm[lx] = oThis.metaAt[lx];
                            reExc[lx] = oThis.gridsCells[lx];
                            reExs[lx] = oThis.gridsStructure[lx];
                        }
                    });
                    oThis.gridsColumns = reEx;
                    oThis.metaAt = reExm;
                    oThis.gridsCells = reExc;
                    oThis.gridsStructure = reExs;
                    // tell column it needs to set.
                    oThis.gridsStructure[(x + 1)] = "need to set";
                    oThis.addColumn((x + 1), oThis.gridsColumns[x]);
                }
                var first = oThis.gridsColumns[x];
                var second = oThis.gridsColumns[(x + 1)];
                var width = oThis.gridsColumns[x].width();
                // setWid is calculated by taking the width of the first dividing by two and applying that to both affected cols.
                // pass this (to obj in halfOf) at the end of this call to even the rows as theyre added
                if( oThis.settings.splitMethodV == "half" ) {
                    var setWid = oThis.halfOf(first, second, width, "w");
                }else{
                    var setWid = oThis.halfOf(first, second, width, "w", oThis);
                }
                oThis.resizeColumn(x, setWid);
                oThis.resizeColumn((x + 1), setWid);
                // column needs a cell, tell it that it needs to set.
                oThis.gridsStructure[(x + 1)][0] = "need to set";
                oThis.addCell((x + 1), 0);
            }
            return oThis;
        }
        /**
         * this.splitCellInColumn()<br/><br/> initialises another grid within a grid.
         * 
         * @function gridSplit.splitCellInColumn
         * @param {object} el the target gridsCell we will be adding a grid to
         * @param {int} x the target column (if no y provided, columns is split vertically)
         * @param {int} y the target cell (if y is provided, cell is split horizontally)
         * @param {object} data if the action is being made by buildGrid then data will be passed back in to buildGrid.         
         * @return {object} el.data("grid") grid instance
         * @memberOf gridSplit
         */ 
        grid.splitCellInColumn = function(el, x, y, data) {
            // add an ID to the cell so that a new grid can be initialised on it.
            if (this.splitCellInColumn !== true) {
                // use .data("grid") here to reference inner grid.
                el.attr("id", (this.settings.nestedIn !== '' ? this.settings.nestedIn + "-" + this.id : this.id) + '-' + x + '' + y)
                .css(this.settings.hideBorder)
                .off("click")
                .gridSplit({
                    "parentGrid": this,
                    "parentsX": x,
                    "parentsY": y,
                    "splitCellInColumn": true,
                    "nestedIn": (this.settings.nestedIn !== '' ? this.settings.nestedIn + "-" + this.id : this.id),
                    "data": (typeof data !== "undefined") ? data : "",
                    "resizable": this.settings.resizable,
                });
                if (typeof(this.gridsStructure[x][y] == "undefined")) {
                    this.gridsStructure[x][y] = {};
                }
                // connect structure and meta to parent grid, let em bubble to the top grid instance
                // access cells grid by using .data("grid") on the cell ( .returnCells()[x][y] )
                this.gridsStructure[x][y] = el.data("grid").gridsStructure;
                if (typeof this.metaAt[x] === "undefined") {
                    this.metaAt[x] = {};
                    this.metaAt[x]['c'] = {};
                }
                if(typeof this.metaAt[x][y] !== "undefined") {
                    var h = this.metaAt[x][y]['h'];
                    this.metaAt[x][y] = el.data("grid").metaAt;
                    this.metaAt[x][y]['h'] = h;
                } else {
                    this.metaAt[x][y] = el.data("grid").metaAt;
                }
                 
            }
            return el.data("grid");
        }
        /**
         * this.delCell()<br/><br/> allows for removing a cell.
         * 
         * @function gridSplit.delCell
         * @param {int} x the target cells' column 
         * @param {int} y the target cells position in that column 
         * @return {object} this
         * @memberOf gridSplit
         */ 
        grid.delCell = function(x, y) {
            // shift everything after y in x left and remove the element and references;
            var oThis = this;
            var reEx = [];
            var reExm = {};
            var reExs = [];
            if (typeof this.gridsColumns[x] !== "undefined") {
                if (typeof this.gridsCells[x][y] !== "undefined") {
                    if (this.gridsColumns.length > 0) {
                        if (this.gridsCells[x].length > 1) {
                            var el = this.gridsCells[x][y];
                            // keep reference to the column deffinition
                            reExm['c'] = oThis.metaAt[x]['c'];
                            _.each(this.gridsCells[x], function(acY, ly) {
                                if (ly > y) {
                                    reEx[(ly - 1)] = oThis.gridsCells[x][ly];
                                    reExm[(ly - 1)] = oThis.metaAt[x][ly];
                                    reExs[(ly - 1)] = oThis.gridsStructure[x][ly];
                                } else {
                                    if (ly !== y) {
                                        reEx[ly] = oThis.gridsCells[x][ly];
                                        reExm[ly] = oThis.metaAt[x][ly];
                                        reExs[ly] = oThis.gridsStructure[x][ly];
                                    }
                                }
                            });
                            $(el).remove();
                            this.gridsCells[x] = reEx;
                            this.metaAt[x] = reExm;
                            this.gridsStructure[x] = reExs;
                            this.forcePerHeight(x);
                        } else {
                            this.delColumn(x);
                        }
                    }
                }
            }
            return this;
        }
        /**
         * this.delColumn()<br/><br/> allows for removing a column.
         * 
         * @function gridSplit.delColumn
         * @param {int} x the target column 
         * @return {object} this
         * @memberOf gridSplit
         */ 
        grid.delColumn = function(x) {
            // shift everything after x left and remove the element and references;
            var oThis = this;
            var reEx = [];
            var reExm = {};
            var reExs = [];
            var reExc = [];
            var el = this.gridsColumns[x];
            if (typeof this.gridsColumns[x] !== "undefined") {
                _.each(this.gridsColumns, function(acX, lx) {
                    if (lx > x) {
                        reEx[lx - 1] = oThis.gridsCells[lx];
                        reExm[lx - 1] = oThis.metaAt[lx];
                        reExs[lx - 1] = oThis.gridsStructure[lx];
                        reExc[lx - 1] = oThis.gridsColumns[lx];
                    } else {
                        if (lx !== x) {
                            reEx[lx] = oThis.gridsCells[lx];
                            reExm[lx] = oThis.metaAt[lx];
                            reExs[lx] = oThis.gridsStructure[lx];
                            reExc[lx] = oThis.gridsColumns[lx];
                        }
                    }
                });
                if (reExc.length >= 1) {
                    $(el).remove();
                    this.gridsCells = reEx;
                    this.metaAt = reExm;
                    this.gridsStructure = reExs;
                    this.gridsColumns = reExc;
                    this.forcePerWidth();
                } else {
                    this.$el.find(".vertRail").remove();
                }
            }
            return this;
        }
        /**
         * this.delAt()<br/><br/> provides a gateway to delColumn and delCell.
         * 
         * @function gridSplit.delAt
         * @param {int} x the target cells' column 
         * @param {int} y the target cells position in that column 
         * @return {object} this
         * @memberOf gridSplit
         */ 
        grid.delAt = function(x, y) {
            return (typeof y == "undefined" ? this.delColumn(x) : this.delCell(x, y));
        }
        /**
         * this.addRail()<br/><br/> will add rails to cells/columns if this.settings.resizable is true;
         * 
         * @function gridSplit.addRail
         * @param {object} to the target element
         * @param {int} x the target cells' column 
         * @param {int} y the target cells position in that column 
         * @memberOf gridSplit
         */    
        grid.addRail = function(to, x, y) {
            // different rails for horiz and vert, comments should detail the approach...
            var oThis = this;
            if(this.settings.resizable == true){
                to.addClass(this.settings.resizableClass);
            }
            if ($(to).data("tpe") == "c") {
                // column == vertical
                if (x !== 0) {
                    var w = this.settings.gridColClass;
                    var rail = this.settings.vertRail;
                    var rRail = rail.clone();
                    rRail.appendTo(to);
                    rRail.draggable({
                        axis: 'x',
                        containment: to.parent(),
                        start: function(event, ui) {
                            // x value might change after init so check the number of previous columns
                            var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                            if (typeof oThis.gridsColumns[x] !== "undefined" && x !== 0) {
                                rRail.data("x", x);
                                // rail sits inside the cell to the right of the cell it will reference
                                var railReferstoRightOf = oThis.gridsColumns[x - 1];
                                // measure between the two elements that we know exist, x and x-1; 
                                // take away grids offset to compensate on nested grids.
                                rRail.origRight = oThis.gridsColumns[x].offset().left - oThis.$el.offset().left;
                                rRail.origLeft = oThis.gridsColumns[x - 1].offset().left - oThis.$el.offset().left;
                                // makes the original width
                                rRail.origWidth = rRail.origRight - rRail.origLeft;
                                // add dragging class so we can style on the drag.
                                $(this).addClass(oThis.settings.draggingClass);
                            } else {
                                // removes the rail if its left behind from a deleted cell
                                rRail.remove();
                            }
                        },
                        stop: function() {
                            // the new right position is where the rail was released
                            var newRight = $(this).offset().left;
                            var newWidth = newRight - rRail.origWidth - oThis.$el.offset().left;
                            // fix the first elements size (gridsColumns[x - 1])
                            var pixels = newWidth + rRail.origWidth - rRail.origLeft;
                            var rWidth = oThis.perOfWidth(pixels);
                            // set the widths;
                            oThis.gridsColumns[$(this).data("x") - 1].css("width", rWidth);
                            // take (pixels / no.of nextAll columns) away from nextAll total columns .width(), and convert to % 
                            var rem = oThis.gridsColumns.length - ($(this).data("x"));
                            var takePer = (pixels - rRail.origWidth) / rem;
                            if (rem > 0) {
                                for (x = $(this).data("x"); x < oThis.gridsColumns.length; x++) {
                                    var thisWid = oThis.gridsColumns[x].outerWidth();
                                    var thisnewWid = thisWid - takePer;
                                    oThis.gridsColumns[x].css("width", oThis.perOfWidth(thisnewWid));
                                }
                                // look across all widths and make sure they fill 100%;
                                oThis.forcePerWidth();
                            }
                            // put the rail back to auto default position
                            $(this).css("left", "auto");
                        }
                    });
                }
            } else {
                if (y !== 0) {
                    var w = this.settings.gridCellClass;
                    var rail = this.settings.horizRail;
                    var rRail = rail.clone();
                    rRail.appendTo(to);
                    var oThis = this;
                    rRail.draggable({
                        containment: to.parent(),
                        axis: 'y',
                        start: function(event, ui) {
                            var y = $(this).closest('.' + oThis.settings.gridCellClass).prevAll('.' + oThis.settings.gridCellClass).length;
                            var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                            // cant move a rail at 0.0                      
                            if (typeof oThis.gridsCells[x][y] !== "undefined" && y !== 0) {
                                rRail.data("x", x);
                                rRail.data("y", y);
                                $(this).addClass(oThis.settings.draggingClass);
                            } else {
                                // removes the rail if its left behind from a deleted cell
                                rRail.remove();
                            }
                        },
                        stop: function(e, ui) {
                            var moved = (ui.position.top - ui.originalPosition.top);
                            if (moved > 0) {
                                // bigger
                            } else {
                                // smaller   
                            }
                            var y = $(this).data("y"),
                                x = $(this).data("x"),
                                newBottom = $(this).offset().top,
                                newHeight = oThis.gridsCells[x][(y - 1)].outerHeight() + moved;
                            // get the outer height of the element being altered (gridsCells[x][y-1] - first box below the rail)
                            var gridHeight = oThis.gridsColumns[x].outerHeight();
                            // correct the height on the element being altered
                            // get the real % height using the newHeight against the gridHeight
                            var rHeight = oThis.perOfHeight(newHeight, gridHeight);
                            // set the new height to the elememt
                            oThis.gridsCells[x][(y - 1)].css("height", rHeight);
                            // then do similar (newHeight - moved) to the box above the rail, all others should go un-altertered
                            newHeight = oThis.gridsCells[x][y].outerHeight() - moved;
                            rHeight = oThis.perOfHeight(newHeight, gridHeight)
                            oThis.gridsCells[x][y].css("height", rHeight);
                            // put the rail back to auto default position
                            $(this).css("top", "auto");
                            // look across all heights and make sure they fill 100%;
                            oThis.forcePerHeight(x);
                        }
                    });
                }
            }
        }
        /**
         * this.resizeColumn()<br/><br/> simplify the pass through to this.setMetaAt on width resize;
         * 
         * @function gridSplit.resizeColumn
         * @param {int} x the target cells' column 
         * @param {string} to the new width (%)
         * @memberOf gridSplit
         */   
        grid.resizeColumn = function(x, to) {
            if (typeof this.metaAt === "undefined") {
                this.metaAt = {};
            }
            if (typeof this.metaAt[x] === "undefined") {
                this.metaAt[x] = {};
                this.metaAt[x]['c'] = {};
            }
            var obj = {
                "w": to,
            };
            // meta will be %
            this.setMetaAt(x, null, obj);
        }
        /**
         * this.resizeCell()<br/><br/> simplify the pass through to this.setMetaAt on height resize;
         * 
         * @function gridSplit.resizeCell
         * @param {int} x the target cells' column 
         * @param {int} y the target cells position in that column 
         * @param {string} to the new height (%)
         * @memberOf gridSplit
         */   
        grid.resizeCell = function(x, y, to) {
            //.
            if (typeof this.metaAt[x] === "undefined") {
                this.metaAt[x] = {};
                this.metaAt[x]['c'] = {};
            }
            if (typeof this.metaAt[x][y] === "undefined") {
                this.metaAt[x][y] = {};
            }
            var obj = {
                "h": to,
            };
            // meta will be %
            this.setMetaAt(x, y, obj);
        }
        /**
         * this.setMetaAt()<br/><br/> set the obj against this.metaAt[x]([y]);
         * 
         * @function gridSplit.setMetaAt
         * @param {int} x the target cells' column 
         * @param {int} y the target cells position in that column 
         * @param {object} obj the target element
         * @memberOf gridSplit
         */   
        grid.setMetaAt = function(x, y, obj) {
            if (typeof this.metaAt[x] === "undefined") {
                this.metaAt[x] = {};
                this.metaAt[x]['c'] = {};
            }
            if (y === null) {
                this.metaAt[x]['c'] = $.extend({}, this.metaAt[x]['c'], obj);
            } else {
                if (typeof this.metaAt[x][y] === "undefined") {
                    this.metaAt[x][y] = {};
                }
                this.metaAt[x][y] = $.extend({}, this.metaAt[x][y], obj);
            }
        }
        /**
         * this.addControls()<br/><br/> add a control set to either a column or a cell.
         * 
         * @function gridSplit.addControls
         * @param {object} to the target element
         * @param {int} x the target cells' column 
         * @param {int} y the target cells position in that column 
         * @memberOf gridSplit
         */ 
        grid.addControls = function(to, x, y) {
            // add a control set.   
            var oThis = this;
            // est type
            if ($(to).data("tpe") == "c") {
                var w = this.settings.gridColClass;
                var tpe = "c";
                var ctrls = [];
                // add the rail
                if (x !== 0) {
                    if( this.settings.resizable == true){
                        this.addRail(to, x, y);
                    }
                }
            } else {
                var w = this.settings.gridCellClass;
                var tpe = "r";
                var ctrls = [];
                if (y !== 0) {
                    if( this.settings.resizable == true){
                        this.addRail(to, x, y);
                    }
                }
            }
            // events
            // to buttons.
            to.on("click", function() {
                oThis.clickThis(this, tpe);
            });
        }
        /**
         * this.clickThis()<br/><br/> handles click against a column or a cell [example]
         * 
         * @function gridSplit.clickThis
         * @param {object} to the target element
         * @param {string} type the target element type [cell|column]
         * @memberOf gridSplit
         */ 
        grid.clickThis = function(to, type) {
            // just to handle an action against a cell. (example only)
            // that == the cell/column.
            if (type == "c") {
                var w = this.gridCol;
            } else {
                var w = this.gridCell;
                var whatisthis = $(to).toggleClass("black");
            }
        }
        /**
         * this.halfOf()<br/><br/> split a cell in two using the methods outlined in this.settings.splitMethod*
         * 
         * @function gridSplit.halfOf
         * @param {object} first the target element being split
         * @param {object} second the element filling the space
         * @param {string} full the size of the first element 
         * @param {string} type the target element type [cell|column]
         * @param {object} obj [this|column] passed in when this.settings.splitMethod* = "half"
         * @return {string} ret the new width|height as percentage 
         * @memberOf gridSplit
         */ 
        grid.halfOf = function(first, second, full, type, obj) {
            if (type == "w") {
                if (typeof obj !== "undefined") {
                    var ret = this.perOfWidthEls(obj);
                } else {
                    var ret = this.perOfWidth((full / 2));
                    $(first).css({
                        "width": ret,
                        "float": "left"
                    });
                    $(second).css({
                        "width": ret,
                        "float": "left"
                    });
                }
            } else if (type == "h") {
                if (typeof obj !== "undefined") {
                    var ret = this.perOfHeightEls(obj);
                } else {
                    var ret = this.perOfHeight((full / 2));
                    $(first).css({
                        "height": ret,
                    });
                    $(second).css({
                        "height": ret,
                    });
                }
            }
            return ret;
        }
        /**
         * this.perOfWidth()<br/><br/> passes back the percentage that pixels represents of the grids.outerWidth()
         * 
         * @function gridSplit.perOfWidth
         * @param {int} pixels elements width
         * @return {string} per
         * @memberOf gridSplit
         */ 
        grid.perOfWidth = function(pixels) {
            var per = ((100 / (this.$el.outerWidth())) * pixels);
            return per + "%";
        }
        /**
         * this.perOfWidthEls()<br/><br/> creates even widths for each column in the grid
         * 
         * @function gridSplit.perOfWidthEls
         * @param {object} grid pass in the grid instance
         * @return {string} per
         * @memberOf gridSplit
         */ 
        grid.perOfWidthEls = function(grid) {
            // grid is a gridSplit instance (so we can target other instances from here.)
            // start from first in series then move to parent and find all others in one DOM hit.
            var els = grid.$el.find('.' + grid.settings.innerGridClass).first().children("." + grid.settings.gridColClass);
            var no = els.length;
            var per = (100 / no);
            // set width and float the column left;
            els.css({
                "width": per + "%",
                "float": "left"
            });
            return per;
        }
        /**
         * this.perOfHeight()<br/><br/> passes back the percentage that pixels represents of the elHeight.outerHeight()
         * 
         * @function gridSplit.perOfHeight
         * @param {int} pixels elements height
         * @return {string} per
         * @memberOf gridSplit
         */
        grid.perOfHeight = function(pixels, elHeight) {
            var per = ((100 / (typeof elHeight !== "undefined" ? elHeight : this.$el.outerHeight())) * pixels);
            return per+"%";
        }
        /**
         * this.perOfHeightEls()<br/><br/> creates even heights for each cell in the column
         * 
         * @function gridSplit.perOfHeightEls
         * @param {object} grid pass in the grids column
         * @return {string} per
         * @memberOf gridSplit
         */ 
        grid.perOfHeightEls = function(els) {
            var no = els.length,
                per = (100 / no)+"%",
                searchEl;
            // start from first in series then move to $.parent and find all others in one hit.
            if( this.settings.splitCellInColumn == true ){
                searchEl = "." + this.settings.useInsideCell;
            }else{
                // this screwed up the formatting on github when it was in one line,
                // so I moved it into vars, no idea why this breaks things.
                var andNot = ":not(.";
                var closeNot = ")";
                searchEl = "." + this.settings.gridCellClass + andNot + this.settings.insideCellClass + closeNot;
            } 
            $(els[0]).parent().find(searchEl).css("height", per);
            return per;
        }
        /**
         * this.equalPers()<br/><br/> creates percentages that have to total target(100);
         * 
         * @function gridSplit.equalPers
         * @param {object} arr pass in values that need to total target
         * @param {int} target normally 100
         * @param {int} vh vertical|horizontal, what mins should we use
         * @return {object} pers
         * @memberOf gridSplit
         */ 
        grid.equalPers = function(arr, target, vh) {
            var i = arr.length,
                total = 0,
                min = 0;
            // place mins and total arr
            while (i--) {
                // use settings.horizMin && settings.vertMin as min
                min = (vh == 0 ? this.settings.vertMin : this.settings.horizMin);
                if (arr[i] < min) {
                    arr[i] = min;
                }
                total += arr[i];
            }
            // arr needs to be a real percent of target.
            for (x = 0; x < arr.length; x++) {
                arr[x] = (target / total) * arr[x];
            }
            // round the pers keep at 100%
            arr = grid.percentageRounding(arr, target);
            return arr;
        }
        /**
         * this.percentageRounding()<br/><br/> creates whole number percentages that have to total target(100);
         * 
         * @function gridSplit.percentageRounding
         * @param {object} arr pass in values that need to total target
         * @param {int} target normally 100
         * @return {object} pers
         * @memberOf gridSplit
         */ 
        grid.percentageRounding = function(arr, target) {
            var i = arr.length,
                j = 0,
                total = 0,
                change, newVals = [],
                next, factor1, factor2, len = arr.length,
                marginOfErrors = [];
            // map original values to new array
            while (i--) {
                total += newVals[i] = Math.round(arr[i]);
            }
            change = total < target ? 1 : -1;
            while (total !== target) {
                // Iterate through values and select the one that once changed will introduce
                // the least margin of error in terms of itself. e.g. Incrementing 10 by 1
                // would mean an error of 10% in relation to the value itself.
                for (i = 0; i < len; i++) {
                    next = i === len - 1 ? 0 : i + 1;
                    factor2 = errorFactor(arr[next], newVals[next] + change);
                    factor1 = errorFactor(arr[i], newVals[i] + change);
                    if (factor1 > factor2) {
                        j = next;
                    }
                }
                newVals[j] += change;
                total += change;
            }
            for (i = 0; i < len; i++) {
                marginOfErrors[i] = newVals[i] && Math.abs(arr[i] - newVals[i]) / arr[i];
            }
            // Math.round() causes some problems as it is difficult to know at the beginning
            // whether numbers should have been rounded up or down to reduce total margin of error. 
            // This section of code increments and decrements values by 1 to find the number
            // combination with least margin of error.
            for (i = 0; i < len; i++) {
                for (j = 0; j < len; j++) {
                    if (j === i) continue;
                    var roundUpFactor = errorFactor(arr[i], newVals[i] + 1) + errorFactor(arr[j], newVals[j] - 1);
                    var roundDownFactor = errorFactor(arr[i], newVals[i] - 1) + errorFactor(arr[j], newVals[j] + 1);
                    var sumMargin = marginOfErrors[i] + marginOfErrors[j];
                    if (roundUpFactor < sumMargin) {
                        newVals[i] = newVals[i] + 1;
                        newVals[j] = newVals[j] - 1;
                        marginOfErrors[i] = newVals[i] && Math.abs(arr[i] - newVals[i]) / arr[i];
                        marginOfErrors[j] = newVals[j] && Math.abs(arr[j] - newVals[j]) / arr[j];
                    }
                    if (roundDownFactor < sumMargin) {
                        newVals[i] = newVals[i] - 1;
                        newVals[j] = newVals[j] + 1;
                        marginOfErrors[i] = newVals[i] && Math.abs(arr[i] - newVals[i]) / arr[i];
                        marginOfErrors[j] = newVals[j] && Math.abs(arr[j] - newVals[j]) / arr[j];
                    }
                }
            }
            function errorFactor(oldNum, newNum) {
                return Math.abs(oldNum - newNum) / oldNum;
            }
            return newVals;
        }
        /**
         * this.centerInner()<br/><br/> calculates the padding required to center the grid.
         * 
         * @function gridSplit.centerInner
         * @param {object} thiss optional, centering an alternative grid
         * @memberOf gridSplit
         */ 
        grid.centerInner = function(thiss) {
            var oThis = ((typeof thiss !== "undefined") ? thiss : this);
            // if the percentages go haywire, make sure the grid sits centered in .grid
            setTimeout(function() {
                var realwidth = 0;
                oThis.elInner.children('.' + oThis.settings.gridColClass).each(function() {
                    realwidth += $(this).outerWidth(true);
                });
                if (realwidth < oThis.elInner.width()) {
                    oThis.elInner.css("padding-left", (oThis.elInner.width() - realwidth)/2 + "px");
                }
            });
        }
        /**
         * this.forcePerWidth()<br/><br/> all cell widths need to total 100..
         * 
         * @function gridSplit.forcePerWidth
         * @memberOf gridSplit
         */ 
        grid.forcePerWidth = function() {
            var wids = [];
            var oThis = this;
            _.each(this.gridsColumns, function(col, key) {
                wids.push(parseInt(oThis.perOfWidth($(col).width())));
            });
            var newWids = this.equalPers(wids, 100, 0);
            // console.log(wids);
            // console.log(newWids);
            _.each(this.gridsColumns, function(col, key) {
                $(col).css({
                    "width": newWids[key] + "%",
                });
                oThis.resizeColumn(key, (newWids[key] + "%"));
            });
        }
        /**
         * this.forcePerHeight()<br/><br/> all columns' cells heights need to total 100.
         * 
         * @function gridSplit.forcePerHeight
         * @param {int} x column being altered
         * @memberOf gridSplit
         */ 
        grid.forcePerHeight = function(x) {
            var heights = [];
            var oThis = this;
            var col = this.gridsColumns[x];
            if (typeof col !== "undefined") {
                _.each(oThis.gridsCells[x], function(cell, y) {
                    heights.push(parseInt(oThis.perOfHeight($(cell).height(), $(col).height())));
                });
                var newHeights = oThis.equalPers(heights, 100, 1);
                // console.log(heights);
                // console.log(newHeights);
                _.each(oThis.gridsCells[x], function(cell, y) {
                    $(cell).css({
                        "height": newHeights[y] + "%",
                    });
                    oThis.resizeCell(x, y, (newHeights[y] + "%"));
                });
            }
        }
        /**
         * this.returnStructure()<br/><br/> return a simple object of the grids structure (true where cell exists);
         * 
         * @function gridSplit.returnStructure
         * @return {string} JSON representative
         * @memberOf gridSplit
         */ 
        grid.returnStructure = function() {
            return JSON.stringify(this.gridsStructure);
        }
        /**
         * this.returnMeta()<br/><br/> return a complex object of the grids structure with heights and widths;
         * 
         * @function gridSplit.returnMeta
         * @return {string} JSON representative
         * @memberOf gridSplit
         */ 
        grid.returnMeta = function() {
            return JSON.stringify(this.metaAt);
        }
        /**
         * this.returnCells()<br/><br/> return an object of the grids cells
         * 
         * @function gridSplit.returnCells
         * @return {object} object of grids Cells.
         * @memberOf gridSplit
         */ 
        grid.returnCells = function() {
            return this.gridsCells;
        }
        /**
         * this.parent()<br/><br/> return the next grid up from what ever position inside a chained gridSplit operation
         * 
         * @function gridSplit.parent
         * @return {object} parents gridSplit instance.
         * @example
         * var grid = $('#grid').gridsplit().splitAt(0,0).splitAt(0,1,true); //grid is #grid-01's grid
         * var grid = $('#grid').gridsplit().splitAt(0,0).splitAt(0,1,true).parent(); //grid is #grid's grid
         *
         * @memberOf gridSplit
         */ 
        grid.parent = function() {
            return (this.settings.parentGrid === '' ? this : this.settings.parentGrid);
        }
        /**
         * this.destroy<br/><br/> remove the grid and all associated data
         * 
         * @function gridSplit.destroy
         * @return {undefined} undefined.
         * @memberOf gridSplit
         */
        grid.destroy = function(undefined) {
            this.$el.empty().removeData("grid");
            return undefined;
        }
        // call grid.init() on new gridSplit();
        grid.init(el, options);
    }
}));