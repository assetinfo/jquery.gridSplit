feature("Testing initialise with meta",function(){
	describe("Initialise a metaGrid with meta and duplicate it", function() {
		var a, b;
	    it("appending #metaGrid and running .gridsplit({data:meta})", function() {
	    	$('body').append('<div id="metaGrid" class="grid"></div>');
	        a = $('#metaGrid').gridSplit({data:{"0":{"0":{"h":"34%"},"1":{"h":"24%"},"2":{"h":"42%"},"c":{"w":"100%"}}}});
	        var gridLen = JSON.parse(a.returnStructure())[0].length; 
	        expect(gridLen).toBe(3);
	    });
	    it("appending #clone and running .gridsplit({data:a.returnMeta()})", function() {
            $('body').append('<div id="clone" class="grid"></div>');
	        b = $('#clone').gridSplit({data:JSON.parse(a.returnMeta())});
	        //grids match if both return the same meta.
	        var gridsMatch = (a.returnMeta() == b.returnMeta()); 
	        expect(gridsMatch).toBe(true);
	    });
	});
});
