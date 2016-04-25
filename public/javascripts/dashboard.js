(function() {
    "use strict";

    var originalData = loadData();

    initCharts(originalData);
    renderData(originalData);

    setDateHeaders();

    unifyHeights('data-panel-top');
    unifyHeights('data-panel-bottom');

    $( window ).resize(function() {
        unifyHeights('data-panel-top');
        unifyHeights('data-panel-bottom');
    });
}());