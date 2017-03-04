feature("Testing initialisation", function() {
    describe("Initialise a simple grid", function() {
        var a;
        it("appending #simple and running .gridsplit() on it", function() {
            $('body').append('<div id="simple" class="grid"></div>');
            a = $('#simple').gridSplit();
            //init is a function if a is a grid.
            var isGrid = (typeof a.init === "function");
            expect(isGrid).toBe(true);
        });
    });
    describe("Initialise a static grid", function() {
        var a;
        it("appending #static and running .gridsplit({'useContent': true}) on it", function() {
            $('body').append('<div id="static" class="grid" style="height:100px; width:100px;"><div class="innerGrid" ><div class="gridColumn"><div class="gridCell"><div class="fillCell"><a> Test1 </a></div></div><div class="gridCell"><div class="fillCell"><a> Test2 </a></div></div></div></div></div>');
            // initialise a grid from its content
            a = $('#static').gridSplit({'useContent': true});
            // ensure the grid had its sizes calculated properly
            var lenGrid = JSON.parse(a.returnStructure())[0].length;
            var gsWidth = JSON.parse(a.returnMeta())[0]['c']['w'];
            var gsHeight = JSON.parse(a.returnMeta())[0][0]['h'];
            // expect 2 cells
            expect(lenGrid).toBe(2);
            // expect the width of the column to be 100%
            expect(gsWidth).toBe("100%");
            // expect the height of the cell to be 50%
            expect(gsHeight).toBe("50%");
        });
    });
});
