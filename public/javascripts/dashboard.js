(function() {
    "use strict";

    var originalData = loadData();

    renderData(originalData);
    unifyHeightsGlobal();
    initCharts(originalData);

    setDateHeaders();

    $(window).resize(function() {
        unifyHeightsGlobal();

        setTimeout(function() {
            initCharts(originalData);
        }, 300);
    });
}());