/*!
 * Script: jquery.gridSplit.min.js - v.0.0.1
 * Copyright: (c) 2015 Graham Dixon (assetinfo(MML))
 * Licensed: MIT
 * Requires: jQuery && jQuery-ui-draggable
 */
;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery
        // shim ../bower_components/jquery-ui/jquery-ui(draggable) to ../bower_components/jquery/src/jquery as jquery
        define(['jquery', 'jqueryui-draggable'], factory);
    } else {
        // No AMD. Register plugin with global jQuery objects
        factory(jQuery, jQuery);
    }
}(function($, jui) {
    /**
     * $.fn.gridSplit - calls - new gridSplit(el, options) - using this as el
     *
     * @param {object} el the $el this grid is being applied to [assumed when initialised via $.fn]
     * @param {object} options the settings being applied to this $el
     * @param {object} options.horizRail - horizontal rail $el to be cloned
     * @param {object} options.vertRail - vertical rail $el to be cloned
     * @param {string} options.gridColumnClass - column class
     * @param {string} options.gridCellClass - cell class
     * @param {string} options.innerGridClass - inner grid class
     * @param {string} options.hasChildrenClass - cell has children class
     * @param {string} options.resizableClass - add class if resizable
     * @param {string} options.draggingClass - rail is being dragged class
     * @param {object} options.data - data to initialise the grid with
     * @param {object} options.setMeta - meta to be set against the current grid
     * @param {object} options.parentsGrid - the parent of the current grid
     * @param {string} options.nestedIn - the ID of the grid this grid is nested within
     * @param {bool} options.resizable - is this grid resizable?
     * @param {string} options.splitMethodH - method to use when splitting cells horizontally ['half'|'']
     * @param {string} options.splitMethodV -  method to use when splitting columns vertically ['half'|'']
     * @param {int} options.horizMin - minimum cell height
     * @param {int} options.vertMin - minimum column width
     * @param {bool} options.useContent - use html structure to build the grid
     * @param {object} options.hideBorder - CSS obj to hide a border
     * @param {function} options.callFocusLoad - when reloading a grid this call is attempted on each cell
     * @param {function} options.callResetGrid - this function is attempted once the grid has been rebuilt
     * @param {function} options.callAfterMove - stack some functions with the cells context / do something with the cells context
     * @param {function} options.callFinaliseMove - invoke the calls we stacked / do something after all moves have finished
     * @param {function} options.callSetFocus - pass the cells context to a function and do something with it when handleClick is triggered
     * @param {function} options.callAfterResize - pass the cells context to a function and do something with it after each window resize or cell/column resize
     * @param {function} options.callBeforeDestroy - call attempted when .destroy() is called on a grid
     * @class $.fn.gridSplit
     * @memberOf! $.fn
     */
    $.fn.gridSplit = (function(options) {
        var grid;
        if ($(this).length) {
            if (undefined == $(this).data('grid')) {
                grid = new gridSplit(this, options);
                $(this).data('grid', grid);
            } else {
                // do option based functions
                if (typeof options !== 'undefined') {
                    // allow recreate on .gridSplit({data:object});
                    if (typeof options['data'] !== 'undefined') {
                        grid = this.data('grid').init(this, options);
                    } else if (typeof options['setMeta'] !== 'undefined') {
                        grid = this.data('grid').setMeta(options['setMeta'], false);
                    } else {
                        grid = this.data('grid');
                    }
                } else {
                    grid = this.data('grid');
                }
            }
        }
        // return grid to enable chaining of gridSplit functions
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
            horizRail: $('<div/>').addClass('rail horizrail'),
            vertRail: $('<div/>').addClass('rail vertrail'),
            gridColumnClass: 'gridColumn',
            gridCellClass: 'gridCell',
            innerGridClass: 'innerGrid',
            insideCellClass: 'insideCell',
            hasChildrenClass: 'hasChildren',
            hasContentClass: 'hasContent',
            resizableClass: 'isResizable',
            draggingClass: 'dragging',
            resizable: true,
            data: '',
            nestedIn: '',
            parentsGrid: '',
            splitMethodH: '',
            splitMethodV: 'half',
            horizMin: 4,
            vertMin: 4,
            callFocusLoad: null,
            callResetGrid: null,
            callAfterMove: null,
            callSetFocus: null,
            callBeforeDestroy: null,
            callAfterResize: null,
            callFinaliseMove: null,
            useContent: false,
            hideBorder: {
                'border': '0px'
            }
        };
        /**
         * initialise the grid and apply the options contained in the passed in object
         *
         * @function gridSplit.init
         * @param {object} el the $element we are applying the grid to
         * @param {object} options the options being passed through to init from $(el).gridSplit(options) or new gridSplit(options)
         * @param {object} options.horizRail - horizontal rail $el to be cloned
         * @param {object} options.vertRail - vertical rail $el to be cloned
         * @param {string} options.gridColumnClass - column class
         * @param {string} options.gridCellClass - cell class
         * @param {string} options.innerGridClass - inner grid class
         * @param {string} options.hasChildrenClass - cell has children class
         * @param {string} options.draggingClass - rail is being dragged class
         * @param {string} options.resizableClass - add class if resizable
         * @param {object} options.data - data to initialise the grid with
         * @param {object} options.setMeta - meta to set against the current grid
         * @param {object} options.parentsGrid - the parent of the current grid
         * @param {string} options.nestedIn - the ID of the grid this grid is nested within
         * @param {bool} options.resizable - is this grid resizable?
         * @param {string} options.splitMethodH - method to use when splitting cells horizontally ['half'|'']
         * @param {string} options.splitMethodV -  method to use when splitting columns vertically ['half'|'']
         * @param {int} options.horizMin - minimum cell height
         * @param {int} options.vertMin - minimum column width
         * @param {bool} options.useContent - use html structure to build the grid
         * @param {object} options.hideBorder - CSS obj to hide a border
         * @param {function} options.callFocusLoad - when reloading a grid this call is attempted on each cell
         * @param {function} options.callResetGrid - this function is attempted once the grid has been rebuilt
         * @param {function} options.callAfterMove - stack some functions with the cells context / do something with the cells context
         * @param {function} options.callFinaliseMove - invoke the calls we stacked / do something after all moves have finished
         * @param {function} options.callSetFocus - pass the cells context to a function and do something with it when handleClick is triggered
         * @param {function} options.callAfterResize - pass the cells context to a function and do something with it after each window resize or cell/column resize
         * @param {function} options.callBeforeDestroy - call attempted when .destroy() is called on a grid
         * @return {object} this
         * @property {object} this.settings - object of settings extended by options
         * @property {string} this.id - the grid elements ID
         * @property {object} this.$el - the grid $el
         * @property {object} this.el - the grid documentElement
         * @property {object} this.gridsColumns - object of columns (only relevent to this grid)
         * @property {object} this.gridsCells - object of cells (only relevent to this grid)
         * @property {object} this.gridsStructure - object representing the simplified structure (all nested grids)
         * @property {object} this.metaAt - object of the complete structure and meta (all nested grids) to set against the grid
         * @memberOf gridSplit
         */
        grid.init = function(el, options) {
            var oThis = this;
            // extend defaults with options and set to settings
            this.settings = {};
            this.settings = $.extend({}, defaults, options);
            // assign constants to obj
            this.id = el.attr('id');
            this.$el = $('#' + this.id);
            this.el = this.$el[0];
            // empty structure
            this.gridsColumns = [];
            this.gridsCells = [];
            this.gridsStructure = [];
            this.metaAt = {};
            // build a data obj from the div.grid's content
            if (this.settings.useContent === true) {
                this.missingWHs = false;
                this.settings.data = oThis.constructData(oThis.$el, {});
                this.settings.backupCells = oThis.detachContent(oThis.$el, {});
            }
            // remove inner-grid to avoid multiple instances when setting data
            if (this === this.parent()) {
                this.$el.empty();
            }
            // new nested grid - breadcrumbed class
            if (this.settings.splitCellInColumn == true) {
                this.settings.useInsideCell = this.settings.insideCellClass + '' + this.settings.nestedIn;
            }
            // add a new inner
            this.elInner = $('<div />').addClass(this.settings.innerGridClass).appendTo(this.$el);
            // if we're not setting the data then build a single column and cell
            if (this.settings.data == '') {
                // to force the addCol/addCell function to go straight to setting these values
                this.gridsStructure[0] = null;
                this.addColumn(0);
                this.gridsStructure[0][0] = null;
                this.addCell(0, 0);
                // when where splitting a cell in a colum we need to split horizontally
                if (this.settings.splitCellInColumn == true) {
                    this.addColumn(0);
                }
            } else {
                // add grid data and set meta
                this.buildGrid(this.settings.data);
                this.reattachContent(this.settings.backupCells);
                // ensure the columns widths have been calculated proportionately
                this.forcePerWidth();
                // iterating collection to find cells
                $.each(this.settings.data, function(x, column) {
                    if (!isNaN(x)) {
                        // ensure the cells heights have been calculated proportionately
                        oThis.forcePerHeight(x);
                    }
                });
            }
            // ensure the inner element is showing (if not already visible)
            this.elInner.show();

            return this;
        }

        /**
         * this.buildGrid()<br/><br/>Build the grid when provided with {data:object} via .init(el, object)
         *
         * @function gridSplit.buildGrid
         * @param {string} data the provided JSON data
         * @param {string} undefined easy reference to an undefined var
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.buildGrid = function(data, undefined) {
            // use data to build grid
            var oThis = this;
            // show inner before build to correctly place widths/heights
            oThis.elInner.show();
            // each column
            oThis.buildingGrid = true;
            // traverse the object and build the structure
            $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    oThis.gridsStructure[x] = null;
                    oThis.addColumn(x);
                    oThis.gridsColumns[x].css('float', 'left');
                    // console.log("adding column " + x);
                    if (oThis.countKeys(column) > 0) {
                        $.each(column, function(y, cell) {
                            if (!isNaN(y)) {
                                // console.log("adding cell " + y);
                                oThis.addCell(x, y);
                                // console.log("cells data/meta:" + JSON.stringify(cell));
                                if (typeof cell[0] === 'object') {
                                    oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass);
                                    var el = oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y, cell);
                                }
                            }
                        });
                    } else {
                        oThis.addCell(x, 0);
                    }
                }
            });
            // set widths/heights/and any other meta data
            oThis.setMeta(data);
            // only restart the grid on the top layer
            if (oThis == oThis.parent()) {
                if (typeof oThis.settings.callResetGrid == 'function') {
                    oThis.settings.callResetGrid();
                }
            }
            return oThis;
        }
        /**
         * this.setMeta<br/><br/>Set the widths and height of the columns / cells when provided with a valid meta object
         *
         * @function gridSplit.setMeta
         * @param {object} data the data we are applying to the grid
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.setMeta = function(data) {
            var oThis = this;
            $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    if (typeof column['c'] !== 'undefined') {
                        var wid = column['c']['w'];
                        oThis.gridsColumns[x].css('width', wid);
                        oThis.resizeColumn(x, wid);
                    }
                    if (oThis.countKeys(column) > 0) {
                        $.each(column, function(y, cell) {
                            if (typeof cell[0] === 'object') {
                                if (typeof oThis.gridsCells[x][y] !== 'undefined') {
                                    if (typeof oThis.gridsCells[x][y].data('grid') !== 'undefined') {
                                        oThis.gridsCells[x][y].data('grid').setMeta(cell);
                                        oThis.resizeCell(x, y, cell['h']);
                                        oThis.gridsCells[x][y].css('height', cell['h']);
                                    }
                                }
                            } else {
                                if (typeof oThis.gridsCells[x][y] !== 'undefined') {
                                    oThis.metaAt[x][y] = cell;
                                    oThis.gridsCells[x][y].css('height', cell['h']);
                                    oThis.resizeCell(x, y, cell['h']);
                                }
                                if (typeof oThis.settings.callFocusLoad === 'function') {
                                    oThis.settings.callFocusLoad(oThis, x, y);
                                }
                            }
                        });
                    }
                }
            });
            oThis.buildingGrid = false;
            return this;
        }
        /**
         * this.constructData<br/><br/>Use the HTML content from within a grid and construct a useable object
         *
         * @function gridSplit.constructData
         * @param {object} $el the $element we're checking for content
         * @param {object} data the data object we're constructing
         * @return {object} data
         * @memberOf gridSplit
         */
        grid.constructData = function($el, data) {
            var oThis = this;
            var countCols = 0;
            $('div.' + oThis.settings.gridColumnClass + ' ', $el).first().parent().children().each(function() {
                var countKeys = 0;
                var width = $(this).attr("gs-width");
                if(typeof width === "undefined") {
                    oThis.missingWHs = true;
                }
                data[countCols] = {
                    "c": {
                        "w": width
                    }
                };
                $('div.' + oThis.settings.gridCellClass + ' ', $(this)).first().parent().children().each(function() {
                    var height = $(this).attr("gs-height");
                    if(typeof height === "undefined") {
                        oThis.missingWHs = true;
                    }
                    data[countCols][countKeys] = {};
                    data[countCols][countKeys]['h'] = height;
                    data[countCols][countKeys] = oThis.constructData($(this), data[countCols][countKeys]);
                    countKeys++;
                });
                countCols++;
            });
            return data;
        }
        /**
         * this.detachContent<br/><br/>Traverse the grids' subtree and detach all content into a useable object
         *
         * @function gridSplit.detachContent
         * @param {object} $el the $element we're detaching content from
         * @param {object} data the data object we're constructing
         * @return {object} data
         * @memberOf gridSplit
         */
        grid.detachContent = function($el, data) {
            var oThis = this;
            var countCols = 0;
            $('.' + oThis.settings.gridColumnClass, $el).first().parent().children().each(function() {
                var countKeys = 0;
                data[countCols] = {};
                $('.' + oThis.settings.gridCellClass, $(this)).first().parent().children().each(function() {
                    data[countCols][countKeys] = {};
                    if ($('.' + oThis.settings.gridColumnClass, $(this)).first().parent().children().length > 0) {
                        data[countCols][countKeys] = oThis.detachContent(this, data[countCols][countKeys]);
                    } else {
                        data[countCols][countKeys]['content'] = $(this).children().first().detach();
                    }
                    countKeys++;
                });
                countCols++;
            });
            return data;
        }
        /**
         * this.reattachContent<br/><br/>Re-attach content to a grid (using object like this.detachContent() output)
         *
         * @function gridSplit.reattachContent
         * @param {object} $el the $element we're attaching content to
         * @param {object} data the data object we're constructing
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.reattachContent = function(data) {
            var oThis = this;
            if (typeof data !== "undefined") {
                $.each(data, function(x, column) {
                    if (!isNaN(x)) {
                        if (oThis.countKeys(column) > 0) {
                            $.each(column, function(y, cell) {
                                if (typeof cell[0] === 'object') {
                                    if (typeof oThis.gridsCells[x][y] !== 'undefined') {
                                        if (typeof oThis.gridsCells[x][y].data('grid') !== 'undefined') {
                                            oThis.gridsCells[x][y].addClass(oThis.settings.hasContentClass).data('grid').reattachContent(cell);
                                        }
                                    }
                                } else {
                                    if (typeof oThis.gridsCells[x][y] !== 'undefined') {
                                        oThis.gridsCells[x][y].addClass(oThis.settings.hasContentClass).append(cell['content']);
                                    }
                                }
                            });
                        }
                    }
                });
                oThis.buildingGrid = false;
            }
            return this;
        }
        /**
         * this.addCell()<br/><br/>Add a cell at an x,y co-ordinate, appends to grid or inserts after x
         *
         * @function gridSplit.addCell
         * @param {int} x the target column
         * @param {int} y the target cell
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.addCell = function(x, y) {
            // add a cell by sharing the available height between all cells in the column
            var oThis = this,
                place;
            if (typeof x == 'undefined' || typeof y == 'undefined') {
                return this;
            }
            // set to structure length if x is less so can add to last using addCell(99999,99999)
            if ((this.gridsStructure.length - 1) < x) {
                x = this.gridsStructure.length - 1;
            }
            // if needs to set(null), already been through this.splitAt()
            // if cell exists then do a split at location
            // otherwise delete reference to the attempt and split the last in the object
            if (this.gridsStructure[x][y] == null) {
                // are we adding to the end of the column or in the middle
                if (this.gridsStructure[x].length !== y) {
                    if (typeof this.gridsCells[x][y - 1] !== 'undefined') {
                        place = this.gridsCells[x][y - 1];
                    } else {
                        place = this.gridsColumns[x];
                    }
                } else {
                    place = this.gridsColumns[x];
                }
                // inserting the actual cell
                el = $('<div class="' + this.settings.gridCellClass + ' ' + (this.settings.splitCellInColumn == true ? this.settings.insideCellClass + ' ' + this.settings.useInsideCell : '') + '" ></div>')
                if (place == this.gridsColumns[x]) {
                    el.appendTo(place);
                } else {
                    el.insertAfter(place);
                }
                this.gridsStructure[x][y] = true;
                this.gridsCells[x][y] = el;
                if (typeof this.metaAt[x][y] == 'undefined') {
                    this.metaAt[x][y] = {};
                }
                el.data('gridAt', this);
                el.data('cell', '{"x":' + parseInt(x) + ',"y":' + parseInt(y) + '}');
                this.addControls(x, y);
                if (oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data('cell'));
                    var origHeight = oThis.parent().metaAt[cell['x']][cell['y']]['h'];
                    oThis.parent().metaAt[cell['x']][cell['y']] = oThis.metaAt;
                    oThis.parent().metaAt[cell['x']][cell['y']]['h'] = origHeight;
                    oThis.parent().gridsStructure[cell['x']][cell['y']] = oThis.gridsStructure;
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
         * this.addColumn()<br/><br/>Add a column at position, appends to grid or inserts after x
         *
         * @function gridSplit.addColumn
         * @param {int} x the target column
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.addColumn = function(x) {
            // add a column by halving the target column.
            var oThis = this;
            if (typeof x == 'undefined') {
                return;
            }
            // if === needs to be set, already been through this.splitAt()
            // if column exists then do a split at location instead
            // otherwise delete reference to the attempt and split the last in the object
            if (this.gridsStructure[x] == null) {
                // are we adding to the end of the column or in the middle
                if (this.gridsStructure.length !== x) {
                    if (typeof this.gridsColumns[x - 1] !== 'undefined') {
                        place = this.gridsColumns[x - 1];
                    } else {
                        place = this.elInner;
                    }
                } else {
                    place = this.elInner;
                }
                // inserting the actual column
                var el = $('<div class="' + this.settings.gridColumnClass + '" ></div>')
                if (place == this.elInner) {
                    el.appendTo(place);
                } else {
                    el.insertAfter(place);
                }
                this.gridsStructure[x] = [];
                this.gridsCells[x] = [];
                this.metaAt[x] = {};
                this.gridsColumns[x] = el.data('type', 'column');
                this.addControls(x);
                if (oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data('cell'));
                    var origHeight = oThis.parent().metaAt[cell['x']][cell['y']]['h'];
                    oThis.parent().metaAt[cell['x']][cell['y']] = oThis.metaAt;
                    oThis.parent().metaAt[cell['x']][cell['y']]['h'] = origHeight;
                    oThis.parent().gridsStructure[cell['x']][cell['y']] = oThis.gridsStructure;
                } else {
                    oThis.metaAt[x]['c'] = {}
                    oThis.metaAt[x]['c']['w'] = '100%';
                }
            } else if ((this.gridsStructure.length) > x) {
                // split at provided
                this.splitAt(x);
            } else {
                // split last and delete reference to attempt
                this.splitAt(this.gridsStructure.length - 1);
                delete(this.gridsStructure[x]);
            }
            return this;
        }
        /**
         * this.splitAt()<br/><br/> provides a proxy to addColumn, addCell and splitCellInColumn
         *
         * @function gridSplit.splitAt
         * @param {int} x the target column (if no y provided, columns is split vertically)
         * @param {int} y the target cell (if y is provided, cell is split horizontally)
         * @param {bool} vert splitCellInColumn switch (if true is provided, cell is split vertically)
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.splitAt = function(x, y, vert) {
            // split the column([x] - vertically)[ .splitAt(0)]
            // split the cell ([x][y] - horizontally)[ .splitAt(0,0)]
            // split the cell ([x][y] - vertically)[ .splitAt(0,0,true)]
            var oThis = this;
            // function to check descendents after a move to ensure ID integrity
            var updateIdThenCallAfterMoveTimeout;
            var updateIdThenCallAfterMove = function(startingPoint, x, y, fixIDFrom, fixIDTo) {
                if (typeof startingPoint !== 'undefined') {
                    if (typeof updateIdThenCallAfterMoveTimeout !== 'undefined') {
                        clearTimeout(updateIdThenCallAfterMoveTimeout);
                    }
                    if (startingPoint.gridsCells.length > 0) {
                        var orig = startingPoint.id;
                        // Unique ID's solve problems with over-lapping grid.id-xy combinations
                        startingPoint.id = startingPoint.settings.nestedIn + '-' + startingPoint.parent().id + '-' + x + y + '-' + Date.now();
                        startingPoint.id = startingPoint.id.replace(fixIDFrom, fixIDTo);
                        $(startingPoint.el).attr('id', startingPoint.id);
                        // return if the startingPoint has no columns. etc...
                        if (typeof startingPoint.gridsColumns !== 'undefined') {
                            for (i = 0; i < startingPoint.gridsColumns.length; i++) {
                                if (typeof startingPoint.gridsCells[i] === 'object') {
                                    var spLen = startingPoint.gridsCells[i].length;
                                    if (spLen >= 0) {
                                        // iterating nested collection calling after move and then calling _self
                                        for (iy = 0; iy < spLen; iy++) {
                                            if (typeof startingPoint.gridsCells[i] !== 'undefined' && typeof startingPoint.gridsCells[i][iy] !== 'undefined') {
                                                var nextStartingPoint = startingPoint.gridsCells[i][iy].data('grid');
                                                // this event is called when ever a cell is moved...
                                                if (typeof startingPoint.settings.callAfterMove === 'function') {
                                                    startingPoint.settings.callAfterMove(orig + '' + i + '' + iy, startingPoint.id + '' + i + '' + iy, startingPoint, i, iy, i, iy);
                                                }
                                                // keep moving down the nest
                                                updateIdThenCallAfterMove(nextStartingPoint, i, iy, fixIDFrom, fixIDTo);
                                                // timeout to make sure we only finalise the effects of callAfterMove once.
                                                if (typeof startingPoint.settings.callFinaliseMove === 'function') {
                                                    updateIdThenCallAfterMoveTimeout = setTimeout(function() {
                                                        startingPoint.settings.callFinaliseMove();
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (typeof y !== 'undefined') {
                // spliting the cell vertically
                if (typeof vert !== 'undefined') {
                    oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass);
                    return oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y);
                }
                // spliting the cell horizontally
                if ((y + 1) == oThis.gridsStructure[x].length) {
                    // tell cell it needs to set.
                    oThis.gridsStructure[x][y + 1] = null;
                    oThis.addCell(x, (y + 1));
                } else {
                    // shift everything after y in x right to make space
                    var reEx = [];
                    var reExm = {};
                    var reExs = [];
                    // need to keep reference to col width
                    reExm['c'] = oThis.metaAt[x]['c'];
                    $.each(oThis.gridsCells[x], function(ly, acY) {
                        if (ly >= (y + 1)) {
                            reEx[ly + 1] = oThis.gridsCells[x][ly];
                            reExm[ly + 1] = oThis.metaAt[x][ly];
                            reExs[ly + 1] = oThis.gridsStructure[x][ly];
                            // cell here alter its .data('cell') attributes; +1 to y
                            reEx[ly + 1].data('cell', '{"x":' + parseInt(x) + ',"y":' + parseInt(ly + 1) + '}');
                            if (typeof oThis.settings.callAfterMove === 'function') {
                                oThis.settings.callAfterMove(oThis.id + '' + x + '' + ly, oThis.id + '' + x + '' + (ly + 1), oThis, x, (ly + 1), x, ly);
                            }
                            var startingPoint = reEx[ly + 1].data('grid');
                            if (typeof startingPoint !== 'undefined') {
                                startingPoint.settings.parentsGrid = oThis;
                                startingPoint.settings.parentsX = parseInt(x);
                                startingPoint.settings.parentsY = parseInt(ly + 1);
                                var fixIDFrom = startingPoint.id + '-' + x + '' + ly;
                                var fixIDTo = startingPoint.id + '-' + x + '' + (ly + 1);
                                // make sure IDs persist against the cell and any other references
                                updateIdThenCallAfterMove(startingPoint, x, ly + 1, fixIDFrom, fixIDTo);
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
                    oThis.gridsStructure[x][y + 1] = null;
                    oThis.addCell(x, (y + 1));
                    if (typeof oThis.settings.callFinaliseMove === 'function') {
                        oThis.settings.callFinaliseMove();
                    }
                }
                var first = oThis.gridsCells[x][y];
                var second = oThis.gridsCells[x][y + 1];
                var no = oThis.gridsCells[x].length;
                if (typeof first !== 'undefined' && oThis.buildingGrid !== true && oThis.settings.splitMethodH == 'half') {
                    var height = (oThis.metaAt[x][y]['h'] ? parseFloat(oThis.metaAt[x][y]['h']) : 100);
                    // set height divides the firsts' height by the .length of gridCells[x]
                    var setHeight = oThis.halfOf(first, second, height, 'h');
                    oThis.resizeCell(x, y, setHeight);
                    oThis.resizeCell(x, (y + 1), setHeight);
                } else {
                    var setHeight = this.halfOf(first, second, 0, 'h', x);
                    // set all of the heights in the column by this value
                    $.each(this.gridsCells[x], function(ly, acY) {
                        oThis.resizeCell(x, ly, setHeight);
                    });
                }
            } else {
                // splitting the column virticaly
                if ((x + 1) == oThis.gridsStructure.length) {
                    // conditions are good get straight to splitting
                    oThis.gridsStructure[x + 1] = null;
                    oThis.addColumn((x + 1));
                } else {
                    // make space available by shifting everything after x right
                    var reEx = [];
                    var reExm = {};
                    var reExc = [];
                    var reExs = [];
                    // add opens after the move.
                    $.each(oThis.gridsColumns, function(lx, acX) {
                        if (lx >= (x + 1)) {
                            reEx[lx + 1] = oThis.gridsColumns[lx];
                            reExm[lx + 1] = oThis.metaAt[lx];
                            reExc[lx + 1] = oThis.gridsCells[lx];
                            reExs[lx + 1] = oThis.gridsStructure[lx];
                            // foreach cell here alter its .data('cell') attributes; + 1 to x
                            for (y = 0; y < reExc[lx + 1].length; y++) {
                                reExc[lx + 1][y].data('cell', '{"x":' + parseInt(lx + 1) + ',"y":' + parseInt(y) + '}');
                                if (typeof oThis.settings.callAfterMove === 'function') {
                                    oThis.settings.callAfterMove(oThis.id + '' + (lx) + '' + y, oThis.id + '' + (lx + 1) + '' + y, oThis, (lx + 1), y, lx, y);
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
                    oThis.gridsStructure[x + 1] = null;
                    oThis.addColumn((x + 1));
                    // fix the titles in the page header
                    if (typeof oThis.settings.callFinaliseMove === 'function') {
                        oThis.settings.callFinaliseMove();
                    }
                }
                var first = oThis.gridsColumns[x];
                var second = oThis.gridsColumns[x + 1];
                if (typeof oThis.metaAt[x]['c'] !== 'undefined') {
                    var width = parseFloat(oThis.metaAt[x]['c']['w'] ? oThis.metaAt[x]['c']['w'] : 100);
                } else {
                    var width = 100;
                }
                // setWid is calculated by taking the width of the first dividing by two and applying that to both affected cols
                // pass this (to obj in halfOf) at the end of this call to even the rows as theyre added
                if (oThis.settings.splitMethodV == 'half') {
                    var setWid = oThis.halfOf(first, second, width, 'w');
                } else {
                    var setWid = oThis.halfOf(first, second, width, 'w', 1);
                }
                oThis.resizeColumn(x, setWid);
                oThis.resizeColumn((x + 1), setWid);
                // column needs a cell, tell it that it needs to set.
                oThis.gridsStructure[x + 1][0] = null;
                oThis.addCell((x + 1), 0);
            }
            return oThis;
        }
        /**
         * this.splitCellInColumn()<br/><br/> initialises another grid within a grid
         *
         * @function gridSplit.splitCellInColumn
         * @param {object} el the target gridsCell we will be adding a grid to
         * @param {int} x the target column (if no y provided, columns is split vertically)
         * @param {int} y the target cell (if y is provided, cell is split horizontally)
         * @param {object} data if the call is being made by buildGrid then data will be set which will again trigger buildGrid on this grids init
         * @return {object} el.data('grid') grid instance
         * @memberOf gridSplit
         */
        grid.splitCellInColumn = function(el, x, y, data) {
            // use .data('grid') here to reference inner grid
            var content = this.returnContent(el);
            // save reference to parents meta data
            if (typeof this.metaAt[x][y] !== 'undefined') {
                var oldMeta = this.metaAt[x][y];
            }
            // add an ID to the cell so that a new grid can be initialised on it
            el.attr('id', (this.settings.nestedIn !== '' ? this.settings.nestedIn + '-' + this.id : this.id) + '-' + x + '' + y + Date.now()).css(this.settings.hideBorder).off('click').gridSplit({
                parentsGrid: this,
                parentsX: x,
                parentsY: y,
                splitCellInColumn: true,
                splitMethodH: this.settings.splitMethodH,
                splitMethodV: this.settings.splitMethodV,
                horizMin: this.settings.horizMin,
                vertMin: this.settings.vertMin,
                callFocusLoad: this.settings.callFocusLoad,
                callResetGrid: null,
                callAfterMove: this.settings.callAfterMove,
                callFinaliseMove: this.settings.callFinaliseMove,
                callSetFocus: this.settings.callSetFocus,
                callSetHash: this.settings.callSetHash,
                callAfterResize: this.settings.callAfterResize,
                callBeforeDestroy: this.settings.callBeforeDestroy,
                nestedIn: (this.settings.nestedIn !== '' ? this.settings.nestedIn + '-' + this.id : this.id),
                data: (typeof data !== 'undefined') ? data : '',
                resizable: this.settings.resizable,
            });
            if (typeof(this.gridsStructure[x][y] == 'undefined')) {
                this.gridsStructure[x][y] = {};
            }
            // connect structure and meta to parent grid, let em bubble to the top grid instance
            // access cells grid by using .data('grid') on the cell ( .returnCells()[x][y] )
            this.gridsStructure[x][y] = el.data('grid').gridsStructure;
            if (typeof this.metaAt[x] === 'undefined') {
                this.metaAt[x] = {};
                this.metaAt[x]['c'] = {};
            }
            // move the widget to the new cell at 0,0
            if (typeof content !== 'undefined' && $(content).length) {
                el.data('grid').gridsCells[0][0].addClass(this.settings.hasContentClass).append(content);
            }
            // set new cells meta equal to parent
            this.metaAt[x][y] = el.data('grid').metaAt;
            // height of 0,0 needs to fill parent
            oldMeta['h'] = '100%';
            // reset meta
            el.data('grid').setMetaAt(0, 0, oldMeta);
            return el.data('grid');
        }
        /**
         * this.delCell()<br/><br/> allows for the deletion of a cell
         *
         * @function gridSplit.delCell
         * @param {int} x the target cells column
         * @param {int} y the target cells position in that column
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.delCell = function(x, y) {
            // shift everything after y in x left and remove the element and references
            var oThis = this;
            var makeResize = false;
            var reEx = [];
            var reExm = {};
            var reExs = [];
            if (typeof oThis.gridsColumns[x] !== 'undefined') {
                if (typeof oThis.gridsCells[x][y] !== 'undefined') {
                    if (oThis.gridsColumns.length > 0) {
                        if (oThis.gridsCells[x].length > 1) {
                            var el = oThis.gridsCells[x][y];
                            $('#h1-' + el.data('widgetID')).remove();
                            $('#h2-' + el.data('widgetID')).remove();
                            // keep reference to the column deffinition
                            $(window).off('resize.grid.' + $(this.gridsCells[x][y]).data('widgetID'));
                            reExm['c'] = oThis.metaAt[x]['c'];
                            $.each(this.gridsCells[x], function(ly, acY) {
                                if (ly > y) {
                                    reEx[ly - 1] = oThis.gridsCells[x][ly];
                                    reExm[ly - 1] = oThis.metaAt[x][ly];
                                    reExs[ly - 1] = oThis.gridsStructure[x][ly];
                                    // cell here alter its .data('cell') attributes; -1 on y
                                    reEx[ly - 1].data('cell', '{"x":' + parseInt(x) + ',"y":' + parseInt(ly - 1) + '}');
                                    var startingPoint = reEx[ly - 1].data('grid');
                                    if (typeof startingPoint !== 'undefined') {
                                        startingPoint.settings.parentsGrid = oThis;
                                        startingPoint.settings.parentsX = parseInt(x);
                                        startingPoint.settings.parentsY = parseInt(ly - 1);
                                    }
                                    if (typeof oThis.settings.callAfterMove === 'function') {
                                        oThis.settings.callAfterMove(oThis.id + '' + (x) + '' + ly, oThis.id + '' + (x) + '' + (ly - 1), oThis, x, (ly - 1), x, ly);
                                    }
                                    if (typeof reEx[ly - 1] !== 'undefined') {
                                        $(window).trigger('resize.grid.' + $(reEx[ly - 1]).data('widgetID'));
                                    } else {
                                        oThis.delCell(x, (ly - 1));
                                    }
                                } else {
                                    if (ly != y) {
                                        reEx[ly] = oThis.gridsCells[x][ly];
                                        reExm[ly] = oThis.metaAt[x][ly];
                                        reExs[ly] = oThis.gridsStructure[x][ly];
                                    } else {
                                        // add this height to the cell above
                                        if ((ly - 1) >= 0 && oThis.settings.splitMethodH == 'half') {
                                            var newHeight = (parseFloat(oThis.metaAt[x][ly]['h']) + parseFloat(oThis.metaAt[x][ly - 1]['h'])) + '%';
                                            oThis.metaAt[x][ly - 1]['h'] = newHeight;
                                            oThis.gridsCells[x][ly - 1].css('height', newHeight);
                                        } else if ((ly - 1) < 0 || oThis.settings.splitMethodH !== 'half') {
                                            makeResize = true;
                                        }
                                    }
                                }
                            });
                            oThis.gridsCells[x] = reEx;
                            oThis.metaAt[x] = reExm;
                            oThis.gridsStructure[x] = reExs;
                            if (oThis !== oThis.parent()) {
                                var cell = JSON.parse(oThis.$el.data('cell'));
                                var origHeight = oThis.parent().metaAt[cell['x']][cell['y']]['h'];
                                oThis.parent().metaAt[cell['x']][cell['y']] = oThis.metaAt;
                                oThis.parent().metaAt[cell['x']][cell['y']]['h'] = origHeight;
                                oThis.parent().gridsStructure[cell['x']][cell['y']] = oThis.gridsStructure;
                            }
                            // notify that all moves have finsihed
                            if (typeof oThis.settings.callFinaliseMove === 'function') {
                                oThis.settings.callFinaliseMove();
                            }
                            $(el).remove();
                            if (makeResize) {
                                oThis.forcePerHeight(x)
                            }
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
         * this.delColumn()<br/><br/> allows for the deletion of a column
         *
         * @function gridSplit.delColumn
         * @param {int} x the target column
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.delColumn = function(x) {
            // shift everything after x left and remove the element and references
            var oThis = this;
            var makeResize = false;
            var reEx = [];
            var reExm = {};
            var reExs = [];
            var reExc = [];
            var el = oThis.gridsColumns[x];
            if (typeof oThis.gridsColumns[x] !== 'undefined') {
                $.each(oThis.gridsColumns, function(lx, acX) {
                    if (lx > x) {
                        reEx[lx - 1] = oThis.gridsCells[lx];
                        reExm[lx - 1] = oThis.metaAt[lx];
                        reExs[lx - 1] = oThis.gridsStructure[lx];
                        reExc[lx - 1] = oThis.gridsColumns[lx];
                        // foreach cell here alter its .data('cell') attributes; - 1 on x
                        for (y = 0; y < reEx[lx - 1].length; y++) {
                            if (typeof reEx[lx - 1][y] !== 'undefined') {
                                reEx[lx - 1][y].data('cell', '{"x":' + parseInt(lx - 1) + ',"y":' + parseInt(y) + '}');
                                if (typeof oThis.settings.callAfterMove === 'function') {
                                    oThis.settings.callAfterMove(oThis.id + '' + (lx) + '' + y, oThis.id + '' + (lx - 1) + '' + y, oThis, (lx - 1), y, lx, y);
                                }
                            }
                        }
                        if (typeof reEx[lx - 1] !== 'undefined') {
                            $(window).trigger('resize.grid.' + $(reEx[lx - 1]).data('widgetID'));
                        } else {
                            oThis.delColumn((lx - 1));
                        }
                    } else {
                        if (lx != x) {
                            reEx[lx] = oThis.gridsCells[lx];
                            reExm[lx] = oThis.metaAt[lx];
                            reExs[lx] = oThis.gridsStructure[lx];
                            reExc[lx] = oThis.gridsColumns[lx];
                            // cells might still have been moved if their parent-grid was destroyed
                            if (typeof oThis.settings.callAfterMove === 'function') {
                                for (y = 0; y < reEx[lx].length; y++) {
                                    oThis.settings.callAfterMove(oThis.id + '' + (lx) + '' + y, oThis.id + '' + lx + '' + y, oThis, lx, y, lx, y);
                                }
                            }
                        } else {
                            // add this width to the col on the left.
                            if ((lx - 1) >= 0 && oThis.settings.splitMethodV == 'half') {
                                var newWid = (parseFloat(oThis.metaAt[lx]['c']['w']) + parseFloat(oThis.metaAt[lx - 1]['c']['w'])) + '%';
                                oThis.metaAt[lx - 1]['c']['w'] = newWid;
                                oThis.gridsColumns[lx - 1].css('width', newWid);
                            } else if ((lx - 1) < 0 || oThis.settings.splitMethodV !== 'half') {
                                makeResize = true;
                            }
                        }
                    }
                });
                $(el).remove();
                oThis.gridsCells = reEx;
                oThis.metaAt = reExm;
                oThis.gridsStructure = reExs;
                oThis.gridsColumns = reExc;
                if (oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data('cell'));
                    var origHeight = oThis.parent().metaAt[cell['x']][cell['y']]['h'];
                    oThis.parent().metaAt[cell['x']][cell['y']] = oThis.metaAt;
                    oThis.parent().metaAt[cell['x']][cell['y']]['h'] = origHeight;
                    oThis.parent().gridsStructure[cell['x']][cell['y']] = oThis.gridsStructure;
                }
                if (reEx.length == 0) {
                    if (typeof oThis.$el.data('cell') !== 'undefined') {
                        var cell = JSON.parse(oThis.$el.data('cell'));
                        if (!isNaN(cell['x']) && !isNaN(cell['y'])) {
                            if (typeof oThis.parent().gridsCells[cell['x']] !== 'undefined') {
                                if (typeof oThis.parent().gridsCells[cell['x']][cell['y']] !== 'undefined') {
                                    oThis.parent().delAt(cell['x'], cell['y']);
                                }
                            }
                        }
                    }
                }
                if (makeResize) {
                    oThis.forcePerWidth();
                }
                // notify that all moves have finsihed
                if (typeof oThis.settings.callFinaliseMove === 'function') {
                    oThis.settings.callFinaliseMove();
                }
            }
            return oThis;
        }
        /**
         * this.delAt()<br/><br/> provides a proxy to delColumn and delCell
         *
         * @function gridSplit.delAt
         * @param {int} x the target cells column
         * @param {int} y the target cells position in that column
         * @return {object} this
         * @memberOf gridSplit
         */
        grid.delAt = function(x, y) {
            return ((typeof y == 'undefined' || y == null) ? this.delColumn(x) : this.delCell(x, y));
        }
        /**
         * this.addRail()<br/><br/> adds rails to cells/columns if this.settings.resizable is true
         *
         * @function gridSplit.addRail
         * @param {int} x the target cells column
         * @param {int} y the target cells position in that column
         * @memberOf gridSplit
         */
        grid.addRail = function(x, y) {
            // different rails for horiz and vert, comments should detail the approach...
            var oThis = this;
            var to = (typeof y !== "undefined" ? oThis.gridsCells[x][y] : oThis.gridsColumns[x]);
            // if it has the resize class then this cell/column has already got a rail
            if (!to.hasClass(this.settings.resizableClass)) {
                // add resize class
                to.addClass(this.settings.resizableClass);
                if ($(to).data('type') == 'column') {
                    // column == vertical
                    if (x !== 0 && x !== '0') {
                        var w = this.settings.gridColumnClass;
                        var rail = this.settings.vertRail;
                        var rRail = rail.clone();
                        rRail.appendTo(to);
                        rRail.on('mouseenter', function() {
                            var x = $(this).closest('.' + oThis.settings.gridColumnClass).prevAll('.' + oThis.settings.gridColumnClass).length;
                            if (typeof oThis.gridsColumns[x] == 'undefined' || x == 0) {
                                rRail.remove();
                            }
                        }).draggable({
                            axis: 'x',
                            containment: to.parent(),
                            start: function(event, ui) {
                                // x value might change after init so check the number of previous columns
                                var x = $(this).closest('.' + oThis.settings.gridColumnClass).prevAll('.' + oThis.settings.gridColumnClass).length;
                                // set the foucs using a callback function provided at init
                                if (typeof oThis.settings.callSetFocus == 'function') {
                                    oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x - 1][0]).data('cell')), oThis);
                                }
                                if (typeof oThis.gridsColumns[x] !== 'undefined' && x !== 0) {
                                    rRail.data('x', x);
                                    // rail sits inside the cell to the right of the cell it will reference
                                    var railReferstoRightOf = oThis.gridsColumns[x - 1];
                                    // measure between the two elements that we know exist, x and x-1
                                    // take away grids offset to compensate on nested grids
                                    rRail.origRight = oThis.gridsColumns[x].offset().left - oThis.$el.offset().left;
                                    rRail.origLeft = oThis.gridsColumns[x - 1].offset().left - oThis.$el.offset().left;
                                    // makes the original width
                                    rRail.origWidth = rRail.origRight - rRail.origLeft;
                                    // add dragging class so we can style on the drag
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
                                oThis.gridsColumns[$(this).data('x') - 1].css('width', rWidth);
                                // take (pixels / no.of nextAll columns) away from nextAll total columns .width(), and convert to %
                                var rem = oThis.gridsColumns.length - ($(this).data('x'));
                                var takePer = (pixels - rRail.origWidth) / rem;
                                if (rem > 0) {
                                    for (x = $(this).data('x'); x < oThis.gridsColumns.length; x++) {
                                        var thisWid = oThis.gridsColumns[x].outerWidth();
                                        var thisnewWid = thisWid - takePer;
                                        oThis.gridsColumns[x].css('width', oThis.perOfWidth(thisnewWid));
                                    }
                                    // look across all widths and make sure they fill 100%
                                    oThis.forcePerWidth();
                                }
                                // put the rail back to auto default position
                                $(this).css('left', 'auto');
                                // notify calling function that grids.returnMeta() has altered
                                if (typeof oThis.settings.callSetHash == 'function') {
                                    oThis.settings.callSetHash();
                                }
                            }
                        });
                    }
                } else {
                    if (y !== 0 && y !== '0') {
                        var w = this.settings.gridCellClass;
                        var rail = this.settings.horizRail;
                        var rRail = rail.clone();
                        rRail.appendTo(to);
                        var oThis = this;
                        rRail.on('mouseenter', function() {
                            var y = $(this).closest('.' + oThis.settings.gridCellClass).prevAll('.' + oThis.settings.gridCellClass).length;
                            var x = $(this).closest('.' + oThis.settings.gridColumnClass).prevAll('.' + oThis.settings.gridColumnClass).length;
                            if (typeof oThis.gridsCells[x][y] == 'undefined' || y == 0) {
                                rRail.remove();
                            }
                        }).draggable({
                            containment: to.parent(),
                            axis: 'y',
                            start: function(event, ui) {
                                var y = $(this).closest('.' + oThis.settings.gridCellClass).prevAll('.' + oThis.settings.gridCellClass).length;
                                var x = $(this).closest('.' + oThis.settings.gridColumnClass).prevAll('.' + oThis.settings.gridColumnClass).length;
                                // set the foucs using a callback function provided at init
                                if (typeof oThis.settings.callSetFocus == 'function') {
                                    oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x][y - 1]).data('cell')), oThis);
                                }
                                // cant move a rail at 0,0 (but it shouldnt exist anyway)
                                if (typeof oThis.gridsCells[x][y] !== 'undefined' && y !== 0) {
                                    rRail.data('x', x);
                                    rRail.data('y', y);
                                    $(this).addClass(oThis.settings.draggingClass);
                                } else {
                                    // removes the rail if its left behind from a deleted cell
                                    rRail.remove();
                                }
                            },
                            stop: function(e, ui) {
                                var moved = (ui.position.top - ui.originalPosition.top);
                                var y = $(this).data('y'),
                                    x = $(this).data('x'),
                                    newBottom = $(this).offset().top,
                                    newHeight = oThis.gridsCells[x][(y - 1)].outerHeight() + moved; // correct the height on the element being altered
                                // get the real % height using the newHeight against the gridHeight
                                var rHeight = oThis.perOfHeight(newHeight);
                                // set the new height to the elememt
                                oThis.resizeCell(x, (y - 1), rHeight);
                                oThis.gridsCells[x][(y - 1)].css('height', rHeight);
                                // then do similar (newHeight - moved) to the box above the rail, all others should go un-altertered
                                newHeight = oThis.gridsCells[x][y].outerHeight() - moved;
                                rHeight = oThis.perOfHeight(newHeight);
                                oThis.resizeCell(x, y, rHeight);
                                oThis.gridsCells[x][y].css('height', rHeight);
                                // put the rail back to auto default position
                                $(this).css('top', 'auto');
                                // look across all heights and make sure they fill 100%
                                oThis.forcePerHeight(x);
                                // notify calling function that grids.returnMeta() has altered.
                                if (typeof oThis.settings.callSetHash == 'function') {
                                    oThis.settings.callSetHash();
                                }
                            }
                        });
                    }
                }
                $(window).trigger('resize.grid');
            }
        }
        /**
         * this.handleClick()<br/><br/> bind click event to a cell
         *
         * @function gridSplit.handleClick
         * @param {object} to the target element
         * @param {string} type the target element type ['cell' | 'column']
         * @memberOf gridSplit
         */
        grid.handleClick = function(to, type) {
            var oThis = this;
            // only handles a click action against a cell
            if (type === 'cell') {
                if (typeof oThis.settings.callSetFocus === 'function') {
                    oThis.settings.callSetFocus(JSON.parse($(to).data('cell')), oThis);
                }
            }
        }
        /**
         * this.addControls()<br/><br/> add controls to either column or cell
         *
         * @function gridSplit.addControls
         * @param {int} x the target cells column
         * @param {int} y the target cells position in that column
         * @memberOf gridSplit
         */
        grid.addControls = function(x, y) {
            // add a control set.
            var oThis = this;
            var to = (typeof y !== "undefined" ? oThis.gridsCells[x][y] : oThis.gridsColumns[x]);
            // est type - add rails if resizable && add click to cell
            if ($(to).data('type') == 'column') {
                var type = 'column';
                var ctrls = [];
                if (x !== 0) {
                    if (this.settings.resizable == true) {
                        this.addRail(x, y);
                    }
                }
            } else {
                var type = 'cell';
                var ctrls = [];
                if (y !== 0) {
                    if (this.settings.resizable == true) {
                        this.addRail(x, y);
                    }
                }
                // add click event to cell
                to.on('click', function() {
                    oThis.handleClick(this, type);
                });
            }
        }
        /**
         * this.halfOf()<br/><br/> split a cell in two using the methods outlined in this.settings.splitMethod* indicated by the existence of 'flag'
         *
         * @function gridSplit.halfOf
         * @param {object} first the target element being split
         * @param {object} second the element filling the space
         * @param {int} full the size of the first element
         * @param {string} type the type of target element ['h' = cell  | 'w' = column]
         * @param {bool|int} flag true - when this.settings.splitMethod* = 'half' && type == 'w'   <br/>  columns x - when this.settings.splitMethod* = 'half' && type == 'h'
         * @return {string} ret the new width|height as percentage
         * @memberOf gridSplit
         */
        grid.halfOf = function(first, second, full, type, flag) {
            if (type == 'w') {
                if (typeof flag !== 'undefined') {
                    var ret = this.perOfWidthEls();
                } else {
                    var ret = parseFloat(full / 2) + '%';
                    $(first).css({
                        'width': ret,
                        'float': 'left'
                    });
                    $(second).css({
                        'width': ret,
                        'float': 'left'
                    });
                }
            } else if (type == 'h') {
                if (typeof flag !== 'undefined') {
                    var ret = this.perOfHeightEls(flag);
                } else {
                    var ret = parseFloat(full / 2) + '%';
                    $(first).css({
                        'height': ret,
                    });
                    $(second).css({
                        'height': ret,
                    });
                }
            }
            return ret;
        }
        /**
         * this.perOfWidth()<br/><br/> returns the percentage that pixels represents of the grids.width()
         *
         * @function gridSplit.perOfWidth
         * @param {int} pixels elements width
         * @return {string} per
         * @memberOf gridSplit
         */
        grid.perOfWidth = function(pixels) {
            var per = ((100 / (this.$el.width())) * pixels);
            return per + '%';
        }
        /**
         * this.perOfWidthEls()<br/><br/> creates even widths for each column in the grid
         *
         * @function gridSplit.perOfWidthEls
         * @return {string} per
         * @memberOf gridSplit
         */
        grid.perOfWidthEls = function() {
            // grid is a gridSplit instance
            // find all columns in grid
            var oThis = this,
                no = oThis.gridsColumns.length,
                per = (100 / no) + '%';
            // set width and float the column left;
            $.each(oThis.gridsColumns, function(x, column) {
                column.css({
                    'width': per,
                    'float': 'left'
                });
                oThis.resizeColumn(x, per);
            });
            return per;
        }
        /**
         * this.perOfHeight()<br/><br/> returns the percentage that pixels represents of the elHeight.outerHeight()
         *
         * @function gridSplit.perOfHeight
         * @param {int} pixels elements height
         * @return {string} per
         * @memberOf gridSplit
         */
        grid.perOfHeight = function(pixels) {
            var per = ((100 / this.$el.outerHeight()) * pixels);
            return per + '%';
        }
        /**
         * this.perOfHeightEls()<br/><br/> creates even heights for each cell in the column
         *
         * @function gridSplit.perOfHeightEls
         * @param {int} x the grids column position
         * @return {string} per
         * @memberOf gridSplit
         */
        grid.perOfHeightEls = function(x) {
            var oThis = this,
                no = oThis.gridsCells[x].length,
                per = (100 / no) + '%';
            // find all cells in column
            $.each(oThis.gridsCells[x], function(y, cell) {
                cell.css({
                    'height': per,
                });
                oThis.resizeCell(x, y, per);
            });
            return per;
        }
        /**
         * this.resizeColumn()<br/><br/> simplify the pass through to this.setMetaAt on width resize
         *
         * @function gridSplit.resizeColumn
         * @param {int} x the target cells column
         * @param {string} to the new width (%)
         * @memberOf gridSplit
         */
        grid.resizeColumn = function(x, to) {
            if (typeof this.metaAt === 'undefined') {
                this.metaAt = {};
            }
            if (typeof this.metaAt[x] === 'undefined') {
                this.metaAt[x] = {};
                this.metaAt[x]['c'] = {};
            }
            var obj = {
                'w': to,
            };
            // meta will be %
            this.setMetaAt(x, null, obj);
            // convert to pix and set to data
            var asPix = parseFloat(((this.$el.outerWidth() / 100) * parseFloat(to)));
            this.gridsColumns[x].data('trueWidth', asPix);
            // fire a function after resize
            if (typeof this.settings.callAfterResize == 'function') {
                if (typeof this.gridsColumns[x] !== 'undefined' && typeof this.gridsCells[x][0] !== 'undefined') {
                    this.settings.callAfterResize(this.gridsCells[x][0], this, this.gridsColumns[x].data('trueWidth'), this.gridsCells[x][0].data('trueHeight'));
                }
            }
        }
        /**
         * this.resizeCell()<br/><br/> simplify the pass through to this.setMetaAt on height resize;
         *
         * @function gridSplit.resizeCell
         * @param {int} x the target cells column
         * @param {int} y the target cells position in that column
         * @param {string} to the new height (%)
         * @memberOf gridSplit
         */
        grid.resizeCell = function(x, y, to) {
            if (typeof this.metaAt[x] === 'undefined') {
                this.metaAt[x] = {};
                this.metaAt[x]['c'] = {};
            }
            if (typeof this.metaAt[x][y] === 'undefined') {
                this.metaAt[x][y] = {};
            }
            var obj = {
                'h': to
            };
            // meta will be %
            this.setMetaAt(x, y, obj);
            // convert to pix and set to data.
            var asPix = parseFloat(((this.gridsColumns[x].outerHeight() / 100) * parseFloat(to)));
            var cell = this.gridsCells[x][y];
            cell.data('trueHeight', asPix);
            // fire a function after resize
            if (typeof this.settings.callAfterResize == 'function') {
                if (typeof this.gridsColumns[x] !== 'undefined' && typeof this.gridsCells[x][y] !== 'undefined') {
                    this.settings.callAfterResize(this.gridsCells[x][y], this, this.gridsColumns[x].data('trueWidth'), this.gridsCells[x][y].data('trueHeight'));
                }
            }
        }
        /**
         * this.equalPers()<br/><br/> creates percentages that total 100 by weighing the available items taking into account minimums
         *
         * @function gridSplit.equalPers
         * @param {object} arr pass in array of values
         * @param {int} vh vertical|horizontal, what mins should we use
         * @return {object} pers
         * @memberOf gridSplit
         */
        grid.equalPers = function(arr, vh) {
            var i = arr.length,
                total = 0,
                target = 100;
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
            // each arr[x] needs to be a real percent
            for (x = 0; x < arr.length; x++) {
                arr[x] = parseFloat((target / total) * arr[x]);
            }
            return arr;
        }
        /**
         * this.forcePerWidth()<br/><br/> create percentage widths for all columns in grid
         *
         * @function gridSplit.forcePerWidth
         * @param {bool} equal should each columns width be equal values
         * @return {object} oThis grid instance
         * @memberOf gridSplit
         */
        grid.forcePerWidth = function(equal) {
            var wids = [];
            var oThis = this;
            if(typeof equal == "undefined" || equal == false) {
                $.each(this.gridsColumns, function(key, col) {
                    var width = parseFloat(oThis.perOfWidth($(col).width()));
                    wids.push(width);
                });
            } else {
                var countColumns = oThis.countKeys(this.gridCells);
                var ret = parseFloat(100 / countColumns) + '%';
                $.each(this.gridCells, function(key, col) {
                    wids.push(ret);
                });
            }
            var wids = oThis.equalPers(wids, 0);
            $.each(this.gridsColumns, function(key, col) {
                $(col).css({
                    'width': wids[key] + '%',
                });
                oThis.resizeColumn(key, (wids[key] + '%'));
            });
            return oThis;
        }
        /**
         * this.forcePerHeight()<br/><br/> create percentage heights for all cells in column
         *
         * @function gridSplit.forcePerHeight
         * @param {int} x column being altered
         * @param {bool} equal should each cells height be equal values
         * @return {object} oThis grid instance
         * @memberOf gridSplit
         */
        grid.forcePerHeight = function(x, equal) {
            var heights = [];
            var oThis = this;
            var col = this.gridsColumns[x];
            if (typeof col !== 'undefined') {
                if(typeof equal == "undefined" || equal == false) {
                    $.each(oThis.gridsCells[x], function(y, cell) {
                        var height = Math.round(parseFloat(oThis.perOfHeight($(cell).outerHeight())));
                        heights.push(height);
                    });
                } else {
                    var countKeys = oThis.countKeys(oThis.gridsCells[x]);
                    var ret = 100 / countKeys
                    $.each(oThis.gridsCells[x], function(y, cell) {
                        heights.push(ret);
                    });
                }
                var heights = oThis.equalPers(heights, 1);
                $.each(oThis.gridsCells[x], function(y, cell) {
                    $(cell).css({
                        'height': heights[y] + '%',
                    });
                    oThis.resizeCell(x, y, (heights[y] + '%'));
                });
            }
            return oThis;
        }
        /**
         * this.evenAll()<br/><br/> create and set percentage heights and widths for all columns and cells
         *
         * @function gridSplit.evenAll
         * @memberOf gridSplit
         */
        grid.evenAll = function() {
            // even percentages for each column / cell
            var oThis = this;
            var data = this.metaAt;
            var countColumns = oThis.countKeys(data);
            $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    var wid = 100 / countColumns;
                    var countKeys = oThis.countKeys(column);
                    data[x]['c']['w'] = wid + '%';
                    if (typeof oThis.settings.callAfterResize == 'function') {
                        oThis.settings.callAfterResize(oThis.gridsCells[x][0], oThis, oThis.gridsColumns[x].data('trueWidth'), oThis.gridsCells[x][0].data('trueHeight'));
                    }
                    if (countKeys > 0) {
                        $.each(column, function(y, cell) {
                            if (!isNaN(y)) {
                                var height = 100 / countKeys;
                                data[x][y]['h'] = height + '%';
                                if (typeof oThis.settings.callAfterResize == 'function') {
                                    oThis.settings.callAfterResize(oThis.gridsCells[x][y], oThis, oThis.gridsColumns[x].data('trueWidth'), oThis.gridsCells[x][y].data('trueHeight'));
                                }
                                $(window).trigger('resize.grid.' + $(oThis.gridsCells[x][y]).data('widgetID'));
                                if (typeof cell[0] === 'object') {
                                    var nGrid = oThis.gridsCells[x][y].data('grid');
                                    nGrid.evenAll();
                                }
                            }
                        });
                    } else {
                        data[x]['c']['w'] = '100%';
                    }
                }
            });
            // set widths/heights/and any other meta data
            oThis.setMeta(data);
            // notify calling function that grids.returnMeta() has altered
            if (oThis.parent() === oThis) {
                if (typeof oThis.settings.callSetHash == 'function') {
                    oThis.settings.callSetHash();
                }
            }
        }
        /**
         * this.setMetaAt()<br/><br/> set the obj against this.metaAt[x]([y])
         *
         * @function gridSplit.setMetaAt
         * @param {int} x the target cells column
         * @param {int} y the target cells position in that column
         * @param {object} obj the target element
         * @memberOf gridSplit
         */
        grid.setMetaAt = function(x, y, obj) {
            var oThis = this;
            if (typeof oThis.metaAt[x] === 'undefined') {
                oThis.metaAt[x] = {};
                oThis.metaAt[x]['c'] = {};
            }
            if (y === null) {
                oThis.metaAt[x]['c'] = $.extend({}, oThis.metaAt[x]['c'], obj);
            } else {
                if (typeof oThis.metaAt[x][y] === 'undefined') {
                    oThis.metaAt[x][y] = {};
                }
                oThis.metaAt[x][y] = $.extend({}, oThis.metaAt[x][y], obj);
            }
            $(window).trigger('resize.grid');
        }
        /**
         * this.setMetaAllCells()<br/><br/> set the obj against all cells in grids scope
         *
         * @function gridSplit.setMetaAllCells
         * @param {object} obj the target element
         * @memberOf gridSplit
         */
        grid.setMetaAllCells = function(obj) {
            var oThis = this;
            $.each(grid.gridsCells, function(x, column) {
                $.each(column, function(y, cell) {
                    if (typeof cell.data('grid') !== 'undefined') {
                        cell.data('grid').setMetaAllCells(obj);
                        oThis.setMetaAt(x, null, obj);
                    } else {
                        oThis.setMetaAt(x, null, obj);
                        oThis.setMetaAt(x, y, obj);
                    }
                });
            });
        }
        /**
         * this.setProperty()<br/><br/> replace an options value after init
         *
         * @function gridSplit.setProperty
         * @param {string} property the property we're replacing in all grids
         * @param {string} value the new value to be set against all grids
         * @memberOf gridSplit
         */
        grid.setProperty = function(property, value) {
            var oThis = this;
            if (property) {
                // set the property
                oThis.settings[property] = value;
                // each grid has its own copy of the options
                // itterate through columns/cells looking for any grid instances
                var data = oThis.metaAt;
                var countColumns = oThis.countKeys(data);
                $.each(data, function(x, column) {
                    if (!isNaN(x)) {
                        var countKeys = oThis.countKeys(column);
                        if (countKeys > 0) {
                            $.each(column, function(y, cell) {
                                if (!isNaN(y)) {
                                    if (typeof cell[0] === 'object') {
                                        var nGrid = oThis.gridsCells[x][y].data('grid');
                                        // call _self with the new grid instance
                                        nGrid.setProperty(property, value);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        /**
         * this.returnProperty()<br/><br/> return the current value set against a property
         *
         * @function gridSplit.returnProperty
         * @param {string} property the property we're replacing in all grids
         * @memberOf gridSplit
         */
        grid.returnProperty = function(property) {
            return this.settings[property];
        }
        /**
         * this.return1stGrid()<br/><br/> return the first grid
         *
         * @function gridSplit.return1stGrid
         * @return {object} the first grid
         * @memberOf gridSplit
         */
        grid.return1stGrid = function() {
            var oThis = this;
            if (oThis.parent() !== oThis) {
                oThis = oThis.parent().return1stGrid();
            } else {
                return oThis;
            }
        }
        /**
         * this.return1stCell()<br/><br/> return the first cell
         *
         * @function gridSplit.return1stCell
         * @return {object} the first cell
         * @memberOf gridSplit
         */
        grid.return1stCell = function() {
            var oThis = this;
            if (oThis.gridsCells[0][0].hasClass(oThis.settings.hasChildrenClass)) {
                return oThis.gridsCells[0][0].data('grid').return1stCell();
            } else {
                return oThis.gridsCells[0][0];
            }
        }
        /**
         * this.returnLXY()<br/><br/> nested operation for this.returnLongXY
         *
         * @function gridSplit.returnLXY
         * @param {int} x the target column
         * @param {int} y the target cell
         * @param {string} response the response string
         * @return {string} full yx-yx resolution for the cell (cell->parent)
         * @memberOf gridSplit
         */
        grid.returnLXY = function(x, y, response) {
            var oThis = this;
            // if we're not at parent, find parent grid and x y of parent cell
            // build string y x order string reversed after collation
            if (typeof response == 'undefined') {
                response = y + '' + x + '-';
            } else {
                response += y + '' + x + '-';
            }
            if (oThis !== oThis.parent()) {
                var pG = oThis.settings.parentsGrid;
                var pX = oThis.settings.parentsX;
                var pY = oThis.settings.parentsY;
                if (typeof pX !== 'undefined') {
                    return pG.returnLXY(pX, pY, response);
                }
            }
            return response
        }
        /**
         * this.returnLongXY()<br/><br/> return the full xy-xy resolution for the given cell
         *
         * @function gridSplit.returnLongXY
         * @param {int} x the target column
         * @param {int} y the target cell
         * @return {string} full xy-xy resolution for the given cell (parent->cell)
         * @memberOf gridSplit
         */
        grid.returnLongXY = function(x, y) {
            // start on cell and work outwards
            // string is built in reverse order - so needs to be reversed
            return this.returnLXY(x, y).split('').reverse().join('').replace(/(^[-\s]+)|([-\s]+$)/g, '');
        }
        /**
         * this.returnContent()<br/><br/> return and detach content from the given cell
         *
         * @function gridSplit.returnContent
         * @return {object} jQuery element
         * @memberOf gridSplit
         */
        grid.returnContent = function(cell) {
            var content = cell.children();
            // ignore any rail elements
            if (content.length == 1) {
                if (content.hasClass('horizrail') == false) {
                    var useContent = content;
                }
            } else if (content.length == 2) {
                if ($(content[0]).hasClass('horizrail') == false) {
                    var useContent = $(content[0]);
                } else {
                    var useContent = $(content[1]);
                }
            }
            // detach if the items in the DOM
            if ($(useContent).parents('html').length) {
                useContent = $(useContent).detach();
            }
            return $(useContent);
        }
        /**
         * this.returnStructure()<br/><br/> return a simple object of the grids structure (true where cell exists)
         *
         * @function gridSplit.returnStructure
         * @return {string} JSON string
         * @memberOf gridSplit
         */
        grid.returnStructure = function() {
            return JSON.stringify(this.gridsStructure);
        }
        /**
         * this.returnMeta()<br/><br/> return a complete object of the grids structure with heights and widths and all other stored meta
         *
         * @function gridSplit.returnMeta
         * @return {string} JSON string
         * @memberOf gridSplit
         */
        grid.returnMeta = function() {
            return JSON.stringify(this.metaAt);
        }
        /**
         * this.returnCells()<br/><br/> return an object of the grids cells
         *
         * @function gridSplit.returnCells
         * @return {object} object of grids Cells
         * @memberOf gridSplit
         */
        grid.returnCells = function() {
            return this.gridsCells;
        }
        /**
         * this.countKeys<br/><br/>Count only int keys
         *
         * @function gridSplit.countKeys
         * @param {object} arr object of mixed keys
         * @return {object} t result of the counting
         * @memberOf gridSplit
         */
        grid.countKeys = function(arr) {
            // data is array not object so no .length but we only want to count int keys
            var t = 0;
            $.each(arr, function(k, arrr) {
                if (!isNaN(k)) {
                    t++;
                }
            });
            return t;
        }
        /**
         * this.parent()<br/><br/> return the next grid up from what ever position inside a chained gridSplit operation
         *
         * @function gridSplit.parent
         * @return {object} parents gridSplit instance.
         * @example
         * var grid = $('#grid').gridsplit().splitAt(0,0).splitAt(0,1,true); //grid is instance equiv to $('#grid').gridsplit().gridsCells[0][1].data('grid')
         * var grid = $('#grid').gridsplit().splitAt(0,0).splitAt(0,1,true).parent(); //grid is instance equiv to $('#grid').gridsplit()
         *
         * @memberOf gridSplit
         */
        grid.parent = function() {
            return (this.settings.parentsGrid === '' ? this : this.settings.parentsGrid);
        }
        /**
         * this.dontDestroy<br/><br/> call a function to handle saving of data before its destroyed <br/>
         * this.settings.callBeforeDestroy - pass the object through a call without destroying so that we can save the content of the cells
         *
         * @function gridSplit.dontDestroy
         * @return {object} gridSplit jQuery el
         * @memberOf gridSplit
         */
        grid.dontDestroy = function(undefined) {
            // dont destroy the current grid after processing through .callBeforeDestroy(grid)
            if (typeof this.settings.callBeforeDestroy == 'function') {
                // true as second param should carry out an alternative method where the content is reattached
                this.settings.callBeforeDestroy(this, 1);
            }
            // dont empty and dont removeData('grid')
            return this.$el;
        }
        /**
         * this.destroy<br/><br/> remove the grid and all associated data<br/>
         * this.settings.callBeforeDestroy - pass the object through a call before destroying so that we can save the content of the cells
         *
         * @function gridSplit.destroy
         * @return {object} gridSplit jQuery el
         * @memberOf gridSplit
         */
        grid.destroy = function(undefined) {
            // destroy the current grid after processing through .callBeforeDestroy(grid)
            if (typeof this.settings.callBeforeDestroy == 'function') {
                this.settings.callBeforeDestroy(this);
            }
            this.$el.empty().removeData('grid');
            return this.$el;
        }
        // call grid.init() on new gridSplit()
        var grids = grid.init(el, options);
    }
}));
