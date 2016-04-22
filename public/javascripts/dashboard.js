(function() {
    "use strict";

    var originalData = loadData();

    initCharts(originalData);
    renderData(originalData);
    
    setDateHeaders();
}());