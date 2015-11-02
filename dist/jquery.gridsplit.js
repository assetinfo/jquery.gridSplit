/*! 
* Author: Graham Dixon 
* Contact: gdixon@assetinfo.co.uk 
* Copyright: (c) 2015 Graham Dixon (assetinfo(MML))
* Script: jquery.gridsplit.min.js - v.0.0.1 
* Licensed: MIT 
* Depends on: jQuery && jQuery-ui-draggable
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery", "jqueryui-draggable" ], factory) : factory(jQuery, jQuery);
}(function($, jui) {
    $.fn.gridSplit = function(options) {
        var grid;
        return $(this).length && (void 0 == $(this).data("grid") ? (grid = new gridSplit(this, options), 
        $(this).data("grid", grid)) : grid = "undefined" != typeof options ? "undefined" != typeof options.data ? this.data("grid").init(this, options) : "undefined" != typeof options.setMeta ? this.data("grid").setMeta(options.setMeta, !1) : this.data("grid") : this.data("grid")), 
        grid;
    };
    var gridSplit = function(el, options) {
        var grid = this, defaults = {
            horizRail: $("<div/>").addClass("horizrail"),
            vertRail: $("<div/>").addClass("vertrail"),
            gridColumnClass: "gridColumn",
            gridCellClass: "gridCell",
            innerGridClass: "innerGrid",
            insideCellClass: "insideCell",
            hasChildrenClass: "hasChildren",
            hasContentClass: "hasContent",
            resizableClass: "isResizable",
            draggingClass: "dragging",
            resizable: !0,
            data: "",
            nestedIn: "",
            parentsGrid: "",
            splitMethodH: "",
            splitMethodV: "half",
            horizMin: 4,
            vertMin: 4,
            callFocusLoad: null,
            callResetGrid: null,
            callAfterMove: null,
            callSetFocus: null,
            callBeforeDestroy: null,
            callAfterResize: null,
            callFinaliseMove: null,
            hideBorder: {
                border: "0px"
            }
        };
        grid.init = function(el, options) {
            return this.settings = {}, this.settings = $.extend({}, defaults, options), this.id = el.attr("id"), 
            this.$el = $("#" + this.id), this.el = this.$el[0], this.gridsColumns = [], this.gridsCells = [], 
            this.gridsStructure = [], this.metaAt = {}, $("#" + this.id + " ." + this.settings.innerGridClass).remove(), 
            this.elInner = $("<div />").addClass(this.settings.innerGridClass).appendTo(this.$el), 
            1 == this.settings.splitCellInColumn && (this.settings.useInsideCell = this.settings.insideCellClass + "" + this.settings.nestedIn), 
            "" == this.settings.data ? (this.gridsStructure[0] = null, this.addColumn(0), this.gridsStructure[0][0] = null, 
            this.addCell(0, 0), 1 == this.settings.splitCellInColumn && this.addColumn(0)) : this.buildGrid(this.settings.data), 
            this;
        }, grid.buildGrid = function(data, undefined) {
            function checkMeta(meta) {
                var metaOut = 0;
                return "object" == typeof meta[0][0] && "100%" == meta[0][0].h && "100%" == meta[0].c.w && "undefined" != typeof meta[1] && delete meta[1], 
                1 == oThis.countCells(meta) && 1 == oThis.countCells(meta[0][0]) && 1 == oThis.countCells(meta[0]) && (metaOut = meta[0][0]), 
                0 == metaOut ? meta : checkMeta(metaOut);
            }
            var oThis = this;
            return oThis.buildingGrid = !0, data = checkMeta(data), $.each(data, function(x, column) {
                isNaN(x) || (oThis.gridsStructure[x] = null, oThis.addColumn(x), oThis.gridsColumns[x].css("float", "left"), 
                oThis.countCells(column) > 0 ? $.each(column, function(y, cell) {
                    if (!isNaN(y) && (oThis.addCell(x, y), "object" == typeof cell[0])) {
                        oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass);
                        {
                            oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y, cell);
                        }
                    }
                }) : oThis.addCell(x, 0));
            }), oThis.setMeta(data), oThis == oThis.parent() && "function" == typeof oThis.settings.callResetGrid && oThis.settings.callResetGrid(), 
            oThis;
        }, grid.setMeta = function(data) {
            var oThis = this;
            return $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    if ("undefined" != typeof column.c) {
                        var wid = column.c.w;
                        oThis.gridsColumns[x].css("width", wid), oThis.resizeColumn(x, wid);
                    }
                    oThis.countCells(column) > 0 && $.each(column, function(y, cell) {
                        "object" == typeof cell[0] ? "undefined" != typeof oThis.gridsCells[x][y] && "undefined" != typeof oThis.gridsCells[x][y].data("grid") && (oThis.gridsCells[x][y].data("grid").setMeta(cell), 
                        oThis.resizeCell(x, y, cell.h), oThis.gridsCells[x][y].css("height", cell.h)) : ("undefined" != typeof oThis.gridsCells[x][y] && (oThis.metaAt[x][y] = cell, 
                        oThis.gridsCells[x][y].css("height", cell.h), oThis.resizeCell(x, y, cell.h)), "function" == typeof oThis.settings.callFocusLoad && oThis.settings.callFocusLoad(oThis, x, y));
                    });
                }
            }), oThis.buildingGrid = !1, this;
        }, grid.countCells = function(arr) {
            var t = 0;
            return $.each(arr, function(k, arrr) {
                isNaN(k) || t++;
            }), t;
        }, grid.addCell = function(x, y) {
            var place, oThis = this;
            if ("undefined" == typeof x || "undefined" == typeof y) return this;
            if (this.gridsStructure.length - 1 < x && (x = this.gridsStructure.length - 1), 
            null == this.gridsStructure[x][y]) {
                if (place = this.gridsStructure[x].length !== y && "undefined" != typeof this.gridsCells[x][y - 1] ? this.gridsCells[x][y - 1] : this.gridsColumns[x], 
                el = $('<div class="' + this.settings.gridCellClass + " " + (1 == this.settings.splitCellInColumn ? this.settings.insideCellClass + " " + this.settings.useInsideCell : "") + '" ></div>'), 
                place == this.gridsColumns[x] ? el.appendTo(place) : el.insertAfter(place), this.gridsStructure[x][y] = !0, 
                this.gridsCells[x][y] = el, "undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {}), 
                el.data("gridAt", this), el.data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(y) + "}"), 
                this.addControls(x, y), oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                    oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                    oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                }
            } else this.gridsStructure[x].length > y ? this.splitAt(x, y) : (x < this.gridsStructure.length - 1 ? this.splitAt(this.gridsStructure.length, y) : this.splitAt(x, this.gridsStructure[x].length - 1), 
            delete this.gridsStructure[x][y]);
            return this;
        }, grid.addColumn = function(x) {
            var oThis = this;
            if ("undefined" != typeof x) {
                if (null == this.gridsStructure[x]) {
                    this.gridsStructure.length !== x && "undefined" != typeof this.gridsColumns[x - 1] ? place = this.gridsColumns[x - 1] : place = this.elInner;
                    var el = $('<div class="' + this.settings.gridColumnClass + '" ></div>');
                    if (place == this.elInner ? el.appendTo(place) : el.insertAfter(place), this.gridsStructure[x] = [], 
                    this.gridsCells[x] = [], this.metaAt[x] = {}, this.gridsColumns[x] = el.data("type", "column"), 
                    this.addControls(x), oThis !== oThis.parent()) {
                        var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                        oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                        oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                    } else oThis.metaAt[x].c = {}, oThis.metaAt[x].c.w = "100%";
                } else this.gridsStructure.length > x ? this.splitAt(x) : (this.splitAt(this.gridsStructure.length - 1), 
                delete this.gridsStructure[x]);
                return this;
            }
        }, grid.splitAt = function(x, y, vert) {
            var updateIdThenCallAfterMoveTimeout, oThis = this, updateIdThenCallAfterMove = function(startingPoint, x, y, fixIDFrom, fixIDTo) {
                if ("undefined" != typeof startingPoint && ("undefined" != typeof updateIdThenCallAfterMoveTimeout && clearTimeout(updateIdThenCallAfterMoveTimeout), 
                startingPoint.gridsCells.length > 0)) {
                    var orig = startingPoint.id;
                    if (startingPoint.id = startingPoint.settings.nestedIn + "-" + startingPoint.parent().id + "-" + x + y + "-" + Date.now(), 
                    startingPoint.id = startingPoint.id.replace(fixIDFrom, fixIDTo), $(startingPoint.el).attr("id", startingPoint.id), 
                    "undefined" != typeof startingPoint.gridsColumns) for (i = 0; i < startingPoint.gridsColumns.length; i++) if ("object" == typeof startingPoint.gridsCells[i]) {
                        var spLen = startingPoint.gridsCells[i].length;
                        if (spLen >= 0) for (iy = 0; iy < spLen; iy++) if ("undefined" != typeof startingPoint.gridsCells[i] && "undefined" != typeof startingPoint.gridsCells[i][iy]) {
                            var nextStartingPoint = startingPoint.gridsCells[i][iy].data("grid");
                            "function" == typeof startingPoint.settings.callAfterMove && startingPoint.settings.callAfterMove(orig + "" + i + iy, startingPoint.id + "" + i + iy, startingPoint, i, iy, i, iy), 
                            updateIdThenCallAfterMove(nextStartingPoint, i, iy, fixIDFrom, fixIDTo), "function" == typeof startingPoint.settings.callFinaliseMove && (updateIdThenCallAfterMoveTimeout = setTimeout(function() {
                                startingPoint.settings.callFinaliseMove();
                            }));
                        }
                    }
                }
            };
            if ("undefined" != typeof y) {
                if ("undefined" != typeof vert) return oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass), 
                oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y);
                if (y + 1 == oThis.gridsStructure[x].length) oThis.gridsStructure[x][y + 1] = null, 
                oThis.addCell(x, y + 1); else {
                    var reEx = [], reExm = {}, reExs = [];
                    reExm.c = oThis.metaAt[x].c, $.each(oThis.gridsCells[x], function(ly, acY) {
                        if (ly >= y + 1) {
                            reEx[ly + 1] = oThis.gridsCells[x][ly], reExm[ly + 1] = oThis.metaAt[x][ly], reExs[ly + 1] = oThis.gridsStructure[x][ly], 
                            reEx[ly + 1].data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(ly + 1) + "}"), 
                            "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + x + ly, oThis.id + "" + x + (ly + 1), oThis, x, ly + 1, x, ly);
                            var startingPoint = reEx[ly + 1].data("grid");
                            if ("undefined" != typeof startingPoint) {
                                startingPoint.settings.parentsGrid = oThis, startingPoint.settings.parentsX = parseInt(x), 
                                startingPoint.settings.parentsY = parseInt(ly + 1);
                                var fixIDFrom = startingPoint.id + "-" + x + ly, fixIDTo = startingPoint.id + "-" + x + (ly + 1);
                                updateIdThenCallAfterMove(startingPoint, x, ly + 1, fixIDFrom, fixIDTo);
                            }
                        } else reEx[ly] = oThis.gridsCells[x][ly], reExm[ly] = oThis.metaAt[x][ly], reExs[ly] = oThis.gridsStructure[x][ly];
                    }), oThis.gridsCells[x] = reEx, oThis.metaAt[x] = reExm, oThis.gridsStructure[x] = reExs, 
                    oThis.gridsStructure[x][y + 1] = null, oThis.addCell(x, y + 1), "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove();
                }
                {
                    var first = oThis.gridsCells[x][y], second = oThis.gridsCells[x][y + 1];
                    oThis.gridsCells[x].length;
                }
                if ("undefined" != typeof first && oThis.buildingGrid !== !0 && "half" == oThis.settings.splitMethodH) {
                    var height = oThis.metaAt[x][y].h ? parseFloat(oThis.metaAt[x][y].h) : 100, setHeight = oThis.halfOf(first, second, height, "h");
                    oThis.resizeCell(x, y, setHeight), oThis.resizeCell(x, y + 1, setHeight);
                } else {
                    var setHeight = this.halfOf(first, second, 0, "h", x);
                    $.each(this.gridsCells[x], function(ly, acY) {
                        oThis.resizeCell(x, ly, setHeight);
                    });
                }
            } else {
                if (x + 1 == oThis.gridsStructure.length) oThis.gridsStructure[x + 1] = null, oThis.addColumn(x + 1); else {
                    var reEx = [], reExm = {}, reExc = [], reExs = [];
                    $.each(oThis.gridsColumns, function(lx, acX) {
                        if (lx >= x + 1) for (reEx[lx + 1] = oThis.gridsColumns[lx], reExm[lx + 1] = oThis.metaAt[lx], 
                        reExc[lx + 1] = oThis.gridsCells[lx], reExs[lx + 1] = oThis.gridsStructure[lx], 
                        y = 0; y < reExc[lx + 1].length; y++) reExc[lx + 1][y].data("cell", '{"x":' + parseInt(lx + 1) + ',"y":' + parseInt(y) + "}"), 
                        "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + lx + y, oThis.id + "" + (lx + 1) + y, oThis, lx + 1, y, lx, y); else reEx[lx] = oThis.gridsColumns[lx], 
                        reExm[lx] = oThis.metaAt[lx], reExc[lx] = oThis.gridsCells[lx], reExs[lx] = oThis.gridsStructure[lx];
                    }), oThis.gridsColumns = reEx, oThis.metaAt = reExm, oThis.gridsCells = reExc, oThis.gridsStructure = reExs, 
                    oThis.gridsStructure[x + 1] = null, oThis.addColumn(x + 1), "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove();
                }
                var first = oThis.gridsColumns[x], second = oThis.gridsColumns[x + 1];
                if ("undefined" != typeof oThis.metaAt[x].c) var width = parseFloat(oThis.metaAt[x].c.w ? oThis.metaAt[x].c.w : 100); else var width = 100;
                if ("half" == oThis.settings.splitMethodV) var setWid = oThis.halfOf(first, second, width, "w"); else var setWid = oThis.halfOf(first, second, width, "w", 1);
                oThis.resizeColumn(x, setWid), oThis.resizeColumn(x + 1, setWid), oThis.gridsStructure[x + 1][0] = null, 
                oThis.addCell(x + 1, 0);
            }
            return oThis;
        }, grid.splitCellInColumn = function(el, x, y, data) {
            var content = this.returnContent(el);
            if ("undefined" != typeof this.metaAt[x][y]) var oldMeta = this.metaAt[x][y];
            return el.attr("id", ("" !== this.settings.nestedIn ? this.settings.nestedIn + "-" + this.id : this.id) + "-" + x + y + Date.now()).css(this.settings.hideBorder).off("click").gridSplit({
                parentsGrid: this,
                parentsX: x,
                parentsY: y,
                splitCellInColumn: !0,
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
                nestedIn: "" !== this.settings.nestedIn ? this.settings.nestedIn + "-" + this.id : this.id,
                data: "undefined" != typeof data ? data : "",
                resizable: this.settings.resizable
            }), this.gridsStructure[x][y] = {}, this.gridsStructure[x][y] = el.data("grid").gridsStructure, 
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            "undefined" != typeof content && $(content).length && el.data("grid").gridsCells[0][0].addClass(this.settings.hasContentClass).append(content), 
            this.metaAt[x][y] = el.data("grid").metaAt, oldMeta.h = "100%", el.data("grid").setMetaAt(0, 0, oldMeta), 
            el.data("grid");
        }, grid.delCell = function(x, y) {
            var oThis = this, makeResize = !1, reEx = [], reExm = {}, reExs = [];
            if ("undefined" != typeof oThis.gridsColumns[x] && "undefined" != typeof oThis.gridsCells[x][y]) if (oThis.gridsColumns.length > 0) if (oThis.gridsCells[x].length > 1) {
                var el = oThis.gridsCells[x][y];
                if ($("#h1-" + el.data("widgetID")).remove(), $("#h2-" + el.data("widgetID")).remove(), 
                $(window).off("resize.grid." + $(this.gridsCells[x][y]).data("widgetID")), reExm.c = oThis.metaAt[x].c, 
                $.each(this.gridsCells[x], function(ly, acY) {
                    if (ly > y) {
                        reEx[ly - 1] = oThis.gridsCells[x][ly], reExm[ly - 1] = oThis.metaAt[x][ly], reExs[ly - 1] = oThis.gridsStructure[x][ly], 
                        reEx[ly - 1].data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(ly - 1) + "}");
                        var startingPoint = reEx[ly - 1].data("grid");
                        "undefined" != typeof startingPoint && (startingPoint.settings.parentsGrid = oThis, 
                        startingPoint.settings.parentsX = parseInt(x), startingPoint.settings.parentsY = parseInt(ly - 1)), 
                        "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + x + ly, oThis.id + "" + x + (ly - 1), oThis, x, ly - 1, x, ly), 
                        "undefined" != typeof reEx[ly - 1] ? $(window).trigger("resize.grid." + $(reEx[ly - 1]).data("widgetID")) : oThis.delCell(x, ly - 1);
                    } else if (ly != y) reEx[ly] = oThis.gridsCells[x][ly], reExm[ly] = oThis.metaAt[x][ly], 
                    reExs[ly] = oThis.gridsStructure[x][ly]; else if (ly - 1 >= 0 && "half" == oThis.settings.splitMethodH) {
                        var newHeight = parseFloat(oThis.metaAt[x][ly].h) + parseFloat(oThis.metaAt[x][ly - 1].h) + "%";
                        oThis.metaAt[x][ly - 1].h = newHeight, oThis.gridsCells[x][ly - 1].css("height", newHeight);
                    } else (0 > ly - 1 || "half" !== oThis.settings.splitMethodH) && (makeResize = !0);
                }), oThis.gridsCells[x] = reEx, oThis.metaAt[x] = reExm, oThis.gridsStructure[x] = reExs, 
                oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                    oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                    oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                }
                "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove(), 
                $(el).remove(), makeResize && oThis.forcePerHeight(x);
            } else oThis.delColumn(x); else oThis.delColumn(x);
            return oThis;
        }, grid.delColumn = function(x) {
            var oThis = this, makeResize = !1, reEx = [], reExm = {}, reExs = [], reExc = [], el = oThis.gridsColumns[x];
            if ("undefined" != typeof oThis.gridsColumns[x]) {
                if ($.each(oThis.gridsColumns, function(lx, acX) {
                    if (lx > x) {
                        for (reEx[lx - 1] = oThis.gridsCells[lx], reExm[lx - 1] = oThis.metaAt[lx], reExs[lx - 1] = oThis.gridsStructure[lx], 
                        reExc[lx - 1] = oThis.gridsColumns[lx], y = 0; y < reEx[lx - 1].length; y++) "undefined" != typeof reEx[lx - 1][y] && (reEx[lx - 1][y].data("cell", '{"x":' + parseInt(lx - 1) + ',"y":' + parseInt(y) + "}"), 
                        "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + lx + y, oThis.id + "" + (lx - 1) + y, oThis, lx - 1, y, lx, y));
                        "undefined" != typeof reEx[lx - 1] ? $(window).trigger("resize.grid." + $(reEx[lx - 1]).data("widgetID")) : oThis.delColumn(lx - 1);
                    } else if (lx != x) {
                        if (reEx[lx] = oThis.gridsCells[lx], reExm[lx] = oThis.metaAt[lx], reExs[lx] = oThis.gridsStructure[lx], 
                        reExc[lx] = oThis.gridsColumns[lx], "function" == typeof oThis.settings.callAfterMove) for (y = 0; y < reEx[lx].length; y++) oThis.settings.callAfterMove(oThis.id + "" + lx + y, oThis.id + "" + lx + y, oThis, lx, y, lx, y);
                    } else if (lx - 1 >= 0 && "half" == oThis.settings.splitMethodV) {
                        var newWid = parseFloat(oThis.metaAt[lx].c.w) + parseFloat(oThis.metaAt[lx - 1].c.w) + "%";
                        oThis.metaAt[lx - 1].c.w = newWid, oThis.gridsColumns[lx - 1].css("width", newWid);
                    } else (0 > lx - 1 || "half" !== oThis.settings.splitMethodV) && (makeResize = !0);
                }), $(el).remove(), oThis.gridsCells = reEx, oThis.metaAt = reExm, oThis.gridsStructure = reExs, 
                oThis.gridsColumns = reExc, oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                    oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                    oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                }
                if (0 == reEx.length && "undefined" != typeof oThis.$el.data("cell")) {
                    var cell = JSON.parse(oThis.$el.data("cell"));
                    isNaN(cell.x) || isNaN(cell.y) || "undefined" != typeof oThis.parent().gridsCells[cell.x] && "undefined" != typeof oThis.parent().gridsCells[cell.x][cell.y] && oThis.parent().delAt(cell.x, cell.y);
                }
                makeResize && oThis.forcePerWidth(), "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove();
            }
            return oThis;
        }, grid.delAt = function(x, y) {
            return "undefined" == typeof y || null == y ? this.delColumn(x) : this.delCell(x, y);
        }, grid.addRail = function(x, y) {
            var oThis = this, to = y ? oThis.gridsCells[x][y] : oThis.gridsColumns[x];
            if (!to.hasClass(this.settings.resizableClass)) {
                if (to.addClass(this.settings.resizableClass), "column" == $(to).data("type")) {
                    if (0 !== x && "0" !== x) {
                        var rail = (this.settings.gridColumnClass, this.settings.vertRail), rRail = rail.clone();
                        rRail.appendTo(to), rRail.on("mouseenter", function() {
                            var x = $(this).closest("." + oThis.settings.gridColumnClass).prevAll("." + oThis.settings.gridColumnClass).length;
                            ("undefined" == typeof oThis.gridsColumns[x] || 0 == x) && rRail.remove();
                        }).draggable({
                            axis: "x",
                            containment: to.parent(),
                            start: function(event, ui) {
                                var x = $(this).closest("." + oThis.settings.gridColumnClass).prevAll("." + oThis.settings.gridColumnClass).length;
                                if ("function" == typeof oThis.settings.callSetFocus && oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x - 1][0]).data("cell")), oThis), 
                                "undefined" != typeof oThis.gridsColumns[x] && 0 !== x) {
                                    rRail.data("x", x);
                                    {
                                        oThis.gridsColumns[x - 1];
                                    }
                                    rRail.origRight = oThis.gridsColumns[x].offset().left - oThis.$el.offset().left, 
                                    rRail.origLeft = oThis.gridsColumns[x - 1].offset().left - oThis.$el.offset().left, 
                                    rRail.origWidth = rRail.origRight - rRail.origLeft, $(this).addClass(oThis.settings.draggingClass);
                                } else rRail.remove();
                            },
                            stop: function() {
                                var newRight = $(this).offset().left, newWidth = newRight - rRail.origWidth - oThis.$el.offset().left, pixels = newWidth + rRail.origWidth - rRail.origLeft, rWidth = oThis.perOfWidth(pixels);
                                oThis.gridsColumns[$(this).data("x") - 1].css("width", rWidth);
                                var rem = oThis.gridsColumns.length - $(this).data("x"), takePer = (pixels - rRail.origWidth) / rem;
                                if (rem > 0) {
                                    for (x = $(this).data("x"); x < oThis.gridsColumns.length; x++) {
                                        var thisWid = oThis.gridsColumns[x].outerWidth(), thisnewWid = thisWid - takePer;
                                        oThis.gridsColumns[x].css("width", oThis.perOfWidth(thisnewWid));
                                    }
                                    oThis.forcePerWidth();
                                }
                                $(this).css("left", "auto"), "function" == typeof oThis.settings.callSetHash && oThis.settings.callSetHash();
                            }
                        });
                    }
                } else if (0 !== y && "0" !== y) {
                    var rail = (this.settings.gridCellClass, this.settings.horizRail), rRail = rail.clone();
                    rRail.appendTo(to);
                    var oThis = this;
                    rRail.on("mouseenter", function() {
                        var y = $(this).closest("." + oThis.settings.gridCellClass).prevAll("." + oThis.settings.gridCellClass).length, x = $(this).closest("." + oThis.settings.gridColumnClass).prevAll("." + oThis.settings.gridColumnClass).length;
                        ("undefined" == typeof oThis.gridsCells[x][y] || 0 == y) && rRail.remove();
                    }).draggable({
                        containment: to.parent(),
                        axis: "y",
                        start: function(event, ui) {
                            var y = $(this).closest("." + oThis.settings.gridCellClass).prevAll("." + oThis.settings.gridCellClass).length, x = $(this).closest("." + oThis.settings.gridColumnClass).prevAll("." + oThis.settings.gridColumnClass).length;
                            "function" == typeof oThis.settings.callSetFocus && oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x][y - 1]).data("cell")), oThis), 
                            "undefined" != typeof oThis.gridsCells[x][y] && 0 !== y ? (rRail.data("x", x), rRail.data("y", y), 
                            $(this).addClass(oThis.settings.draggingClass)) : rRail.remove();
                        },
                        stop: function(e, ui) {
                            var moved = ui.position.top - ui.originalPosition.top, y = $(this).data("y"), x = $(this).data("x"), newHeight = ($(this).offset().top, 
                            oThis.gridsCells[x][y - 1].outerHeight() + moved), rHeight = oThis.perOfHeight(newHeight);
                            oThis.resizeCell(x, y - 1, rHeight), oThis.gridsCells[x][y - 1].css("height", rHeight), 
                            newHeight = oThis.gridsCells[x][y].outerHeight() - moved, rHeight = oThis.perOfHeight(newHeight), 
                            oThis.resizeCell(x, y, rHeight), oThis.gridsCells[x][y].css("height", rHeight), 
                            $(this).css("top", "auto"), oThis.forcePerHeight(x), "function" == typeof oThis.settings.callSetHash && oThis.settings.callSetHash();
                        }
                    });
                }
                $(window).trigger("resize.grid");
            }
        }, grid.resizeColumn = function(x, to) {
            "undefined" == typeof this.metaAt && (this.metaAt = {}), "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, 
            this.metaAt[x].c = {});
            var obj = {
                w: to
            };
            this.setMetaAt(x, null, obj);
            var asPix = parseFloat(this.$el.outerWidth() / 100 * parseFloat(to));
            this.gridsColumns[x].data("trueWidth", asPix), "function" == typeof this.settings.callAfterResize && "undefined" != typeof this.gridsColumns[x] && "undefined" != typeof this.gridsCells[x][0] && this.settings.callAfterResize(this.gridsCells[x][0], this, this.gridsColumns[x].data("trueWidth"), this.gridsCells[x][0].data("trueHeight"));
        }, grid.resizeCell = function(x, y, to) {
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            "undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {});
            var obj = {
                h: to
            };
            this.setMetaAt(x, y, obj);
            var asPix = parseFloat(this.gridsColumns[x].outerHeight() / 100 * parseFloat(to)), cell = this.gridsCells[x][y];
            cell.data("trueHeight", asPix), "function" == typeof this.settings.callAfterResize && "undefined" != typeof this.gridsColumns[x] && "undefined" != typeof this.gridsCells[x][y] && this.settings.callAfterResize(this.gridsCells[x][y], this, this.gridsColumns[x].data("trueWidth"), this.gridsCells[x][y].data("trueHeight"));
        }, grid.setMetaAt = function(x, y, obj) {
            var oThis = this;
            "undefined" == typeof oThis.metaAt[x] && (oThis.metaAt[x] = {}, oThis.metaAt[x].c = {}), 
            null === y ? oThis.metaAt[x].c = $.extend({}, oThis.metaAt[x].c, obj) : ("undefined" == typeof oThis.metaAt[x][y] && (oThis.metaAt[x][y] = {}), 
            oThis.metaAt[x][y] = $.extend({}, oThis.metaAt[x][y], obj)), $(window).trigger("resize.grid");
        }, grid.setMetaAllCells = function(obj) {
            var oThis = this;
            $.each(grid.gridsCells, function(x, column) {
                $.each(column, function(y, cell) {
                    "undefined" != typeof cell.data("grid") ? (cell.data("grid").setMetaAllCells(obj), 
                    oThis.setMetaAt(x, null, obj)) : (oThis.setMetaAt(x, null, obj), oThis.setMetaAt(x, y, obj));
                });
            });
        }, grid.handleClick = function(to, type, grids) {
            if ("cell" === type) {
                {
                    this.gridCell;
                }
                "function" == typeof grids.settings.callSetFocus && grids.settings.callSetFocus(JSON.parse($(to).data("cell")), grids);
            }
        }, grid.addControls = function(x, y) {
            var oThis = this, to = y ? oThis.gridsCells[x][y] : oThis.gridsColumns[x];
            if ("column" == $(to).data("type")) {
                var type = (this.settings.gridColumnClass, "column");
                0 !== x && 1 == this.settings.resizable && this.addRail(x, y);
            } else {
                var type = (this.settings.gridCellClass, "cell");
                0 !== y && 1 == this.settings.resizable && this.addRail(x, y), to.on("click", function() {
                    oThis.handleClick(this, type, $(to).data("gridAt"));
                });
            }
        }, grid.halfOf = function(first, second, full, type, flag) {
            if ("w" == type) if ("undefined" != typeof flag) var ret = this.perOfWidthEls(); else {
                var ret = parseFloat(full / 2) + "%";
                $(first).css({
                    width: ret,
                    "float": "left"
                }), $(second).css({
                    width: ret,
                    "float": "left"
                });
            } else if ("h" == type) if ("undefined" != typeof flag) var ret = this.perOfHeightEls(flag); else {
                var ret = parseFloat(full / 2) + "%";
                $(first).css({
                    height: ret
                }), $(second).css({
                    height: ret
                });
            }
            return ret;
        }, grid.perOfWidth = function(pixels) {
            var per = 100 / this.$el.width() * pixels;
            return per + "%";
        }, grid.perOfWidthEls = function() {
            var oThis = this, no = oThis.gridsColumns.length, per = 100 / no + "%";
            return $.each(oThis.gridsColumns, function(x, column) {
                column.css({
                    width: per,
                    "float": "left"
                }), oThis.resizeColumn(x, per);
            }), per;
        }, grid.perOfHeight = function(pixels) {
            var per = 100 / this.$el.outerHeight() * pixels;
            return per + "%";
        }, grid.perOfHeightEls = function(x) {
            var oThis = this, no = oThis.gridsCells[x].length, per = 100 / no + "%";
            return $.each(oThis.gridsCells[x], function(y, cell) {
                cell.css({
                    height: per
                }), oThis.resizeCell(x, y, per);
            }), per;
        }, grid.equalPers = function(arr, vh) {
            var i = arr.length, total = 0, target = 100;
            for (min = 0; i--; ) min = 0 == vh ? this.settings.vertMin : this.settings.horizMin, 
            arr[i] < min && (arr[i] = min), total += arr[i];
            for (x = 0; x < arr.length; x++) arr[x] = target / total * arr[x];
            return arr;
        }, grid.forcePerWidth = function() {
            var wids = [], oThis = this;
            $.each(this.gridsColumns, function(key, col) {
                var width = parseFloat(oThis.perOfWidth($(col).width()));
                wids.push(width);
            });
            var wids = oThis.equalPers(wids, 0);
            return $.each(this.gridsColumns, function(key, col) {
                $(col).css({
                    width: wids[key] + "%"
                }), oThis.resizeColumn(key, wids[key] + "%");
            }), oThis;
        }, grid.forcePerHeight = function(x) {
            var heights = [], oThis = this, col = this.gridsColumns[x];
            if ("undefined" != typeof col) {
                $.each(oThis.gridsCells[x], function(y, cell) {
                    var height = parseFloat(oThis.perOfHeight($(cell).outerHeight()));
                    heights.push(height);
                });
                var heights = oThis.equalPers(heights, 1);
                $.each(oThis.gridsCells[x], function(y, cell) {
                    $(cell).css({
                        height: heights[y] + "%"
                    }), oThis.resizeCell(x, y, heights[y] + "%");
                });
            }
            return oThis;
        }, grid.evenAll = function() {
            var oThis = this, data = this.metaAt, countColumns = oThis.countCells(data);
            $.each(data, function(x, column) {
                if (!isNaN(x)) {
                    var wid = 100 / countColumns, countCells = oThis.countCells(column);
                    data[x].c.w = wid + "%", "function" == typeof oThis.settings.callAfterResize && oThis.settings.callAfterResize(oThis.gridsCells[x][0], oThis, oThis.gridsColumns[x].data("trueWidth"), oThis.gridsCells[x][0].data("trueHeight")), 
                    countCells > 0 ? $.each(column, function(y, cell) {
                        if (!isNaN(y)) {
                            var height = 100 / countCells;
                            if (data[x][y].h = height + "%", "function" == typeof oThis.settings.callAfterResize && oThis.settings.callAfterResize(oThis.gridsCells[x][y], oThis, oThis.gridsColumns[x].data("trueWidth"), oThis.gridsCells[x][y].data("trueHeight")), 
                            $(window).trigger("resize.grid." + $(oThis.gridsCells[x][y]).data("widgetID")), 
                            "object" == typeof cell[0]) {
                                var nGrid = oThis.gridsCells[x][y].data("grid");
                                nGrid.evenAll();
                            }
                        }
                    }) : data[x].c.w = "100%";
                }
            }), oThis.setMeta(data), oThis.parent() === oThis && "function" == typeof oThis.settings.callSetHash && oThis.settings.callSetHash();
        }, grid.setProperty = function(property, value) {
            var oThis = this;
            if (property) {
                oThis.settings[property] = value;
                {
                    var data = oThis.metaAt;
                    oThis.countCells(data);
                }
                $.each(data, function(x, column) {
                    if (!isNaN(x)) {
                        var countCells = oThis.countCells(column);
                        countCells > 0 && $.each(column, function(y, cell) {
                            if (!isNaN(y) && "object" == typeof cell[0]) {
                                var nGrid = oThis.gridsCells[x][y].data("grid");
                                nGrid.setProperty(property, value);
                            }
                        });
                    }
                });
            }
        }, grid.returnProperty = function(property) {
            return this.settings[property];
        }, grid.return1stGrid = function() {
            var oThis = this;
            return oThis.parent() === oThis ? oThis : void (oThis = oThis.parent().return1stGrid());
        }, grid.return1stCell = function() {
            var oThis = this;
            return oThis.gridsCells[0][0].hasClass(oThis.settings.hasChildrenClass) ? oThis.gridsCells[0][0].data("grid").return1stCell() : oThis.gridsCells[0][0];
        }, grid.returnLXY = function(x, y, response) {
            var oThis = this;
            if ("undefined" == typeof response ? response = y + "" + x + "-" : response += y + "" + x + "-", 
            oThis !== oThis.parent()) {
                var pG = oThis.settings.parentsGrid, pX = oThis.settings.parentsX, pY = oThis.settings.parentsY;
                if ("undefined" != typeof pX) return pG.returnLXY(pX, pY, response);
            }
            return response;
        }, grid.returnLongXY = function(x, y) {
            return this.returnLXY(x, y).split("").reverse().join("").replace(/(^[-\s]+)|([-\s]+$)/g, "");
        }, grid.returnContent = function(cell) {
            var content = cell.children();
            if (1 == content.length) {
                if (0 == content.hasClass("horizrail")) var useContent = content;
            } else if (2 == content.length) if (0 == $(content[0]).hasClass("horizrail")) var useContent = $(content[0]); else var useContent = $(content[1]);
            return $(useContent).parents("html").length && (useContent = $(useContent).detach()), 
            $(useContent);
        }, grid.returnStructure = function() {
            return JSON.stringify(this.gridsStructure);
        }, grid.returnMeta = function() {
            return JSON.stringify(this.metaAt);
        }, grid.returnCells = function() {
            return this.gridsCells;
        }, grid.parent = function() {
            return "" === this.settings.parentsGrid ? this : this.settings.parentsGrid;
        }, grid.dontDestroy = function(undefined) {
            return "function" == typeof this.settings.callBeforeDestroy && this.settings.callBeforeDestroy(this, 1), 
            this.$el;
        }, grid.destroy = function(undefined) {
            return "function" == typeof this.settings.callBeforeDestroy && this.settings.callBeforeDestroy(this), 
            this.$el.empty().removeData("grid"), this.$el;
        }, grid.init(el, options);
    };
});