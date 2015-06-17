/*! 
 * Script: jquery.gridSplit.min.js - v.0.0.1
 * Copyright: (c) 2015 Graham Dixon (assetinfo(MML))
 * Licensed: MIT
 * Depends on: jQuery && jQuery-ui, bootstrap 3.*
 */
;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery.
        // shim ../bower_components/jquery-ui/jquery-ui(draggable) to ../bower_components/jquery/src/jquery as jquery
        define(['jquery', 'jqueryui-draggable'], factory);
    } else {
        // No AMD. Register plugin with global jQuery objects.
        factory(jQuery, jQuery);
    }
}(function($, jui) {
    /**
     * $.fn.gridSplit - calls - new gridSplit(el, options) - using this as el.
     *
     * @param {object} el the $el this grid is being applied to [assumed when initialised via $.fn]
     * @param {object} options the settings being applied to this $el
     * @param {object} options.horizRail - horizontal rail $el to be cloned
     * @param {object} options.vertRail - vertical rail $el to be cloned
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
     * @param {bool} options.resizable - Is resizable?
     * @param {String} options.splitMethodH - Method to use when splitting cells horizontally ["half"|""]
     * @param {String} options.splitMethodV -  Method to use when splitting columns vertically ["half"|""]
     * @param {int} options.horizMin - Minimum cell height
     * @param {int} options.vertMin - Minimum column width
     * @param {Object} options.hideBorder - CSS obj to hide the border
     * @param {function} options.callFocusAndLoad - When reloading a grid this call is attempted on each cell
     * @param {function} options.callResetGrid - This function is attempted once the grid has been rebuilt
     * @param {function} options.callAfterMove - Stack some functions with the cells context / do something with the cells context
     * @param {function} options.callFinaliseMove - Invoke the calls you stacked / do something after all moves have finished
     * @param {function} options.callSetFocus - Pass the cells context to a function and do something with it
     * @param {function} options.callBeforeDestroy - Call attempted when .destroy() is called on a grid
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
                            grid = that.data('grid').setMeta(options['setMeta'], false);
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
            hasContentClass: "hasContent h100per",
            resizableClass: 'isResizable',
            draggingClass: 'dragging',
            data: '',
            parentGrid: '',
            nestedIn: '',
            resizable: true,
            splitMethodH: "",
            splitMethodV: "half",
            horizMin: 13,
            vertMin: 10,
            callFocusAndLoad: null,
            callResetGrid: null,
            callAfterMove: null,
            callFinaliseMove: null,
            callSetFocus: null,
            callBeforeDestroy: null,
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
         * @param {object} options.horizRail - horizontal rail $el to be cloned
         * @param {object} options.vertRail - vertical rail $el to be cloned
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
         * @param {bool} options.resizable - Is resizable?
         * @param {String} options.splitMethodH - Method to use when splitting cells horizontally ["half"|""]
         * @param {String} options.splitMethodV -  Method to use when splitting columns vertically ["half"|""]
         * @param {int} options.horizMin - Minimum cell height
         * @param {int} options.vertMin - Minimum column width
         * @param {Object} options.hideBorder - CSS obj to hide the border
         * @param {function} options.callFocusAndLoad - When reloading a grid this call is attempted on each cell
         * @param {function} options.callResetGrid - This function is attempted once the grid has been rebuilt
         * @param {function} options.callAfterMove - Stack some functions with the cells context / do something with the cells context
         * @param {function} options.callFinaliseMove - Invoke the calls you stacked / do something after all moves have finished
         * @param {function} options.callSetFocus - Pass the cells context to a function and do something with it
         * @param {function} options.callBeforeDestroy - Call attempted when .destroy() is called on a grid
         * @return {object} this
         * @property {object} this.settings - object of settings extended by options
         * @property {String} this.id - the grid elements ID
         * @property {object} this.$el - the grid $el
         * @property {object} this.el - the grid document node
         * @property {string} this.focusGrid - reference to ID
         * @property {object} this.gridsColumns - object of columns (only relevent to this grid)
         * @property {object} this.gridsCells - object of cells (only relevent to this grid)
         * @property {object} this.gridsStructure - object representing the simplified structure (all nested grid)
         * @property {object} this.timeoutFPH - object to hold timeouts for forcePercentHeight
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
            // $(window).on("resize", function() {
            //     oThis.centerInner(oThis)
            // });
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
            // make sure this meta will render a workable grid.
            function checkMeta(meta) {
                var metaOut = 0;
                // sometimes deleting a split cell can leave meta, if column[0]'s width is 100% [1] can be deleted
                // this statement might need running against the entire object / accounted for on .addColumn
                if (typeof meta[0][0] == "object") {
                    if ((meta[0][0]['h'] == "100%" && meta[0]['c']['w'] == "100%") && typeof meta[1] !== "undefined") {
                        delete(meta[1]);
                    }
                }
                // cell was previously split (This only happens on cell[0][0] because we restrict deletion of the firstcell in widgetManager)
                if (oThis.countCells(meta) == 1 && oThis.countCells(meta[0][0]) == 1 && oThis.countCells(meta[0]) == 1) {
                    metaOut = meta[0][0];
                }
                // keep iterating till we make no changes, then we know that metaOut is the true [0][0] starting point      
                return (metaOut == 0 ? meta : checkMeta(metaOut));
            }
            // data needs to be a clean metaAt object.
            data = checkMeta(data);
            $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    oThis.gridsStructure[x] = "need to set";
                    oThis.addColumn(x, undefined, true);
                    oThis.gridsColumns[x].css("float", "left");
                    // console.log("add Column " + x);
                    // each cell
                    if (oThis.countCells(column) > 0) {
                        $.each(column, function(y, cell) {
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
            // set widths/heights/found at from meta.
            oThis.setMeta(data);
            // only restart the grid on the top layer
            if (oThis == oThis.parent()) {
                if (typeof oThis.settings.callResetGrid == "function") {
                    oThis.settings.callResetGrid();
                }
            }
            return oThis;
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
            $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    if (typeof column['c'] !== "undefined") {
                        var wid = column['c']['w'];
                        oThis.gridsColumns[x].css("width", wid);
                        oThis.resizeColumn(x, wid);
                    }
                    if (oThis.countCells(column) > 0) {
                        $.each(column, function(y, cell) {
                            //console.log("x id: "+ x +", y is: "+ y)
                            if (typeof cell[0] === "object") {
                                if (typeof oThis.gridsCells[x][y] !== "undefined") {
                                    if (typeof oThis.gridsCells[x][y].data("grid") !== "undefined") {
                                        oThis.gridsCells[x][y].data("grid").setMeta(cell);
                                        oThis.gridsCells[x][y].css("height", cell['h']);
                                        oThis.resizeCell(x, y, cell['h']);
                                    }
                                }
                            } else {
                                if (typeof cell['fA'] !== "undefined") {
                                    if (cell['isFullScreen'] === true) {
                                        oThis.metaAt[x][y]['isFullScreen'] = true;
                                    }
                                    if (typeof cell['fSID'] !== "undefined") {
                                        oThis.metaAt[x][y]['fSID'] = cell['fSID'];
                                    }
                                    if (typeof oThis.gridsCells[x][y] !== "undefined") {
                                        oThis.gridsCells[x][y].css("height", cell['h']);
                                        oThis.resizeCell(x, y, cell['h']);
                                    }
                                    if (typeof oThis.settings.callFocusAndLoad === "function") {
                                        oThis.settings.callFocusAndLoad(oThis, x, y, cell['fA'], oThis.metaAt[x][y]['isFullScreen']);
                                    }
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
            $.each(arr, function(k, arrr) {
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
            var oThis = this;
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
                if (typeof this.metaAt[x][y] == "undefined") {
                    this.metaAt[x][y] = {};
                }
                el.data("gridAt", this);
                el.data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(y) + '}');
                this.addControls(this.gridsCells[x][y], x, y);
                if (oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell"));
                    var origHeight = oThis.parent().metaAt[cell["x"]][cell["y"]]['h'];
                    oThis.parent().metaAt[cell["x"]][cell["y"]] = oThis.metaAt;
                    oThis.parent().metaAt[cell["x"]][cell["y"]]['h'] = origHeight;
                    oThis.parent().gridsStructure[cell["x"]][cell["y"]] = oThis.gridsStructure;
                }
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
                this.metaAt[x] = {};
                this.gridsColumns[x] = el.data("tpe", "c");
                this.addControls(this.gridsColumns[x], x);
                if (oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell"));
                    var origHeight = oThis.parent().metaAt[cell["x"]][cell["y"]]['h'];
                    oThis.parent().metaAt[cell["x"]][cell["y"]] = oThis.metaAt;
                    oThis.parent().metaAt[cell["x"]][cell["y"]]['h'] = origHeight;
                    oThis.parent().gridsStructure[cell["x"]][cell["y"]] = oThis.gridsStructure;
                }
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
                    $.each(oThis.gridsCells[x], function(ly, acY) {
                        if (ly >= (y + 1)) {
                            reEx[(ly + 1)] = oThis.gridsCells[x][ly];
                            reExm[(ly + 1)] = oThis.metaAt[x][ly];
                            reExs[(ly + 1)] = oThis.gridsStructure[x][ly];
                            // cell here alter its .data("cell") attributes; +1 to y
                            reEx[(ly + 1)].data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(ly + 1) + '}');
                            // this should be called as an event   
                            if (typeof oThis.settings.callAfterMove === "function") {
                                oThis.settings.callAfterMove(oThis.id + '' + x + '' + ly, oThis.id + '' + x + '' + (ly + 1), oThis, x, (ly + 1));
                            }
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
                    if (typeof oThis.settings.callFinaliseMove === "function") {
                        oThis.settings.callFinaliseMove();
                    }
                }
                var first = oThis.gridsCells[x][y];
                var second = oThis.gridsCells[x][(y + 1)];
                var no = oThis.gridsCells[x].length;
                if (typeof first !== "undefined" && oThis.buildingGrid !== true && oThis.settings.splitMethodH == "half") {
                    var height = first.outerHeight();
                    // set height divides the firsts' height by the .length of gridCells[x]
                    var setHeight = oThis.halfOf(first, second, height, "h");
                    oThis.resizeCell(x, y, setHeight);
                    oThis.resizeCell(x, (y + 1), setHeight);
                    clearTimeout(oThis.timeoutFPH[x]);
                    oThis.timeoutFPH[x] = setTimeout(function() {
                        oThis.forcePerHeight(x);
                    });
                } else {
                    var setHeight = this.halfOf(first, second, 0, "h", oThis.gridsCells[x]);
                    // set all of the heights in the column by this value
                    $.each(this.gridsCells[x], function(ly, acY) {
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
                    // add opens after the move.
                    $.each(oThis.gridsColumns, function(lx, acX) {
                        if (lx >= (x + 1)) {
                            reEx[(lx + 1)] = oThis.gridsColumns[lx];
                            reExm[(lx + 1)] = oThis.metaAt[lx];
                            reExc[(lx + 1)] = oThis.gridsCells[lx];
                            reExs[(lx + 1)] = oThis.gridsStructure[lx];
                            // foreach cell here alter its .data("cell") attributes; + 1 to x
                            for (y = 0; y < reExc[(lx + 1)].length; y++) {
                                reExc[(lx + 1)][y].data("cell", '{"x":' + parseInt((lx + 1)) + ',"y":' + parseInt(y) + '}');
                                if (typeof oThis.settings.callAfterMove === "function") {
                                    oThis.settings.callAfterMove(oThis.id + '' + (lx) + '' + y, oThis.id + '' + (lx + 1) + '' + y, oThis, (lx + 1), y);
                                }
                            }
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
                    // fix the titles in the page header
                    if (typeof oThis.settings.callFinaliseMove === "function") {
                        oThis.settings.callFinaliseMove();
                    }
                }
                var first = oThis.gridsColumns[x];
                var second = oThis.gridsColumns[(x + 1)];
                var width = oThis.gridsColumns[x].width();
                // setWid is calculated by taking the width of the first dividing by two and applying that to both affected cols.
                // pass this (to obj in halfOf) at the end of this call to even the rows as theyre added
                if (oThis.settings.splitMethodV == "half") {
                    var setWid = oThis.halfOf(first, second, width, "w");
                } else {
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
                var content = el.children();
                // save reference to parents height and fA values
                if (typeof this.metaAt[x][y] !== "undefined") {
                    var h = this.metaAt[x][y]['h'];
                    var fA = this.metaAt[x][y]['fA'];
                    var widgetID = this.gridsCells[x][y].data("widgetID");
                }
                el.attr("id", (this.settings.nestedIn !== '' ? this.settings.nestedIn + "-" + this.id : this.id) + '-' + x + '' + y).css(this.settings.hideBorder).off("click").gridSplit({
                    "parentGrid": this,
                    "parentsX": x,
                    "parentsY": y,
                    "splitCellInColumn": true,
                    "callFocusAndLoad": this.settings.callFocusAndLoad,
                    "callResetGrid": null,
                    "callAfterMove": this.settings.callAfterMove,
                    "callFinaliseMove": this.settings.callFinaliseMove,
                    "callSetFocus": this.settings.callSetFocus,
                    "callBeforeDestroy": this.settings.callBeforeDestroy,
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
                // move the widget to the new cell at 0,0
                if (content.length == 1) {
                    if (content.hasClass("horizrail") == false) {
                        el.data("grid").gridsCells[0][0].addClass(this.settings.hasContentClass).append(content);
                    }
                } else if (content.length == 2) {
                    if ($(content[0]).hasClass("horizrail") == false) {
                        el.data("grid").gridsCells[0][0].addClass(this.settings.hasContentClass).append(content[0]);
                    } else {
                        el.data("grid").gridsCells[0][0].addClass(this.settings.hasContentClass).append(content[1]);
                    }
                }
                // set parents meta equal to child.
                this.metaAt[x][y] = el.data("grid").metaAt;
                this.metaAt[x][y]["h"] = h;
                $(el.data("grid").gridsCells[0][0]).data("widgetID", widgetID);
                // reset meta
                el.data("grid").setMetaAt(0, 0, {
                    "fA": fA,
                    "h": "100%"
                });
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
            if (typeof oThis.gridsColumns[x] !== "undefined") {
                if (typeof oThis.gridsCells[x][y] !== "undefined") {
                    if (oThis.gridsColumns.length > 0) {
                        if (oThis.gridsCells[x].length > 1) {
                            var el = oThis.gridsCells[x][y];
                            $('#h1-' + el.data("widgetID")).remove();
                            $('#h2-' + el.data("widgetID")).remove();
                            // keep reference to the column deffinition
                            $(window).off("resize.grid." + $(this.gridsCells[x][y]).data("widgetID"));
                            reExm['c'] = oThis.metaAt[x]['c'];
                            $.each(this.gridsCells[x], function(ly, acY) {
                                if (ly > y) {
                                    reEx[(ly - 1)] = oThis.gridsCells[x][ly];
                                    reExm[(ly - 1)] = oThis.metaAt[x][ly];
                                    reExs[(ly - 1)] = oThis.gridsStructure[x][ly];
                                    // cell here alter its .data("cell") attributes; -1 to y
                                    reEx[(ly - 1)].data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt((ly - 1)) + '}');
                                    if (typeof oThis.settings.callAfterMove === "function") {
                                        oThis.settings.callAfterMove(oThis.id + '' + (x) + '' + ly, oThis.id + '' + (x) + '' + (ly - 1), oThis, x, (ly - 1));
                                    }
                                    if (typeof reEx[(ly - 1)] !== "undefined") {
                                        $(window).trigger("resize.grid." + $(reEx[(ly - 1)]).data("widgetID"));
                                    } else {
                                        oThis.delCell(x, (ly - 1));
                                    }
                                } else {
                                    if (ly != y) {
                                        reEx[ly] = oThis.gridsCells[x][ly];
                                        reExm[ly] = oThis.metaAt[x][ly];
                                        reExs[ly] = oThis.gridsStructure[x][ly];
                                    }
                                }
                            });
                            oThis.gridsCells[x] = reEx;
                            oThis.metaAt[x] = reExm;
                            oThis.gridsStructure[x] = reExs;
                            oThis.forcePerHeight(x);
                            if (oThis !== oThis.parent()) {
                                var cell = JSON.parse(oThis.$el.data("cell"));
                                var origHeight = oThis.parent().metaAt[cell["x"]][cell["y"]]['h'];
                                oThis.parent().metaAt[cell["x"]][cell["y"]] = oThis.metaAt;
                                oThis.parent().metaAt[cell["x"]][cell["y"]]['h'] = origHeight;
                                oThis.parent().gridsStructure[cell["x"]][cell["y"]] = oThis.gridsStructure;
                            }
                            // fix the titles in the page header
                            if (typeof oThis.settings.callFinaliseMove === "function") {
                                oThis.settings.callFinaliseMove();
                            }
                            $(el).remove();
                        } else {
                            oThis.delColumn(x);
                        }
                    } else {
                        oThis.delColumn(x);
                    }
                }
            }
            return oThis;
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
            var el = oThis.gridsColumns[x];
            if (typeof oThis.gridsColumns[x] !== "undefined") {
                // console.log("del "+x);
                $.each(oThis.gridsColumns, function(lx, acX) {
                    if (lx > x) {
                        reEx[lx - 1] = oThis.gridsCells[lx];
                        reExm[lx - 1] = oThis.metaAt[lx];
                        reExs[lx - 1] = oThis.gridsStructure[lx];
                        reExc[lx - 1] = oThis.gridsColumns[lx];
                        // foreach cell here alter its .data("cell") attributes; - 1 to x
                        for (y = 0; y < reEx[(lx - 1)].length; y++) {
                            if (typeof reEx[(lx - 1)][y] !== "undefined") {
                                reEx[(lx - 1)][y].data("cell", '{"x":' + parseInt((lx - 1)) + ',"y":' + parseInt(y) + '}');
                                if (typeof oThis.settings.callAfterMove === "function") {
                                    oThis.settings.callAfterMove(oThis.id + '' + (lx) + '' + y, oThis.id + '' + (lx - 1) + '' + y, oThis, (lx - 1), y);
                                }
                            }
                        }
                        if (typeof reEx[(lx - 1)] !== "undefined") {
                            $(window).trigger("resize.grid." + $(reEx[(lx - 1)]).data("widgetID"));
                        } else {
                            oThis.delColumn((lx - 1));
                        }
                    } else {
                        if (lx != x) {
                            reEx[lx] = oThis.gridsCells[lx];
                            reExm[lx] = oThis.metaAt[lx];
                            reExs[lx] = oThis.gridsStructure[lx];
                            reExc[lx] = oThis.gridsColumns[lx];
                        }
                    }
                });
                $(el).remove();
                oThis.gridsCells = reEx;
                oThis.metaAt = reExm;
                oThis.gridsStructure = reExs;
                oThis.gridsColumns = reExc;
                if (oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell"));
                    var origHeight = oThis.parent().metaAt[cell["x"]][cell["y"]]['h'];
                    oThis.parent().metaAt[cell["x"]][cell["y"]] = oThis.metaAt;
                    oThis.parent().metaAt[cell["x"]][cell["y"]]['h'] = origHeight;
                    oThis.parent().gridsStructure[cell["x"]][cell["y"]] = oThis.gridsStructure;
                    oThis.parent().forcePerHeight(cell["x"]);
                }
                if (reEx.length == 0) {
                    if (typeof oThis.$el.data("cell") !== "undefined") {
                        var cell = JSON.parse(oThis.$el.data("cell"));
                        if (!isNaN(cell['x']) && !isNaN(cell['y'])) {
                            if (typeof oThis.parent().gridsCells[cell["x"]] !== "undefined") {
                                if (typeof oThis.parent().gridsCells[cell["x"]][cell["y"]] !== "undefined") {
                                    oThis.parent().delAt(cell["x"], cell["y"]);
                                }
                            }
                        }
                    }
                }
                // fix the titles in the page header
                if (typeof oThis.settings.callFinaliseMove === "function") {
                    oThis.settings.callFinaliseMove();
                }
                oThis.forcePerWidth();
            }
            return oThis;
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
            return ((typeof y == "undefined" || y == null) ? this.delColumn(x) : this.delCell(x, y));
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
            if (this.settings.resizable == true) {
                to.addClass(this.settings.resizableClass);
            }
            if ($(to).data("tpe") == "c") {
                // column == vertical
                if (x !== 0) {
                    var w = this.settings.gridColClass;
                    var rail = this.settings.vertRail;
                    var rRail = rail.clone();
                    rRail.appendTo(to);
                    rRail.on("mouseenter", function() {
                        var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                        if (typeof oThis.gridsColumns[x] == "undefined" || x == 0) {
                            rRail.remove();
                        }
                    }).draggable({
                        axis: 'x',
                        containment: to.parent(),
                        start: function(event, ui) {
                            // x value might change after init so check the number of previous columns
                            var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                            // this should be called as an event
                            if (typeof oThis.settings.callSetFocus == "function") {
                                oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x - 1][0]).data("cell")), oThis);
                            }
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
                            // make the current url fit the meta.
                            if (typeof oThis.settings.callSetHash == "function") {
                                oThis.settings.callSetHash();
                            }
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
                    rRail.on("mouseenter", function() {
                        var y = $(this).closest('.' + oThis.settings.gridCellClass).prevAll('.' + oThis.settings.gridCellClass).length;
                        var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                        if (typeof oThis.gridsCells[x][y] == "undefined" || y == 0) {
                            rRail.remove();
                        }
                    }).draggable({
                        containment: to.parent(),
                        axis: 'y',
                        start: function(event, ui) {
                            var y = $(this).closest('.' + oThis.settings.gridCellClass).prevAll('.' + oThis.settings.gridCellClass).length;
                            var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                            // this should be called as an event
                            if (typeof oThis.settings.callSetFocus == "function") {
                                oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x][y - 1]).data("cell")), oThis);
                            }
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
                            // make the current url fit the meta.
                            if (typeof oThis.settings.callSetHash == "function") {
                                oThis.settings.callSetHash();
                            }
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
            // convert to pix and set to data.
            var asPix = parseInt(((this.$el.width() / 100) * parseInt(to)).toFixed(0));
            this.gridsColumns[x].data("trueWidth", asPix);
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
            // convert to pix and set to data.
            var asPix = parseInt(((this.gridsColumns[x].height() / 100) * parseInt(to)).toFixed(0));
            var cell = this.gridsCells[x][y];
            cell.data("trueHeight", asPix);
            if (cell.find(".status").length > 0) {
                if ((cell.height() + cell.offset().top) < (cell.find(".status").offset().top + cell.find(".status").height() - 3)) {
                    cell.find(".status").css("opacity", "0");
                } else {
                    cell.find(".status").css("opacity", "1");
                }
            }
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
            var oThis = this;
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
            $(window).trigger("resize.grid");
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
                    if (this.settings.resizable == true) {
                        this.addRail(to, x, y);
                    }
                }
            } else {
                var w = this.settings.gridCellClass;
                var tpe = "r";
                var ctrls = [];
                if (y !== 0) {
                    if (this.settings.resizable == true) {
                        this.addRail(to, x, y);
                    }
                }
            }
            // events
            // to buttons.
            to.on("click", function() {
                oThis.clickThis(this, tpe, oThis);
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
        grid.clickThis = function(to, type, grids) {
            // just to handle an action against a cell. (example only) 
            if (type == "c") {
                var w = this.gridCol;
            } else {
                // console.log("clicking "+ $(to).data("cell"));
                var w = this.gridCell;
                // this should be called as an event
                // make the current url fit the meta.
                if (typeof grids.settings.callSetFocus === "function") {
                    grids.settings.callSetFocus(JSON.parse($(to).data("cell")), grids);
                }
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
            return per + "%";
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
                per = (100 / no) + "%",
                searchEl;
            // start from first in series then move to $.parent and find all others in one hit.
            if (this.settings.splitCellInColumn == true) {
                searchEl = "." + this.settings.useInsideCell;
            } else {
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
         * this.equalPers()<br/><br/> creates percentages that have to total target(100) by weighting the available items;
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
         * this.centerInner()<br/><br/> calculates the padding required to center a grid.
         *
         * @function gridSplit.centerInner
         * @param {object} thiss optional so you center an alternative grid
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
                    oThis.elInner.css("padding-left", (oThis.elInner.width() - realwidth) / 2 + "px");
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
            $.each(this.gridsColumns, function(key, col) {
                wids.push(parseInt(oThis.perOfWidth($(col).width())));
            });
            var newWids = this.equalPers(wids, 100, 0);
            // console.log(wids);
            // console.log(newWids);
            $.each(this.gridsColumns, function(key, col) {
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
                $.each(oThis.gridsCells[x], function(y, cell) {
                    heights.push(parseInt(oThis.perOfHeight($(cell).height(), $(col).height())));
                });
                var newHeights = oThis.equalPers(heights, 100, 1);
                // console.log(heights);
                // console.log(newHeights);
                $.each(oThis.gridsCells[x], function(y, cell) {
                    $(cell).css({
                        "height": newHeights[y] + "%",
                    });
                    oThis.resizeCell(x, y, (newHeights[y] + "%"));
                });
            }
        }
        /**
         * this.returnContent()<br/><br/> return content that exists within the cell;
         *
         * @function gridSplit.returnContent
         * @return {object} jQuery element
         * @memberOf gridSplit
         */
        grid.returnContent = function(cell) {
            var content = cell.children();
            // move the widget to the new cell at 0,0
            if (content.length == 1) {
                if (content.hasClass("horizrail") == false) {
                    var useContent = content.detach();
                }
            } else if (content.length == 2) {
                if ($(content[0]).hasClass("horizrail") == false) {
                    var useContent = $(content[0]).detach();
                } else {
                    var useContent = $(content[1]).detach();
                }
            }
            return useContent;
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
         * this.destroy<br/><br/> remove the grid and all associated data<br/>
         * this.settings.callBeforeDestroy - pass the object through a call prior to destruction, so you can save the contents of the cells
         *
         * @function gridSplit.destroy
         * @return {undefined} undefined.
         * @memberOf gridSplit
         */
        grid.destroy = function(undefined) {
            // this should be called as an event
            // console.log(isFullScreen);
            // dont want to save widgets on fullscreen, handled elsewhere.
            if (typeof this.settings.callBeforeDestroy == "function") {
                this.settings.callBeforeDestroy(this);
            }
            this.$el.empty().removeData("grid");
            return this.$el;
        }
        // call grid.init() on new gridSplit();
        grid.init(el, options);
    }
}));