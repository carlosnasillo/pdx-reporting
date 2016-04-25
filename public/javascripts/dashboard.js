(function() {
    "use strict";

    var originalData = loadData();

    renderData(originalData);
    unifyHeightsGlobal();

    var chartsData = extractChartData(originalData);
    initCharts(chartsData);
    drawStackedHorizontalBarChart(chartsData.lateLoans);

    setDateHeaders();

    $(window).resize(function() {
        unifyHeightsGlobal();

        setTimeout(function() {
            initCharts(originalData);
        }, 300);
    });
}());