require(['gridsplit'], function(Gridsplit){
	    // Make a complex grid using the splitting function
	    // window.acGrid = $('#grid').gridsplit()
	    // acGrid.splitAt(0);
	    // // Split the first cell - adding a grid to it.
	    // window.split1 = acGrid.splitAt(0, 0, true);
	    // split1.splitAt(0, 0);
	    // split1.splitAt(0, 0);
	    // split1.splitAt(1, 0);
	    // split1.splitAt(1, 0);
	    // split1.splitAt(1);
	    // split1.splitAt(2, 0);
	    // window.split2 = split1.splitAt(0, 0, true);
	    // split2.splitAt(0, 0);
	    // acGrid.splitAt(0, 0);
	    // acGrid.splitAt(0);
	    // acGrid.addColumn(0);
	    // acGrid.addCell(3, 0);
	    // acGrid.splitAt(3);
	    // acGrid.splitAt(3, 0);
	    // acGrid.splitAt(3, 0);
	    // acGrid.splitAt(4, 0);
	    // acGrid.splitAt(0, 0);
	    // acGrid.splitAt(1);
	    // acGrid.splitAt(1, 0);
	    // window.another = acGrid.splitAt(1, 1, true);
	    // another.splitAt(0, 0)
	    // window.newsplit = acGrid.splitAt(5, 1, true);
	    // newsplit.splitAt(1, 0);
	    // more sucinct version of whats above...
	    // chaining the result of each task (always a gridsplit instance)
	    // using .parent() to move to the grid above
	    // ends with a .parent() so that acGrid is the top grid instance.
	    window.acGrid = $('#grid').gridSplit()
	                    .splitAt(0).splitAt(0, 0, true).splitAt(0, 0).splitAt(0, 0)
	                    .splitAt(1, 0).splitAt(1, 0).splitAt(1).splitAt(2, 0)
	                    .splitAt(0, 0, true).splitAt(0, 0).parent().parent()
	                    .splitAt(0, 0).splitAt(0).addColumn(0).addCell(3, 0)
	                    .splitAt(3).splitAt(3, 0).splitAt(3, 0).splitAt(4, 0)
	                    .splitAt(0, 0).splitAt(1).splitAt(1, 0).splitAt(1, 1, true)
	                    .splitAt(0, 0).parent().splitAt(5, 1, true)
	                    .splitAt(1, 0).parent();
	    // make the same grid using the output from acGrid.returnMeta();
	    // setTimeout to make sure the first grid is fully rendered before copying
	    setTimeout(function(){
	        window.acGrid2 = $('#grid2').gridSplit({
	            data: JSON.parse(acGrid.returnMeta())
	        });
	    });
	    // this is the returned meta that will be used to form the grids above;
	    // (This is a much quicker method as it avoids timeouts)
	    window.acGrid3 = $('#grid3').gridSplit({
	        data: {"0":{"0":{"0":{"0":{"0":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"51%"}},"1":{"0":{},"c":{"w":"49%"}},"h":"33.333333333333336%"},"1":{"h":"33.333333333333336%"},"2":{"h":"33.333333333333336%"},"c":{"w":"51%"}},"1":{"0":{"h":"33.333333333333336%"},"1":{"h":"33.333333333333336%"},"2":{"h":"33.333333333333336%"},"c":{"w":"24%"}},"2":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"25%"}},"h":"33.333333333333336%"},"1":{"h":"33.333333333333336%"},"2":{"h":"33.333333333333336%"},"c":{"w":"11%"}},"1":{"0":{"h":"50%"},"1":{"0":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"49%"}},"1":{"0":{},"c":{"w":"51%"}},"h":"50%"},"c":{"w":"9%"}},"2":{"0":{},"c":{"w":"9%"}},"3":{"0":{},"c":{"w":"24%"}},"4":{"0":{"h":"20%"},"1":{"h":"20%"},"2":{"h":"20%"},"3":{"h":"20%"},"4":{"h":"20%"},"c":{"w":"23%"}},"5":{"0":{"h":"50%"},"1":{"0":{"0":{"h":"100%"},"c":{"w":"50%"}},"1":{"0":{"h":"50%"},"1":{"h":"50%"},"c":{"w":"50%"}},"h":"50%"},"c":{"w":"24%"}}}
	    });
	    /*
	    // Two different 4 cell grids just for reference
	    // HTML.
	    // <div id="grid" class="grid"></div>
	    // <div id="grid2" class="grid"></div>
	    // First example has a horizontal resize bar stretching full width, plus two vertical resize bars
	    window.acGrid = $('#grid').gridSplit();
	    acGrid.splitAt(0, 0);
	    var test = acGrid.splitAt(0, 0, true);
	    var test1 = acGrid.splitAt(0, 1, true);
	    // ----
	    // test
	    // test1
	    //  -- is equivalent to --
	    // acGrid.returnCells()[0][0].data("grid");
	    // acGrid.returnCells()[0][1].data("grid");
	    // ----
	    // Second example has a vertical resize bar stretching full height, plus two horizontal resize bars
	    window.acGrid2 = $('#grid2').gridSplit();
	    acGrid2.splitAt(0);
	    acGrid2.splitAt(0, 0);
	    acGrid2.splitAt(1, 0);
	    */
});