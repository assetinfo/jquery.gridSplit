// Author: Graham Dixon
// Contact: gdixon@assetinfo.co.uk
// Copyright (c) 2015 Graham Dixon (assetinfo(MML))
// Script: jquery.gridsplit.js - v.0.0.1
// Licensed: MIT
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery.
        define(['../bower_components/jquery/src/jquery', '../bower_components/underscore/underscore'], factory);
    } else {
        // No AMD. Register plugin with global jQuery object.
        factory(jQuery, _);
    }
}(function($, _) {
    $.fn.gridsplit = (function(options) {
        var grid,
            init = function(that) {
                if (undefined == $(that).data('grid')) {
                    grid = new gridsplit(that, options);
                    $(that).data('grid', grid);
                } else {
                    // do option based functions
                    if (typeof options !== "undefined") {
                        // allow recreate on .gridsplit({data:object});
                        if (typeof options['data'] !== "undefined") {
                            grid = that.data('grid').init(that, options);
                        } else if (typeof options['setMeta'] !== "undefined") {
                            grid = that.data('grid');
                            grid.setMeta(options['setMeta'], false);
                        }
                    } else {
                        grid = that.data('grid');
                    }
                }
            };
        init(this);
        // return this if you want chaining then access grid using .data('grid')
        // -----------        
        return grid;
    });
    var gridsplit = function(el, options) {
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
            nestedIn: '',
            resizable: true,
            horizMin: 5,
            vertMin: 2,
            hideBorder: {
                "border": "0px solid #000"
            }
        };
        // each cell will contain 1 widget.
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
                // force percentages on first display
                // clearTimeout(oThis.timeoutFP);
                // oThis.forcePerWidth();
                } else {
                this.buildGrid(this.settings.data);
            }
            // add grid data attributes and set
            $(window).on("resize", function() {
                oThis.centerInner(oThis)
            });
            return this;
        }
        grid.buildGrid = function(data, undefined) {
            // use data to build grid.
            var oThis = this;
            // each column
            _.each(data, function(column, x) {
                if (!isNaN(x)) {
                    oThis.gridsStructure[x] = "need to set";
                    oThis.addColumn(x, undefined, true);
                    oThis.gridsColumns[x].css("float", "left");
                    // console.log("add Column " + x);
                    // each cell
                    if (oThis.countCells(column) > 1) {
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
            oThis.setMeta(data, true);
        }
        grid.setMeta = function(data, holdNestedSet) {
            var oThis = this;
            _.each(data, function(column, x) {
                if (!isNaN(x)) {
                    if (typeof column['c'] !== "undefined") {
                        var wid = column['c']['w'];
                    } else {
                        var wid = null;
                    }
                    oThis.gridsColumns[x].css("width", wid);
                    oThis.resizeColumn(x, wid);
                    if (oThis.countCells(column) > 1) {
                        _.each(column, function(cell, y) {
                            if (!isNaN(y)) {
                                if (typeof oThis.gridsCells[x][y] !== "undefined") {
                                    oThis.gridsCells[x][y].css("height", cell['h']);
                                    oThis.resizeCell(x, y, cell['h']);
                                }
                            }
                            if (typeof cell[0] === "object") {
                                if (holdNestedSet !== true) {
                                    if (typeof oThis.gridsCells[x][y] !== "undefined") {
                                        oThis.gridsCells[x][y].data("grid").setMeta(cell, false);
                                    }
                                }
                            }
                        });
                    }
                }
            });
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
        grid.addCell = function(x, y, after) {
            // add a Cell by sharing the available height between all cells in the column.
            if (typeof x == "undefined" || typeof y == "undefined") {
                return;
            }
            // set the structure;
            if ((this.gridsStructure.length - 1) < x) {
                x = this.gridsStructure.length - 1;
            }
            // if needs to set, already been through this.splitAt()
            // if cell exists then do a split at location instead.
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
        }
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
        }
        grid.delCell = function(x, y) {
            // shift everything after y in x left;
            var oThis = this;
            var reEx = [];
            var reExm = {};
            var reExs = [];
            var el = this.gridsCells[x][y];
            if (typeof this.gridsColumns[x] !== "undefined") {
                if (typeof this.gridsCells[x][y] !== "undefined") {
                    if (this.gridsColumns.length > 0) {
                        if (this.gridsCells[x].length > 1) {
                            // set the column deffinition for the cells parent.
                            reExm['c'] = oThis.metaAt[x]['c'];
                            _.each(this.gridsCells[x], function(acY, ly) {
                                if (ly > y) {
                                    reEx[ly - 1] = oThis.gridsCells[x][ly];
                                    reExm[ly - 1] = oThis.metaAt[x][ly];
                                    reExs[ly - 1] = oThis.gridsStructure[x][ly];
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
        }
        grid.delColumn = function(x) {
            // shift everything after x left;
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
        }
        grid.delAt = function(x, y) {
            return (typeof y == "undefined" ? this.delColumn(x) : this.delCell(x, y));
        }
        grid.addRail = function(to, x, y) {
            // est type
            var oThis = this;
            if(this.settings.resizable == true){
                to.addClass(this.settings.resizableClass);
            }
            if ($(to).data("tpe") == "c") {
                if (x !== 0) {
                    var w = this.settings.gridColClass;
                    var rail = this.settings.vertRail;
                    var rRail = rail.clone();
                    rRail.appendTo(to);
                    rRail.draggable({
                        axis: 'x',
                        containment: to.parent(),
                        start: function(event, ui) {
                            // x value might change after init so let it calculate it from the number of previous columns
                            var x = $(this).closest('.' + oThis.settings.gridColClass).prevAll('.' + oThis.settings.gridColClass).length;
                            if (typeof oThis.gridsColumns[x] !== "undefined" && x !== 0) {
                                rRail.data("x", x);
                                var railReferstoRightOf = oThis.gridsColumns[x - 1];
                                rRail.origRight = oThis.gridsColumns[x].offset().left - oThis.$el.offset().left;
                                rRail.origLeft = oThis.gridsColumns[x - 1].offset().left - oThis.$el.offset().left;
                                rRail.origWidth = rRail.origRight - rRail.origLeft;
                                $(this).addClass(oThis.settings.draggingClass);
                            } else {
                                rRail.remove();
                            }
                        },
                        stop: function() {
                            var newRight = $(this).offset().left;
                            var newWidth = newRight - rRail.origWidth - oThis.$el.offset().left;
                            // focus elments size....
                            var pixels = newWidth + rRail.origWidth - rRail.origLeft;
                            var rWidth = oThis.perOfWidth(pixels);
                            // set the widths;
                            oThis.gridsColumns[$(this).data("x") - 1].css("width", rWidth);
                            // take pixels / no.of nextAll columns, away from nextAll colums .width(), and convert to % 
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
                            // focus elments size....
                            var gridHeight = oThis.gridsColumns[x].outerHeight();
                            // correct the height on the first box below the rail(this)
                            var rHeight = oThis.perOfHeight(newHeight, gridHeight);
                            // console.log("setting, x:"+x+" y:"+(y-1)+" height:" + rHeight);
                            oThis.gridsCells[x][(y - 1)].css("height", rHeight);
                            // then the box above the rail, all others should go un-affected
                            newHeight = oThis.gridsCells[x][y].outerHeight() - moved;
                            rHeight = oThis.perOfHeight(newHeight, gridHeight)
                            // console.log("setting, x:"+x+" y:"+y+" height:" + rHeight);
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
        grid.resizeCell = function(x, y, to) {
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
        grid.addControls = function(to, x, y) {
            // add a control set.   
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
            var oThis = this;
            // to buttons.
            to.on("click", function() {
                oThis.clickThis(this, tpe);
            });
        }
        grid.splitAt = function(x, y, cell) {
            // split the column([x] - vertically) or the cell ([x][y] - horizontally) or split the cell ([x][y] - vertically)
            var oThis = this;
            //  if splitting the cell then do something.
            //  if (this.settings.splitCellInColumn == true ) {
            //  }
            // spliting the cell horizontally
            if (typeof y !== "undefined") {
                // split cell across chunk.
                if (typeof cell !== "undefined") {
                    this.gridsCells[x][y].addClass(this.settings.hasChildrenClass);
                    return this.splitCellInColumn(this.gridsCells[x][y], x, y);
                }
                if ((y + 1) == this.gridsStructure[x].length) {
                    // tell cell it needs to set.
                    this.gridsStructure[x][(y + 1)] = "need to set";
                    this.addCell(x, (y + 1));
                } else {
                    // shift everything after y in x right;
                    var reEx = [];
                    var reExm = {};
                    var reExs = [];
                    //need to keep a tab on col width.
                    reExm['c'] = oThis.metaAt[x]['c'];
                    _.each(this.gridsCells[x], function(acY, ly) {
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
                    this.gridsCells[x] = reEx;
                    this.metaAt[x] = reExm;
                    this.gridsStructure[x] = reExs;
                    // tell cell it needs to set.
                    this.gridsStructure[x][(y + 1)] = "need to set";
                    this.addCell(x, (y + 1), this.gridsCells[x][y]);
                }
                var first = this.gridsCells[x][y];
                var second = this.gridsCells[x][(y + 1)];
                var no = this.gridsCells[x].length;
                var setHeight = this.halfOf(first, second, 0, "h", this.gridsCells[x]);
                _.each(this.gridsCells[x], function(acY, ly) {
                    oThis.resizeCell(x, ly, setHeight + "%");
                });
            } else {
                // splitting the column virticaly
                if ((x + 1) == this.gridsStructure.length) {
                    // tell column it needs to set.
                    this.gridsStructure[(x + 1)] = "need to set";
                    this.addColumn((x + 1));
                } else {
                    // make space available by shifting everything after x right;
                    var reEx = [];
                    var reExm = {};
                    var reExc = [];
                    var reExs = [];
                    _.each(this.gridsColumns, function(acX, lx) {
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
                    this.gridsColumns = reEx;
                    this.metaAt = reExm;
                    this.gridsCells = reExc;
                    this.gridsStructure = reExs;
                    // tell column it needs to set.
                    this.gridsStructure[(x + 1)] = "need to set";
                    this.addColumn((x + 1), this.gridsColumns[x]);
                }
                var first = this.gridsColumns[x];
                var second = this.gridsColumns[(x + 1)];
                var width = this.gridsColumns[x].width();
                var setWid = this.halfOf(first, second, width, "w");
                this.resizeColumn(x, setWid);
                this.resizeColumn((x + 1), setWid);
                // column needs a cell, tell it that it needs to set.
                this.gridsStructure[(x + 1)][0] = "need to set";
                this.addCell((x + 1), 0);
            }
        }
        grid.splitCellInColumn = function(el, x, y, data) {
            // add an ID to the cell so that a new grid can be initialised on it.
            if (this.splitCellInColumn !== true) {
                // use .data("grid") here to reference inner grid. Keep it this way to allow chaining in the $.fn.
                el.attr("id", (this.settings.nestedIn !== '' ? this.settings.nestedIn + "-" + this.id : this.id) + '-' + x + '' + y).css(this.settings.hideBorder).off("click").gridsplit({
                    "splitCellInColumn": true,
                    "nestedIn": (this.settings.nestedIn !== '' ? this.settings.nestedIn + "-" + this.id : this.id),
                    "data": (typeof data !== "undefined") ? data : "",
                    "resizable": this.settings.resizable
                });
                if (typeof(this.gridsStructure[x][y] == "undefined")) {
                    this.gridsStructure[x][y] = {};
                }
                // connect structure and meta to parent grid, let em bubble to the top grid instance.
                // access cells $el by using .data("grid") on the cell ( .returnCells[x][y] )
                this.gridsStructure[x][y] = el.data("grid").gridsStructure;
                if (typeof this.metaAt[x] === "undefined") {
                    this.metaAt[x] = {};
                    this.metaAt[x]['c'] = {};
                }
                this.metaAt[x][y] = el.data("grid").metaAt;
            }
            return el.data("grid");
        }
        grid.clickThis = function(that, type) {
            // just to handle an action against a cell. (example only)
            // that == the cell/column.
            if (type == "c") {
                var w = this.gridCol;
            } else {
                var w = this.gridCell;
                var whatisthis = $(that).toggleClass("black");
            }
        }
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
                //struggling to get normal split method working.
                var ret = this.perOfHeightEls(obj);
            }
            return ret;
        }
        grid.perOfWidth = function(pixels) {
            var per = ((100 / (this.$el.outerWidth())) * pixels);
            return per + "%";
        }
        grid.perOfWidthEls = function(grid) {
            // grid is a grid instance (so we can target others from here.)
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
        grid.perOfHeight = function(pixels, elHeight) {
            var per = ((100 / (typeof elHeight !== "undefined" ? elHeight : this.$el.outerHeight())) * pixels);
            return per + "%";
        }
        grid.perOfHeightEls = function(els) {
            var no = els.length,
                per = (100 / no),
                searchEl;
            //start from first in series then move to parent and find all others in one DOM hit.
            if( this.settings.splitCellInColumn == true ){
                searchEl = "." + this.settings.useInsideCell;
            }else{
            	var andNot = ":not(.";
            	var closeNot = ")";
                searchEl = "." + this.settings.gridCellClass + andNot + this.settings.insideCellClass + closeNot;
            } 
            $(els[0]).parent().find(searchEl).css("height", per + "%");
            return per;
        }
        grid.equalPers = function(arr, target, vh) {
            var i = arr.length,
                total = 0;
            // place mins and total arr
            while (i--) {
                if (vh == 0) {
                    min = this.settings.vertMin;
                } else {
                    min = this.settings.horizMin;
                }
                // use settings.horizMin && settings.vertMin as min
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
        grid.percentageRounding = function(orig, target) {
            var i = orig.length,
                j = 0,
                total = 0,
                change, newVals = [],
                next, factor1, factor2, len = orig.length,
                marginOfErrors = [];
            // map original values to new array
            while (i--) {
                total += newVals[i] = Math.round(orig[i]);
            }
            change = total < target ? 1 : -1;
            while (total !== target) {
                // Iterate through values and select the one that once changed will introduce
                // the least margin of error in terms of itself. e.g. Incrementing 10 by 1
                // would mean an error of 10% in relation to the value itself.
                for (i = 0; i < len; i++) {
                    next = i === len - 1 ? 0 : i + 1;
                    factor2 = errorFactor(orig[next], newVals[next] + change);
                    factor1 = errorFactor(orig[i], newVals[i] + change);
                    if (factor1 > factor2) {
                        j = next;
                    }
                }
                newVals[j] += change;
                total += change;
            }
            for (i = 0; i < len; i++) {
                marginOfErrors[i] = newVals[i] && Math.abs(orig[i] - newVals[i]) / orig[i];
            }
            // Math.round() causes some problems as it is difficult to know at the beginning
            // whether numbers should have been rounded up or down to reduce total margin of error. 
            // This section of code increments and decrements values by 1 to find the number
            // combination with least margin of error.
            for (i = 0; i < len; i++) {
                for (j = 0; j < len; j++) {
                    if (j === i) continue;
                    var roundUpFactor = errorFactor(orig[i], newVals[i] + 1) + errorFactor(orig[j], newVals[j] - 1);
                    var roundDownFactor = errorFactor(orig[i], newVals[i] - 1) + errorFactor(orig[j], newVals[j] + 1);
                    var sumMargin = marginOfErrors[i] + marginOfErrors[j];
                    if (roundUpFactor < sumMargin) {
                        newVals[i] = newVals[i] + 1;
                        newVals[j] = newVals[j] - 1;
                        marginOfErrors[i] = newVals[i] && Math.abs(orig[i] - newVals[i]) / orig[i];
                        marginOfErrors[j] = newVals[j] && Math.abs(orig[j] - newVals[j]) / orig[j];
                    }
                    if (roundDownFactor < sumMargin) {
                        newVals[i] = newVals[i] - 1;
                        newVals[j] = newVals[j] + 1;
                        marginOfErrors[i] = newVals[i] && Math.abs(orig[i] - newVals[i]) / orig[i];
                        marginOfErrors[j] = newVals[j] && Math.abs(orig[j] - newVals[j]) / orig[j];
                    }
                }
            }

            function errorFactor(oldNum, newNum) {
                return Math.abs(oldNum - newNum) / oldNum;
            }
            return newVals;
        }
        grid.centerInner = function(thiss) {
            var oThis = ((typeof thiss !== "undefined") ? thiss : this);
            // if the percentages go haywire, make sure the grid sits centered in .grid
            setTimeout(function() {
                var realTwidth = 0;
                oThis.elInner.children('.' + oThis.settings.gridColClass).each(function() {
                    realTwidth += $(this).outerWidth(true);
                });
                if (realTwidth < oThis.elInner.width()) {
                    oThis.elInner.css("padding-left", oThis.elInner.width() - 1 - realTwidth + "px");
                }
            });
        }
        grid.forcePerWidth = function() {
            // all cell wids should add up to 100.
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
        grid.forcePerHeight = function(x) {
            // all columns' cells heights need to total 100.
            var heights = [];
            var oThis = this;
            var col = this.gridsColumns[x];
            if (typeof col !== "undefined") {
                _.each(oThis.gridsCells[x], function(Cell, y) {
                    heights.push(parseInt(oThis.perOfHeight($(Cell).height(), col.height())));
                });
                var newHeights = oThis.equalPers(heights, 100, 1);
                // console.log(heights);
                // console.log(newHeights);
                _.each(oThis.gridsCells[x], function(Cell, y) {
                    $(Cell).css({
                        "height": newHeights[y] + "%",
                    });
                    oThis.resizeCell(x, y, (newHeights[y] + "%"));
                });
            }
        }
        grid.returnStructure = function() {
            return JSON.stringify(this.gridsStructure);
        }
        grid.returnMeta = function() {
            return JSON.stringify(this.metaAt);
        }
        grid.returnCells = function() {
            return this.gridsCells;
        }
        grid.init(el, options);
    }
}));