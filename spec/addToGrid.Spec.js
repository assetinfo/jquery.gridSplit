feature("Testing splitAt | addColumn | addCell", function() {
    describe("Add cells using various methods", function() {
        var a;
        it("appending #grid and running .gridsplit() on it", function() {
            $('body').append('<div class="grid" id="grid" ></div>');
            a = $('#grid').gridSplit();
            //init is a function if a is a grid.
            var isGrid = (typeof a.init === "function");
            expect(isGrid).toBe(true);
        });
        it("add a column using .splitAt, is the length 2", function() {
            a = a.splitAt(0);
            var lenGrid = JSON.parse(a.returnStructure()).length;
            expect(lenGrid).toBe(2);
        });
        it("add a cell to the first column using .splitAt, is the length 2", function() {
            a = a.splitAt(0, 0);
            var lenGrid = JSON.parse(a.returnStructure())[0].length;
            expect(lenGrid).toBe(2);
        });
        it("split the first cell into a grid using .splitAt, is the length 2", function() {
            //a is now the grid instance we just added
            a = a.splitAt(0, 0, true);
            var lenGrid = JSON.parse(a.returnStructure()).length;
            expect(lenGrid).toBe(2);
        });
        it("add another column to new grid using .addColumn, is the length 3", function() {
            a = a.addColumn(0);
            var lenGrid = JSON.parse(a.returnStructure()).length;
            expect(lenGrid).toBe(3);
        });
        it("add a cell to the first column using .addCell, is the length 2", function() {
            a = a.addCell(0, 0);
            var lenGrid = JSON.parse(a.returnStructure())[0].length;
            expect(lenGrid).toBe(2);
        });
    });
});