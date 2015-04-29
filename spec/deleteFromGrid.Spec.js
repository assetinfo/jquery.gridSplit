feature("Testing delAt | delColumn | delCell",function(){
	describe("Delete from a simple grid", function() {
		window.a = '';
		 
		afterEach(function() {
		    a = $('#grid').gridSplit().destroy();
		});

	    it("del a cell using .delCell, is the length 1", function() {
	    	a = $('#grid').gridSplit().splitAt(0,0);
	    	setTimeout(function(){
	    	    a.delCell(0,0);
		        var lenGrid = JSON.parse(a.returnStructure())[0].length; 
	            expect(lenGrid).toBe(1);
	    	},100);
		});

	    it("del a column using .delColumn, is the length 1", function() {
	    	a = $('#grid').gridSplit().splitAt(0);
	    	setTimeout(function(){
	    	    a.delColumn(0);
		        var lenGrid = JSON.parse(a.returnStructure()).length; 
	            expect(lenGrid).toBe(1);
	    	},100);
		});

	    it("del a cell using .delAt, is the length 1", function() {
	    	a = $('#grid').gridSplit().splitAt(0,0);
	    	setTimeout(function(){
	    	    a.delAt(0,0);
		        var lenGrid = JSON.parse(a.returnStructure())[0].length; 
	            expect(lenGrid).toBe(1);
	    	},100);
		});

	    it("del a column using .delAt, is the length 1", function() {
	    	a = $('#grid').gridSplit().splitAt(0);
	    	setTimeout(function(){
	    	    a.delAt(0);
		        var lenGrid = JSON.parse(a.returnStructure()).length; 
	            expect(lenGrid).toBe(1);
	    	},100);
		});

	});
});
