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
        var grid, init = function(that) {
            void 0 == $(that).data("grid") ? (grid = new gridSplit(that, options), $(that).data("grid", grid)) : grid = "undefined" != typeof options ? "undefined" != typeof options.data ? that.data("grid").init(that, options) : "undefined" != typeof options.setMeta ? that.data("grid").setMeta(options.setMeta, !1) : that.data("grid") : that.data("grid");
        };
        return init(this), grid;
    };
    var gridSplit = function(el, options) {
        var grid = this, defaults = {
            horizRail: $("<div/>").addClass("horizrail"),
            vertRail: $("<div/>").addClass("vertrail"),
            gridColClass: "column",
            gridCellClass: "gridCell",
            innerGridClass: "inner-grid",
            insideCellClass: "insideCell",
            hasChildrenClass: "hasChildren",
            hasContentClass: "hasContent h100per",
            resizableClass: "isResizable",
            draggingClass: "dragging",
            data: "",
            parentGrid: "",
            nestedIn: "",
            resizable: !0,
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
                border: "0px solid #000"
            }
        };
        grid.init = function(el, options) {
            return this.settings = {}, this.settings = $.extend({}, defaults, options), this.id = el.attr("id"), 
            this.$el = $("#" + this.id), this.el = this.$el[0], this.gridsColumns = [], this.gridsCells = [], 
            this.gridsStructure = [], this.timeoutFPH = [], this.metaAt = {}, $("#" + this.id + " ." + this.settings.innerGridClass).remove(), 
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
                isNaN(x) || (oThis.gridsStructure[x] = null, oThis.addColumn(x, undefined, !0), 
                oThis.gridsColumns[x].css("float", "left"), oThis.countCells(column) > 0 ? $.each(column, function(y, cell) {
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
                        oThis.resizeCell(x, y, cell.h), oThis.gridsCells[x][y].css("height", cell.h)) : ("undefined" != typeof oThis.gridsCells[x][y] && (oThis.gridsCells[x][y].css("height", cell.h), 
                        oThis.resizeCell(x, y, cell.h)), "undefined" != typeof cell.fA && (cell.isFullScreen === !0 && (oThis.metaAt[x][y].isFullScreen = !0), 
                        "undefined" != typeof cell.fSID && (oThis.metaAt[x][y].fSID = cell.fSID), "function" == typeof oThis.settings.callFocusAndLoad && oThis.settings.callFocusAndLoad(oThis, x, y, cell.fA, oThis.metaAt[x][y].isFullScreen)));
                    });
                }
            }), oThis.buildingGrid = !1, this;
        }, grid.countCells = function(arr) {
            var t = 0;
            return $.each(arr, function(k, arrr) {
                isNaN(k) || t++;
            }), t;
        }, grid.addCell = function(x, y, after) {
            var oThis = this;
            if ("undefined" == typeof x || "undefined" == typeof y) return this;
            if (this.gridsStructure.length - 1 < x && (x = this.gridsStructure.length - 1), 
            null == this.gridsStructure[x][y]) {
                if (el = $('<div class="' + this.settings.gridCellClass + " " + (1 == this.settings.splitCellInColumn ? this.settings.insideCellClass + " " + this.settings.useInsideCell : "") + '" ></div>'), 
                "undefined" != typeof after ? el.insertAfter(after) : el.appendTo(this.gridsColumns[x]), 
                this.gridsStructure[x][y] = !0, this.gridsCells[x][y] = el, "undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {}), 
                el.data("gridAt", this), el.data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(y) + "}"), 
                this.addControls(this.gridsCells[x][y], x, y), oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                    oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                    oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                }
            } else this.gridsStructure[x].length > y ? this.splitAt(x, y) : (x < this.gridsStructure.length - 1 ? this.splitAt(this.gridsStructure.length, y) : this.splitAt(x, this.gridsStructure[x].length - 1), 
            delete this.gridsStructure[x][y]);
            return this;
        }, grid.addColumn = function(x, after, skip) {
            var oThis = this;
            if ("undefined" != typeof x) {
                if (null == this.gridsStructure[x]) {
                    var el = $('<div class="' + this.settings.gridColClass + '" ></div>');
                    if ("undefined" != typeof after ? el.insertAfter(after) : el.appendTo(this.elInner), 
                    this.gridsStructure[x] = [], this.gridsCells[x] = [], this.metaAt[x] = {}, this.gridsColumns[x] = el.data("tpe", "c"), 
                    this.addControls(this.gridsColumns[x], x), oThis !== oThis.parent()) {
                        var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                        oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                        oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                    }
                } else this.gridsStructure.length > x ? this.splitAt(x) : (this.splitAt(this.gridsStructure.length - 1), 
                delete this.gridsStructure[x]);
                return 1 == !skip && (clearTimeout(oThis.timeoutFP), oThis.timeoutFP = setTimeout(function() {
                    oThis.forcePerWidth();
                })), this;
            }
        }, grid.splitAt = function(x, y, cell) {
            var oThis = this;
            if ("undefined" != typeof y) {
                if ("undefined" != typeof cell) return oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass), 
                oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y);
                if (y + 1 == oThis.gridsStructure[x].length) oThis.gridsStructure[x][y + 1] = null, 
                oThis.addCell(x, y + 1); else {
                    var reEx = [], reExm = {}, reExs = [];
                    reExm.c = oThis.metaAt[x].c, $.each(oThis.gridsCells[x], function(ly, acY) {
                        ly >= y + 1 ? (reEx[ly + 1] = oThis.gridsCells[x][ly], reExm[ly + 1] = oThis.metaAt[x][ly], 
                        reExs[ly + 1] = oThis.gridsStructure[x][ly], reEx[ly + 1].data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(ly + 1) + "}"), 
                        "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + x + ly, oThis.id + "" + x + (ly + 1), oThis, x, ly + 1)) : (reEx[ly] = oThis.gridsCells[x][ly], 
                        reExm[ly] = oThis.metaAt[x][ly], reExs[ly] = oThis.gridsStructure[x][ly]);
                    }), oThis.gridsCells[x] = reEx, oThis.metaAt[x] = reExm, oThis.gridsStructure[x] = reExs, 
                    oThis.gridsStructure[x][y + 1] = null, oThis.addCell(x, y + 1, oThis.gridsCells[x][y]), 
                    "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove();
                }
                {
                    var first = oThis.gridsCells[x][y], second = oThis.gridsCells[x][y + 1];
                    oThis.gridsCells[x].length;
                }
                if ("undefined" != typeof first && oThis.buildingGrid !== !0 && "half" == oThis.settings.splitMethodH) {
                    var height = first.outerHeight(), setHeight = oThis.halfOf(first, second, height, "h");
                    oThis.resizeCell(x, y, setHeight), oThis.resizeCell(x, y + 1, setHeight), clearTimeout(oThis.timeoutFPH[x]), 
                    oThis.timeoutFPH[x] = setTimeout(function() {
                        oThis.forcePerHeight(x);
                    });
                } else {
                    var setHeight = this.halfOf(first, second, 0, "h", oThis.gridsCells[x]);
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
                        "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + lx + y, oThis.id + "" + (lx + 1) + y, oThis, lx + 1, y); else reEx[lx] = oThis.gridsColumns[lx], 
                        reExm[lx] = oThis.metaAt[lx], reExc[lx] = oThis.gridsCells[lx], reExs[lx] = oThis.gridsStructure[lx];
                    }), oThis.gridsColumns = reEx, oThis.metaAt = reExm, oThis.gridsCells = reExc, oThis.gridsStructure = reExs, 
                    oThis.gridsStructure[x + 1] = null, oThis.addColumn(x + 1, oThis.gridsColumns[x]), 
                    "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove();
                }
                var first = oThis.gridsColumns[x], second = oThis.gridsColumns[x + 1], width = oThis.gridsColumns[x].width();
                if ("half" == oThis.settings.splitMethodV) var setWid = oThis.halfOf(first, second, width, "w"); else var setWid = oThis.halfOf(first, second, width, "w", oThis);
                oThis.resizeColumn(x, setWid), oThis.resizeColumn(x + 1, setWid), oThis.gridsStructure[x + 1][0] = null, 
                oThis.addCell(x + 1, 0);
            }
            return oThis;
        }, grid.splitCellInColumn = function(el, x, y, data) {
            var content = this.returnContent(el);
            if ("undefined" != typeof this.metaAt[x][y]) var h = this.metaAt[x][y].h, fA = this.metaAt[x][y].fA;
            return el.attr("id", ("" !== this.settings.nestedIn ? this.settings.nestedIn + "-" + this.id : this.id) + "-" + x + y).css(this.settings.hideBorder).off("click").gridSplit({
                parentGrid: this,
                parentsX: x,
                parentsY: y,
                splitCellInColumn: !0,
                callFocusAndLoad: this.settings.callFocusAndLoad,
                callResetGrid: null,
                callAfterMove: this.settings.callAfterMove,
                callFinaliseMove: this.settings.callFinaliseMove,
                callSetFocus: this.settings.callSetFocus,
                callBeforeDestroy: this.settings.callBeforeDestroy,
                nestedIn: "" !== this.settings.nestedIn ? this.settings.nestedIn + "-" + this.id : this.id,
                data: "undefined" != typeof data ? data : "",
                resizable: this.settings.resizable
            }), this.gridsStructure[x][y] = {}, this.gridsStructure[x][y] = el.data("grid").gridsStructure, 
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            "undefined" != typeof content && el.data("grid").gridsCells[0][0].addClass(this.settings.hasContentClass).append(content), 
            this.metaAt[x][y] = el.data("grid").metaAt, this.metaAt[x][y].h = h, el.data("grid").setMetaAt(0, 0, {
                fA: fA,
                h: "100%"
            }), el.data("grid");
        }, grid.delCell = function(x, y) {
            var oThis = this, reEx = [], reExm = {}, reExs = [];
            if ("undefined" != typeof oThis.gridsColumns[x] && "undefined" != typeof oThis.gridsCells[x][y]) if (oThis.gridsColumns.length > 0) if (oThis.gridsCells[x].length > 1) {
                var el = oThis.gridsCells[x][y];
                if ($("#h1-" + el.data("widgetID")).remove(), $("#h2-" + el.data("widgetID")).remove(), 
                $(window).off("resize.grid." + $(this.gridsCells[x][y]).data("widgetID")), reExm.c = oThis.metaAt[x].c, 
                $.each(this.gridsCells[x], function(ly, acY) {
                    ly > y ? (reEx[ly - 1] = oThis.gridsCells[x][ly], reExm[ly - 1] = oThis.metaAt[x][ly], 
                    reExs[ly - 1] = oThis.gridsStructure[x][ly], reEx[ly - 1].data("cell", '{"x":' + parseInt(x) + ',"y":' + parseInt(ly - 1) + "}"), 
                    "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + x + ly, oThis.id + "" + x + (ly - 1), oThis, x, ly - 1), 
                    "undefined" != typeof reEx[ly - 1] ? $(window).trigger("resize.grid." + $(reEx[ly - 1]).data("widgetID")) : oThis.delCell(x, ly - 1)) : ly != y ? (reEx[ly] = oThis.gridsCells[x][ly], 
                    reExm[ly] = oThis.metaAt[x][ly], reExs[ly] = oThis.gridsStructure[x][ly]) : ly - 1 >= 0 && (oThis.resizeCell(x, ly, oThis.gridsCells[x][ly].height() + oThis.gridsCells[x][ly - 1].height()), 
                    oThis.gridsCells[x][ly - 1].height(oThis.gridsCells[x][ly].height() + oThis.gridsCells[x][ly - 1].height()));
                }), oThis.gridsCells[x] = reEx, oThis.metaAt[x] = reExm, oThis.gridsStructure[x] = reExs, 
                oThis.forcePerHeight(x), oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                    oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                    oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure;
                }
                "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove(), 
                $(el).remove();
            } else oThis.delColumn(x); else oThis.delColumn(x);
            return oThis;
        }, grid.delColumn = function(x) {
            var oThis = this, reEx = [], reExm = {}, reExs = [], reExc = [], el = oThis.gridsColumns[x];
            if ("undefined" != typeof oThis.gridsColumns[x]) {
                if ($.each(oThis.gridsColumns, function(lx, acX) {
                    if (lx > x) {
                        for (reEx[lx - 1] = oThis.gridsCells[lx], reExm[lx - 1] = oThis.metaAt[lx], reExs[lx - 1] = oThis.gridsStructure[lx], 
                        reExc[lx - 1] = oThis.gridsColumns[lx], y = 0; y < reEx[lx - 1].length; y++) "undefined" != typeof reEx[lx - 1][y] && (reEx[lx - 1][y].data("cell", '{"x":' + parseInt(lx - 1) + ',"y":' + parseInt(y) + "}"), 
                        "function" == typeof oThis.settings.callAfterMove && oThis.settings.callAfterMove(oThis.id + "" + lx + y, oThis.id + "" + (lx - 1) + y, oThis, lx - 1, y));
                        "undefined" != typeof reEx[lx - 1] ? $(window).trigger("resize.grid." + $(reEx[lx - 1]).data("widgetID")) : oThis.delColumn(lx - 1);
                    } else if (lx != x) {
                        if (reEx[lx] = oThis.gridsCells[lx], reExm[lx] = oThis.metaAt[lx], reExs[lx] = oThis.gridsStructure[lx], 
                        reExc[lx] = oThis.gridsColumns[lx], "function" == typeof oThis.settings.callAfterMove) for (y = 0; y < reEx[lx].length; y++) oThis.settings.callAfterMove(oThis.id + "" + lx + y, oThis.id + "" + lx + y, oThis, lx, y);
                    } else lx - 1 >= 0 && (oThis.resizeColumn(lx - 1, oThis.gridsColumns[lx].outerWidth() + oThis.gridsColumns[lx - 1].outerWidth()), 
                    oThis.gridsColumns[lx - 1].outerWidth(oThis.gridsColumns[lx].outerWidth() + oThis.gridsColumns[lx - 1].outerWidth()));
                }), $(el).remove(), oThis.gridsCells = reEx, oThis.metaAt = reExm, oThis.gridsStructure = reExs, 
                oThis.gridsColumns = reExc, oThis !== oThis.parent()) {
                    var cell = JSON.parse(oThis.$el.data("cell")), origHeight = oThis.parent().metaAt[cell.x][cell.y].h;
                    oThis.parent().metaAt[cell.x][cell.y] = oThis.metaAt, oThis.parent().metaAt[cell.x][cell.y].h = origHeight, 
                    oThis.parent().gridsStructure[cell.x][cell.y] = oThis.gridsStructure, oThis.parent().forcePerHeight(cell.x);
                }
                if (0 == reEx.length && "undefined" != typeof oThis.$el.data("cell")) {
                    var cell = JSON.parse(oThis.$el.data("cell"));
                    isNaN(cell.x) || isNaN(cell.y) || "undefined" != typeof oThis.parent().gridsCells[cell.x] && "undefined" != typeof oThis.parent().gridsCells[cell.x][cell.y] && oThis.parent().delAt(cell.x, cell.y);
                }
                "function" == typeof oThis.settings.callFinaliseMove && oThis.settings.callFinaliseMove(), 
                oThis.forcePerWidth();
            }
            return oThis;
        }, grid.delAt = function(x, y) {
            return "undefined" == typeof y || null == y ? this.delColumn(x) : this.delCell(x, y);
        }, grid.addRail = function(to, x, y) {
            var oThis = this;
            if (1 == this.settings.resizable && to.addClass(this.settings.resizableClass), "c" == $(to).data("tpe")) {
                if (0 !== x) {
                    var rail = (this.settings.gridColClass, this.settings.vertRail), rRail = rail.clone();
                    rRail.appendTo(to), rRail.on("mouseenter", function() {
                        var x = $(this).closest("." + oThis.settings.gridColClass).prevAll("." + oThis.settings.gridColClass).length;
                        ("undefined" == typeof oThis.gridsColumns[x] || 0 == x) && rRail.remove();
                    }).draggable({
                        axis: "x",
                        containment: to.parent(),
                        start: function(event, ui) {
                            var x = $(this).closest("." + oThis.settings.gridColClass).prevAll("." + oThis.settings.gridColClass).length;
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
            } else if (0 !== y) {
                var rail = (this.settings.gridCellClass, this.settings.horizRail), rRail = rail.clone();
                rRail.appendTo(to);
                var oThis = this;
                rRail.on("mouseenter", function() {
                    var y = $(this).closest("." + oThis.settings.gridCellClass).prevAll("." + oThis.settings.gridCellClass).length, x = $(this).closest("." + oThis.settings.gridColClass).prevAll("." + oThis.settings.gridColClass).length;
                    ("undefined" == typeof oThis.gridsCells[x][y] || 0 == y) && rRail.remove();
                }).draggable({
                    containment: to.parent(),
                    axis: "y",
                    start: function(event, ui) {
                        var y = $(this).closest("." + oThis.settings.gridCellClass).prevAll("." + oThis.settings.gridCellClass).length, x = $(this).closest("." + oThis.settings.gridColClass).prevAll("." + oThis.settings.gridColClass).length;
                        "function" == typeof oThis.settings.callSetFocus && oThis.settings.callSetFocus(JSON.parse($(oThis.gridsCells[x][y - 1]).data("cell")), oThis), 
                        "undefined" != typeof oThis.gridsCells[x][y] && 0 !== y ? (rRail.data("x", x), rRail.data("y", y), 
                        $(this).addClass(oThis.settings.draggingClass)) : rRail.remove();
                    },
                    stop: function(e, ui) {
                        var moved = ui.position.top - ui.originalPosition.top, y = $(this).data("y"), x = $(this).data("x"), newHeight = ($(this).offset().top, 
                        oThis.gridsCells[x][y - 1].outerHeight() + moved), gridHeight = oThis.gridsColumns[x].outerHeight(), rHeight = oThis.perOfHeight(newHeight, gridHeight);
                        oThis.resizeCell(x, y - 1, rHeight), oThis.gridsCells[x][y - 1].css("height", rHeight), 
                        newHeight = oThis.gridsCells[x][y].outerHeight() - moved, rHeight = oThis.perOfHeight(newHeight, gridHeight), 
                        oThis.resizeCell(x, y, rHeight), oThis.gridsCells[x][y].css("height", rHeight), 
                        $(this).css("top", "auto"), oThis.forcePerHeight(x), "function" == typeof oThis.settings.callSetHash && oThis.settings.callSetHash();
                    }
                });
            }
        }, grid.resizeColumn = function(x, to) {
            "undefined" == typeof this.metaAt && (this.metaAt = {}), "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, 
            this.metaAt[x].c = {});
            var obj = {
                w: to
            };
            this.setMetaAt(x, null, obj);
            var asPix = parseInt((this.$el.outerWidth() / 100 * parseInt(to)).toFixed(0));
            this.gridsColumns[x].data("trueWidth", asPix);
        }, grid.resizeCell = function(x, y, to) {
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            "undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {});
            var obj = {
                h: to
            };
            this.setMetaAt(x, y, obj);
            var asPix = parseInt((this.gridsColumns[x].height() / 100 * parseInt(to)).toFixed(0)), cell = this.gridsCells[x][y];
            cell.data("trueHeight", asPix), cell.find(".status").length > 0 && (cell.height() + cell.offset().top < cell.find(".status").offset().top + cell.find(".status").height() - 3 ? cell.find(".status").css("opacity", "0") : cell.find(".status").css("opacity", "1"));
        }, grid.setMetaAt = function(x, y, obj) {
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            null === y ? this.metaAt[x].c = $.extend({}, this.metaAt[x].c, obj) : ("undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {}), 
            this.metaAt[x][y] = $.extend({}, this.metaAt[x][y], obj)), $(window).trigger("resize.grid");
        }, grid.addControls = function(to, x, y) {
            var oThis = this;
            if ("c" == $(to).data("tpe")) {
                var tpe = (this.settings.gridColClass, "c");
                0 !== x && 1 == this.settings.resizable && this.addRail(to, x, y);
            } else {
                var tpe = (this.settings.gridCellClass, "r");
                0 !== y && 1 == this.settings.resizable && this.addRail(to, x, y);
            }
            to.on("click", function() {
                oThis.clickThis(this, tpe, $(to).data("gridAt"));
            });
        }, grid.clickThis = function(to, type, grids) {
            if ("c" !== type) {
                {
                    this.gridCell;
                }
                "function" == typeof grids.settings.callSetFocus && grids.settings.callSetFocus(JSON.parse($(to).data("cell")), grids);
            }
        }, grid.halfOf = function(first, second, full, type, obj) {
            if ("w" == type) if ("undefined" != typeof obj) var ret = this.perOfWidthEls(obj); else {
                var ret = this.perOfWidth(full / 2);
                $(first).css({
                    width: ret,
                    "float": "left"
                }), $(second).css({
                    width: ret,
                    "float": "left"
                });
            } else if ("h" == type) if ("undefined" != typeof obj) var ret = this.perOfHeightEls(obj); else {
                var ret = this.perOfHeight(full / 2);
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
        }, grid.perOfWidthEls = function(grid) {
            var els = grid.$el.find("." + grid.settings.innerGridClass).first().children("." + grid.settings.gridColClass), no = els.length, per = 100 / no;
            return els.css({
                width: per + "%",
                "float": "left"
            }), per;
        }, grid.perOfHeight = function(pixels, elHeight) {
            var per = 100 / ("undefined" != typeof elHeight ? elHeight : this.$el.outerHeight()) * pixels;
            return per + "%";
        }, grid.perOfHeightEls = function(els) {
            var searchEl, no = els.length, per = 100 / no + "%";
            if (1 == this.settings.splitCellInColumn) searchEl = "." + this.settings.useInsideCell; else {
                var andNot = ":not(.", closeNot = ")";
                searchEl = "." + this.settings.gridCellClass + andNot + this.settings.insideCellClass + closeNot;
            }
            return $(els[0]).parent().find(searchEl).css("height", per), per;
        }, grid.equalPers = function(arr, target, vh) {
            for (var i = arr.length, total = 0, min = 0; i--; ) min = 0 == vh ? this.settings.vertMin : this.settings.horizMin, 
            arr[i] < min && (arr[i] = min), total += arr[i];
            for (x = 0; x < arr.length; x++) arr[x] = target / total * arr[x];
            return arr = grid.percentageRounding(arr, target);
        }, grid.percentageRounding = function(arr, target) {
            function errorFactor(oldNum, newNum) {
                return Math.abs(oldNum - newNum) / oldNum;
            }
            for (var change, next, factor1, factor2, i = arr.length, j = 0, total = 0, newVals = [], len = arr.length, marginOfErrors = []; i--; ) total += newVals[i] = Math.round(arr[i]);
            for (change = target > total ? 1 : -1; total !== target; ) {
                for (i = 0; len > i; i++) next = i === len - 1 ? 0 : i + 1, factor2 = errorFactor(arr[next], newVals[next] + change), 
                factor1 = errorFactor(arr[i], newVals[i] + change), factor1 > factor2 && (j = next);
                newVals[j] += change, total += change;
            }
            for (i = 0; len > i; i++) marginOfErrors[i] = newVals[i] && Math.abs(arr[i] - newVals[i]) / arr[i];
            for (i = 0; len > i; i++) for (j = 0; len > j; j++) if (j !== i) {
                var roundUpFactor = errorFactor(arr[i], newVals[i] + 1) + errorFactor(arr[j], newVals[j] - 1), roundDownFactor = errorFactor(arr[i], newVals[i] - 1) + errorFactor(arr[j], newVals[j] + 1), sumMargin = marginOfErrors[i] + marginOfErrors[j];
                sumMargin > roundUpFactor && (newVals[i] = newVals[i] + 1, newVals[j] = newVals[j] - 1, 
                marginOfErrors[i] = newVals[i] && Math.abs(arr[i] - newVals[i]) / arr[i], marginOfErrors[j] = newVals[j] && Math.abs(arr[j] - newVals[j]) / arr[j]), 
                sumMargin > roundDownFactor && (newVals[i] = newVals[i] - 1, newVals[j] = newVals[j] + 1, 
                marginOfErrors[i] = newVals[i] && Math.abs(arr[i] - newVals[i]) / arr[i], marginOfErrors[j] = newVals[j] && Math.abs(arr[j] - newVals[j]) / arr[j]);
            }
            return newVals;
        }, grid.centerInner = function(thiss) {
            var oThis = "undefined" != typeof thiss ? thiss : this;
            setTimeout(function() {
                var realwidth = 0;
                oThis.elInner.children("." + oThis.settings.gridColClass).each(function() {
                    realwidth += $(this).outerWidth(!0);
                }), realwidth < oThis.elInner.width() && oThis.elInner.css("padding-left", (oThis.elInner.width() - realwidth) / 2 + "px");
            });
        }, grid.forcePerWidth = function() {
            var wids = [], oThis = this;
            $.each(this.gridsColumns, function(key, col) {
                wids.push(parseInt(oThis.perOfWidth($(col).outerWidth())));
            });
            var newWids = this.equalPers(wids, 100, 0);
            $.each(this.gridsColumns, function(key, col) {
                $(col).css({
                    width: newWids[key] + "%"
                }), oThis.resizeColumn(key, newWids[key] + "%");
            });
        }, grid.forcePerHeight = function(x) {
            var heights = [], oThis = this, col = this.gridsColumns[x];
            if ("undefined" != typeof col) {
                $.each(oThis.gridsCells[x], function(y, cell) {
                    heights.push(parseInt(oThis.perOfHeight($(cell).outerHeight(), $(col).outerHeight())));
                });
                var newHeights = oThis.equalPers(heights, 100, 1);
                $.each(oThis.gridsCells[x], function(y, cell) {
                    $(cell).css({
                        height: newHeights[y] + "%"
                    }), oThis.resizeCell(x, y, newHeights[y] + "%");
                });
            }
        }, grid.returnContent = function(cell) {
            var content = cell.children();
            if (1 == content.length) {
                if (0 == content.hasClass("horizrail")) var useContent = content.detach();
            } else if (2 == content.length) if (0 == $(content[0]).hasClass("horizrail")) var useContent = $(content[0]).detach(); else var useContent = $(content[1]).detach();
            return useContent;
        }, grid.returnStructure = function() {
            return JSON.stringify(this.gridsStructure);
        }, grid.returnMeta = function() {
            return JSON.stringify(this.metaAt);
        }, grid.returnCells = function() {
            return this.gridsCells;
        }, grid.parent = function() {
            return "" === this.settings.parentGrid ? this : this.settings.parentGrid;
        }, grid.destroy = function(undefined) {
            return "function" == typeof this.settings.callBeforeDestroy && this.settings.callBeforeDestroy(this), 
            this.$el.empty().removeData("grid"), this.$el;
        }, grid.init(el, options);
    };
});