/*! 
* Author: Graham Dixon 
* Contact: gdixon@assetinfo.co.uk 
* Copyright: (c) 2015 Graham Dixon (assetinfo(MML))
* Script: jquery.gridsplit.min.js - v.0.0.1 
* Licensed: MIT 
* Depends on: jQuery && jQuery-ui, underscore, bootstrap 3.*
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery", "jqueryui", "underscore" ], factory) : factory(jQuery, jQuery, _);
}(function($, jui, _) {
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
            resizableClass: "isResizable",
            draggingClass: "dragging",
            data: "",
            parentGrid: "",
            nestedIn: "",
            resizable: !0,
            splitMethodH: "",
            splitMethodV: "half",
            horizMin: 5,
            vertMin: 2,
            hideBorder: {
                border: "0px solid #000"
            }
        };
        grid.init = function(el, options) {
            var oThis = this;
            return this.settings = {}, this.settings = $.extend({}, defaults, options), this.id = el.attr("id"), 
            this.$el = $("#" + this.id), this.el = this.$el[0], this.focusGrid = this.id, this.gridsColumns = [], 
            this.gridsCells = [], this.gridsStructure = [], this.timeoutFPH = [], this.metaAt = {}, 
            $("#" + this.id + " ." + this.settings.innerGridClass).remove(), this.elInner = $("<div />").addClass(this.settings.innerGridClass).appendTo(this.$el), 
            1 == this.settings.splitCellInColumn && (this.settings.useInsideCell = this.settings.insideCellClass + "" + this.settings.nestedIn), 
            "" == this.settings.data ? (this.gridsStructure[0] = "need to set", this.addColumn(0), 
            this.gridsStructure[0][0] = "need to set", this.addCell(0, 0), 1 == this.settings.splitCellInColumn && this.addColumn(0)) : this.buildGrid(this.settings.data), 
            $(window).on("resize", function() {
                oThis.centerInner(oThis);
            }), this;
        }, grid.buildGrid = function(data, undefined) {
            var oThis = this;
            return oThis.buildingGrid = !0, _.each(data, function(column, x) {
                isNaN(x) || (oThis.gridsStructure[x] = "need to set", oThis.addColumn(x, undefined, !0), 
                oThis.gridsColumns[x].css("float", "left"), oThis.countCells(column) > 0 ? _.each(column, function(cell, y) {
                    if (!isNaN(y) && (oThis.addCell(x, y), "object" == typeof cell[0])) {
                        oThis.gridsCells[x][y].addClass(oThis.settings.hasChildrenClass);
                        {
                            oThis.splitCellInColumn(oThis.gridsCells[x][y], x, y, cell);
                        }
                    }
                }) : oThis.addCell(x, 0));
            }), oThis.setMeta(data);
        }, grid.setMeta = function(data) {
            var oThis = this;
            return _.each(data, function(column, x) {
                if (!isNaN(x)) {
                    if ("undefined" != typeof column.c) {
                        var wid = column.c.w;
                        oThis.gridsColumns[x].css("width", wid), oThis.resizeColumn(x, wid);
                    }
                    oThis.countCells(column) > 0 && _.each(column, function(cell, y) {
                        isNaN(y) || "undefined" != typeof oThis.gridsCells[x][y] && (oThis.gridsCells[x][y].css("height", cell.h), 
                        oThis.resizeCell(x, y, cell.h)), "object" == typeof cell[0] && "undefined" != typeof oThis.gridsCells[x][y] && oThis.gridsCells[x][y].data("grid").setMeta(cell);
                    });
                }
            }), oThis.buildingGrid = !1, this;
        }, grid.countCells = function(arr) {
            var t = 0;
            return _.each(arr, function(arrr, k) {
                isNaN(k) || t++;
            }), t;
        }, grid.addCell = function(x, y, after) {
            return "undefined" == typeof x || "undefined" == typeof y ? this : (this.gridsStructure.length - 1 < x && (x = this.gridsStructure.length - 1), 
            "need to set" == this.gridsStructure[x][y] ? (el = $('<div class="' + this.settings.gridCellClass + " " + (1 == this.settings.splitCellInColumn ? this.settings.insideCellClass + " " + this.settings.useInsideCell : "") + '" ></div>'), 
            "undefined" != typeof after ? el.insertAfter(after) : el.appendTo(this.gridsColumns[x]), 
            this.gridsStructure[x][y] = !0, this.gridsCells[x][y] = el, this.addControls(this.gridsCells[x][y], x, y)) : this.gridsStructure[x].length > y ? this.splitAt(x, y) : (x < this.gridsStructure.length - 1 ? this.splitAt(this.gridsStructure.length, y) : this.splitAt(x, this.gridsStructure[x].length - 1), 
            delete this.gridsStructure[x][y]), this);
        }, grid.addColumn = function(x, after, skip) {
            var oThis = this;
            if ("undefined" != typeof x) {
                if ("need to set" == this.gridsStructure[x]) {
                    var el = $('<div class="' + this.settings.gridColClass + '" ></div>');
                    "undefined" != typeof after ? el.insertAfter(after) : el.appendTo(this.elInner), 
                    this.gridsStructure[x] = [], this.gridsCells[x] = [], this.gridsColumns[x] = el.data("tpe", "c"), 
                    this.addControls(this.gridsColumns[x], x);
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
                if (y + 1 == oThis.gridsStructure[x].length) oThis.gridsStructure[x][y + 1] = "need to set", 
                oThis.addCell(x, y + 1); else {
                    var reEx = [], reExm = {}, reExs = [];
                    reExm.c = oThis.metaAt[x].c, _.each(oThis.gridsCells[x], function(acY, ly) {
                        ly >= y + 1 ? (reEx[ly + 1] = oThis.gridsCells[x][ly], reExm[ly + 1] = oThis.metaAt[x][ly], 
                        reExs[ly + 1] = oThis.gridsStructure[x][ly]) : (reEx[ly] = oThis.gridsCells[x][ly], 
                        reExm[ly] = oThis.metaAt[x][ly], reExs[ly] = oThis.gridsStructure[x][ly]);
                    }), oThis.gridsCells[x] = reEx, oThis.metaAt[x] = reExm, oThis.gridsStructure[x] = reExs, 
                    oThis.gridsStructure[x][y + 1] = "need to set", oThis.addCell(x, y + 1, oThis.gridsCells[x][y]);
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
                    _.each(this.gridsCells[x], function(acY, ly) {
                        oThis.resizeCell(x, ly, setHeight);
                    });
                }
            } else {
                if (x + 1 == oThis.gridsStructure.length) oThis.gridsStructure[x + 1] = "need to set", 
                oThis.addColumn(x + 1); else {
                    var reEx = [], reExm = {}, reExc = [], reExs = [];
                    _.each(oThis.gridsColumns, function(acX, lx) {
                        lx >= x + 1 ? (reEx[lx + 1] = oThis.gridsColumns[lx], reExm[lx + 1] = oThis.metaAt[lx], 
                        reExc[lx + 1] = oThis.gridsCells[lx], reExs[lx + 1] = oThis.gridsStructure[lx]) : (reEx[lx] = oThis.gridsColumns[lx], 
                        reExm[lx] = oThis.metaAt[lx], reExc[lx] = oThis.gridsCells[lx], reExs[lx] = oThis.gridsStructure[lx]);
                    }), oThis.gridsColumns = reEx, oThis.metaAt = reExm, oThis.gridsCells = reExc, oThis.gridsStructure = reExs, 
                    oThis.gridsStructure[x + 1] = "need to set", oThis.addColumn(x + 1, oThis.gridsColumns[x]);
                }
                var first = oThis.gridsColumns[x], second = oThis.gridsColumns[x + 1], width = oThis.gridsColumns[x].width();
                if ("half" == oThis.settings.splitMethodV) var setWid = oThis.halfOf(first, second, width, "w"); else var setWid = oThis.halfOf(first, second, width, "w", oThis);
                oThis.resizeColumn(x, setWid), oThis.resizeColumn(x + 1, setWid), oThis.gridsStructure[x + 1][0] = "need to set", 
                oThis.addCell(x + 1, 0);
            }
            return oThis;
        }, grid.splitCellInColumn = function(el, x, y, data) {
            if (this.splitCellInColumn !== !0) if (el.attr("id", ("" !== this.settings.nestedIn ? this.settings.nestedIn + "-" + this.id : this.id) + "-" + x + y).css(this.settings.hideBorder).off("click").gridSplit({
                parentGrid: this,
                parentsX: x,
                parentsY: y,
                splitCellInColumn: !0,
                nestedIn: "" !== this.settings.nestedIn ? this.settings.nestedIn + "-" + this.id : this.id,
                data: "undefined" != typeof data ? data : "",
                resizable: this.settings.resizable
            }), this.gridsStructure[x][y] = {}, this.gridsStructure[x][y] = el.data("grid").gridsStructure, 
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            "undefined" != typeof this.metaAt[x][y]) {
                var h = this.metaAt[x][y].h;
                this.metaAt[x][y] = el.data("grid").metaAt, this.metaAt[x][y].h = h;
            } else this.metaAt[x][y] = el.data("grid").metaAt;
            return el.data("grid");
        }, grid.delCell = function(x, y) {
            var oThis = this, reEx = [], reExm = {}, reExs = [];
            if ("undefined" != typeof this.gridsColumns[x] && "undefined" != typeof this.gridsCells[x][y] && this.gridsColumns.length > 0) if (this.gridsCells[x].length > 1) {
                var el = this.gridsCells[x][y];
                reExm.c = oThis.metaAt[x].c, _.each(this.gridsCells[x], function(acY, ly) {
                    ly > y ? (reEx[ly - 1] = oThis.gridsCells[x][ly], reExm[ly - 1] = oThis.metaAt[x][ly], 
                    reExs[ly - 1] = oThis.gridsStructure[x][ly]) : ly !== y && (reEx[ly] = oThis.gridsCells[x][ly], 
                    reExm[ly] = oThis.metaAt[x][ly], reExs[ly] = oThis.gridsStructure[x][ly]);
                }), $(el).remove(), this.gridsCells[x] = reEx, this.metaAt[x] = reExm, this.gridsStructure[x] = reExs, 
                this.forcePerHeight(x);
            } else this.delColumn(x);
            return this;
        }, grid.delColumn = function(x) {
            var oThis = this, reEx = [], reExm = {}, reExs = [], reExc = [], el = this.gridsColumns[x];
            return "undefined" != typeof this.gridsColumns[x] && (_.each(this.gridsColumns, function(acX, lx) {
                lx > x ? (reEx[lx - 1] = oThis.gridsCells[lx], reExm[lx - 1] = oThis.metaAt[lx], 
                reExs[lx - 1] = oThis.gridsStructure[lx], reExc[lx - 1] = oThis.gridsColumns[lx]) : lx !== x && (reEx[lx] = oThis.gridsCells[lx], 
                reExm[lx] = oThis.metaAt[lx], reExs[lx] = oThis.gridsStructure[lx], reExc[lx] = oThis.gridsColumns[lx]);
            }), reExc.length >= 1 ? ($(el).remove(), this.gridsCells = reEx, this.metaAt = reExm, 
            this.gridsStructure = reExs, this.gridsColumns = reExc, this.forcePerWidth()) : this.$el.find(".vertRail").remove()), 
            this;
        }, grid.delAt = function(x, y) {
            return "undefined" == typeof y ? this.delColumn(x) : this.delCell(x, y);
        }, grid.addRail = function(to, x, y) {
            var oThis = this;
            if (1 == this.settings.resizable && to.addClass(this.settings.resizableClass), "c" == $(to).data("tpe")) {
                if (0 !== x) {
                    var rail = (this.settings.gridColClass, this.settings.vertRail), rRail = rail.clone();
                    rRail.appendTo(to), rRail.draggable({
                        axis: "x",
                        containment: to.parent(),
                        start: function(event, ui) {
                            var x = $(this).closest("." + oThis.settings.gridColClass).prevAll("." + oThis.settings.gridColClass).length;
                            if ("undefined" != typeof oThis.gridsColumns[x] && 0 !== x) {
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
                            $(this).css("left", "auto");
                        }
                    });
                }
            } else if (0 !== y) {
                var rail = (this.settings.gridCellClass, this.settings.horizRail), rRail = rail.clone();
                rRail.appendTo(to);
                var oThis = this;
                rRail.draggable({
                    containment: to.parent(),
                    axis: "y",
                    start: function(event, ui) {
                        var y = $(this).closest("." + oThis.settings.gridCellClass).prevAll("." + oThis.settings.gridCellClass).length, x = $(this).closest("." + oThis.settings.gridColClass).prevAll("." + oThis.settings.gridColClass).length;
                        "undefined" != typeof oThis.gridsCells[x][y] && 0 !== y ? (rRail.data("x", x), rRail.data("y", y), 
                        $(this).addClass(oThis.settings.draggingClass)) : rRail.remove();
                    },
                    stop: function(e, ui) {
                        var moved = ui.position.top - ui.originalPosition.top, y = $(this).data("y"), x = $(this).data("x"), newHeight = ($(this).offset().top, 
                        oThis.gridsCells[x][y - 1].outerHeight() + moved), gridHeight = oThis.gridsColumns[x].outerHeight(), rHeight = oThis.perOfHeight(newHeight, gridHeight);
                        oThis.gridsCells[x][y - 1].css("height", rHeight), newHeight = oThis.gridsCells[x][y].outerHeight() - moved, 
                        rHeight = oThis.perOfHeight(newHeight, gridHeight), oThis.gridsCells[x][y].css("height", rHeight), 
                        $(this).css("top", "auto"), oThis.forcePerHeight(x);
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
        }, grid.resizeCell = function(x, y, to) {
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            "undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {});
            var obj = {
                h: to
            };
            this.setMetaAt(x, y, obj);
        }, grid.setMetaAt = function(x, y, obj) {
            "undefined" == typeof this.metaAt[x] && (this.metaAt[x] = {}, this.metaAt[x].c = {}), 
            null === y ? this.metaAt[x].c = $.extend({}, this.metaAt[x].c, obj) : ("undefined" == typeof this.metaAt[x][y] && (this.metaAt[x][y] = {}), 
            this.metaAt[x][y] = $.extend({}, this.metaAt[x][y], obj));
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
                oThis.clickThis(this, tpe);
            });
        }, grid.clickThis = function(to, type) {
            if ("c" == type) {
                this.gridCol;
            } else {
                this.gridCell, $(to).toggleClass("black");
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
            var per = 100 / this.$el.outerWidth() * pixels;
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
            _.each(this.gridsColumns, function(col, key) {
                wids.push(parseInt(oThis.perOfWidth($(col).width())));
            });
            var newWids = this.equalPers(wids, 100, 0);
            _.each(this.gridsColumns, function(col, key) {
                $(col).css({
                    width: newWids[key] + "%"
                }), oThis.resizeColumn(key, newWids[key] + "%");
            });
        }, grid.forcePerHeight = function(x) {
            var heights = [], oThis = this, col = this.gridsColumns[x];
            if ("undefined" != typeof col) {
                _.each(oThis.gridsCells[x], function(cell, y) {
                    heights.push(parseInt(oThis.perOfHeight($(cell).height(), $(col).height())));
                });
                var newHeights = oThis.equalPers(heights, 100, 1);
                _.each(oThis.gridsCells[x], function(cell, y) {
                    $(cell).css({
                        height: newHeights[y] + "%"
                    }), oThis.resizeCell(x, y, newHeights[y] + "%");
                });
            }
        }, grid.returnStructure = function() {
            return JSON.stringify(this.gridsStructure);
        }, grid.returnMeta = function() {
            return JSON.stringify(this.metaAt);
        }, grid.returnCells = function() {
            return this.gridsCells;
        }, grid.parent = function() {
            return "" === this.settings.parentGrid ? this : this.settings.parentGrid;
        }, grid.destroy = function(undefined) {
            return this.$el.empty().removeData("grid"), undefined;
        }, grid.init(el, options);
    };
});