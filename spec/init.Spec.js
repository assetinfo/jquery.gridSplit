feature("Testing initialisation", function() {
    describe("Initialise a simple grid", function() {
        var a;
        it("appending #grid and running .gridsplit() on it", function() {
            $('body').append('<div class="grid" id="grid" ></div>');
            var a = $('#grid').gridSplit();
            //init is a function if a is a grid.
            var isGrid = (typeof a.init === "function");
            expect(isGrid).toBe(true);
        });
    });
});