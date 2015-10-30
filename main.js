require(['gridsplit'], function(Gridsplit){
			    
	    // Make a complex grid using the splitting function
        var grid1 = window.grid1 = $('#grid1').gridSplit()
	    grid1.splitAt(0);
	    var split1 = window.split1 = grid1.splitAt(0, 0, true);
	    split1.splitAt(0, 0);
	    split1.splitAt(0, 0);
	    split1.splitAt(1, 0);
	    split1.splitAt(1, 0);
	    split1.splitAt(1);
	    split1.splitAt(2, 0);
	    var split1 = window.split2 = split1.splitAt(0, 0, true);
	    split2.splitAt(0, 0);
	    grid1.splitAt(0, 0);
	    grid1.splitAt(0);
	    grid1.addColumn(0);
	    grid1.addCell(3, 0);
	    grid1.splitAt(3);
	    grid1.splitAt(3, 0);
	    grid1.splitAt(3, 0);
	    grid1.splitAt(4, 0);
	    grid1.splitAt(0, 0);
	    grid1.splitAt(1);
	    grid1.splitAt(1, 0);
	    var another = window.another = grid1.splitAt(1, 1, true);
	    another.splitAt(0, 0)
	    var newsplit = window.newsplit = grid1.splitAt(5, 1, true);
	    newsplit.splitAt(1, 0);
	    
	    // more sucinct version of whats above...
	    // chaining the result of each task (always a gridsplit instance)
	    // using .parent() to move to the grid above

	    /* 

	    var grid1 = window.grid1 = $('#grid').gridSplit()
            .splitAt(0).splitAt(0, 0, true).splitAt(0, 0).splitAt(0, 0)
            .splitAt(1, 0).splitAt(1, 0).splitAt(1).splitAt(2, 0)
            .splitAt(0, 0, true).splitAt(0, 0).parent().parent()
            .splitAt(0, 0).splitAt(0).addColumn(0).addCell(3, 0)
            .splitAt(3).splitAt(3, 0).splitAt(3, 0).splitAt(4, 0)
            .splitAt(0, 0).splitAt(1).splitAt(1, 0).splitAt(1, 1, true)
            .splitAt(0, 0).parent().splitAt(5, 1, true)
            .splitAt(1, 0).parent();

	    */

	    // make the same grid using the output from grid1.returnMeta()
        var grid2 = window.grid2 = $('#grid2').gridSplit({
            data: JSON.parse(grid1.returnMeta())
        });

	    // this grid is built using the returned meta from above but as static object
	    var grid3 = window.grid13 = $('#grid3').gridSplit({
	        data: {"0":{"0":{"0":{"0":{"0":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"50%"}},"1":{"0":{},"c":{"w":"50%"}},"h":"33.333333333333336%"},"1":{"h":"33.333333333333336%"},"2":{"h":"33.333333333333336%"},"c":{"w":"50%"}},"1":{"0":{"h":"33.333333333333336%"},"1":{"h":"33.333333333333336%"},"2":{"h":"33.333333333333336%"},"c":{"w":"25%"}},"2":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"25%"}},"h":"33.333333333333336%"},"1":{"h":"33.333333333333336%"},"2":{"h":"33.333333333333336%"},"c":{"w":"12.5%"}},"1":{"0":{"h":"50%"},"1":{"0":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"50%"}},"1":{"0":{},"c":{"w":"50%"}},"h":"50%"},"c":{"w":"6.25%"}},"2":{"0":{},"c":{"w":"6.25%"}},"3":{"0":{},"c":{"w":"25%"}},"4":{"0":{"h":"25%"},"1":{"h":"25%"},"2":{"h":"25%"},"3":{"h":"25%"},"c":{"w":"25%"}},"5":{"0":{"h":"50%"},"1":{"0":{"0":{"h":"100%"},"c":{"w":"50%"}},"1":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"50%"}},"h":"50%"},"c":{"w":"25%"}}}
	    });

	    /*

	    // Two different 4 cell grids just for reference
	    // HTML.
	    // <div id="grid" class="grid"></div>
	    // <div id="grid2" class="grid"></div>

	    // First example has a horizontal resize bar stretching full width, plus two vertical resize bars
	    window.grid1 = $('#grid1').gridSplit();
	    grid1.splitAt(0, 0);
	    var test = grid1.splitAt(0, 0, true);
	    var test1 = grid1.splitAt(0, 1, true);

	    // ----
	    // test === grid1.returnCells()[0][0].data("grid");
	    // test1 === grid1.returnCells()[0][1].data("grid");
	    // ----

	    // Second example has a vertical resize bar stretching full height, plus two horizontal resize bars
	    window.grid2 = $('#grid2').gridSplit();
	    grid2.splitAt(0);
	    grid2.splitAt(0, 0);
	    grid2.splitAt(1, 0);

	    */
});