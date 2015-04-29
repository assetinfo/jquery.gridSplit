feature("Testing set data and setMeta (setMeta is implied to be working id data is)",function(){
	describe("Initialise a grid with meta and duplicate it", function() {
		var a, b;
	    it("appending #grid and running .gridsplit({data:meta})", function() {
	    	$('body').append('<div class="grid" id="grid" ></div>');
	        a = $('#grid').gridSplit({data:{"0":{"0":{"h":"34%"},"1":{"h":"24%"},"2":{"h":"42%"},"c":{"w":"100%"}}}});
	        var gridLen = JSON.parse(a.returnStructure())[0].length; 
	        expect(gridLen).toBe(3);
	    });
	    it("appending #grid2 and running .gridsplit({data:a.returnMeta()})", function() {
		    $('body').append('<div class="grid" id="grid2" ></div>');
	        b = $('#grid2').gridSplit({data:JSON.parse(a.returnMeta())});
	        //grids match if both return the same meta.
	        var gridsMatch = (a.returnMeta() == b.returnMeta()); 
	        expect(gridsMatch).toBe(true);
	    });
	});
});
