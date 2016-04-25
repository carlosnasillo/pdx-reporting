/**
* @author : julienderay
* Created on 22/04/2016
*/

var filters = [];

var originators = ['Prosper', 'Lending Club', 'Funding Circle'];
var policies = ['Consumer', 'SME', 'Auto', 'Student', 'Property'];
var countries = ['US', 'UK'];

var chartColors = ['#f6a821', '#949ba2', '#c0392b', '#616779', '#f9690e'];

function renderData(objects) {
    var categories = ['portfolioSummary', 'loansCharacteristics', 'loanDelinquency', 'returns'];

    var sum = objects.reduce(function(prev, cur) {
        categories.forEach(function(category) {
            _.keys(cur[category]).forEach(function(k) {
                if (!prev[category]) {
                    prev[category] = {};
                }
                if (prev[category][k]) {
                    prev[category][k] = prev[category][k] + cur[category][k];
                }
                else {
                    prev[category][k] = cur[category][k];
                }
            });
        });


        return prev;
    }, {});

    var objectSize = objects.length;
    average(sum.returns, objectSize);
    average(sum.loansCharacteristics, objectSize);

    categories.forEach(function(cat) {
        renderObject(sum, cat);
    });

    function average(category, listSize) {
        _.keys(category)
            .filter(function(k) {
                return k.indexOf('Value') >= 0;
            })
            .forEach(function(k) {
                category[k] = category[k] / listSize;
            });

        return category;
    }

    function renderObject(o, prop) {
        _.keys(o[prop]).forEach(function (k) {
            var elem = $('#' + prop + '_' + k);

            if (k.indexOf('Delta') > 0) {
                var num = parseFloat(o[prop][k]);
                if (num > 0) {
                    num = d3.format('+,.2f')(num) + ' % <span class="slight"><i class="fa fa-play fa-rotate-270 text-warning"> </i></span>';
                }
                else if (num < 0) {
                    num = d3.format('+,.2f')(num) + ' % <span class="slight"><i class="fa fa-play fa-rotate-90 c-white"> </i></span>';
                }
                
                elem.html(num);
            }
            else {
                elem.html(d3.format(',.0f')(o[prop][k]));
            }
        });
    }
}

function setDateHeaders() {
    var date = new Date();
    var prefix = 'As of ';
    var str =  prefix + date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
    $('.asOfToday').html(str);
}

function updateFilterButtons() {
    $('#filters').children().remove();

    filters.forEach(function(filter) {
        var elem = $('<a href="#" id="' + filter + '" class="btn btn-accent filter-button">' + filter + ' <i class="fa fa-times" aria-hidden="true"></i></a>');
        elem.click(function() {
            var id = $(this).attr('id');
            filters = filters.filter(function(f) { return f !== id; });
            updateData();
            updateFilterButtons();
        });
        $('#filters').append(elem)
    })
}

function onFilterUpdate(id) {
    addFilter(id);
    updateData();
    updateFilterButtons();
}

function initPolicyChart(data) {
    return c3.generate({
        tooltip: {
            show: false
        },
        bindto: '#policy',
        data: {
            columns: _.pairs(data),
            type : 'donut',
            onclick: function(obj) { onFilterUpdate(obj.id); },
            colors: {
                'Consumer': '#f6a821',
                'SME': '#949ba2',
                'Auto': '#c0392b',
                'Student': '#616779',
                'Property': '#f9690e'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function() { return ''; }
            }
        },
        legend: {
            position: 'bottom',
            item: {
                onclick: function(id) { onFilterUpdate(id); }
            }
        }
    });
}

function initOriginatorChart(data) {
    return c3.generate({
        tooltip: {
            show: false
        },
        bindto: '#originator',
        data: {
            columns: _.pairs(data),
            type : 'donut',
            onclick: function(obj) { onFilterUpdate(obj.id); },
            colors: {
                'Prosper': '#f6a821',
                'Lending Club': '#949ba2',
                'Funding Circle': '#616779'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function() { return ''; }
            }
        },
        legend: {
            position: 'bottom',
            item: {
                onclick: function(id) { onFilterUpdate(id); }
            }
        }
    });
}

function initCountryChart(data) {
    return c3.generate({
        tooltip: {
            show: false
        },
        bindto: '#country',
        data: {
            columns: _.pairs(data),
            type : 'donut',
            onclick: function(obj) { onFilterUpdate(obj.id); },
            colors: {
                UK: '#f6a821',
                US: '#949ba2'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function() { return ''; }
            }
        },
        legend: {
            position: 'bottom',
            item: {
                onclick: function(id) { onFilterUpdate(id); }
            }
        }
    });
}

function isLastFilterOfThisCategoy(id) {
    return [originators, countries, policies].some(function (category) {
        if (category.indexOf(id) >= 0) {
            var nbOfNotFilter = category
                .filter(function (k) {
                    return filters.indexOf(k) < 0;
                })
                .length;
            return nbOfNotFilter != category.length;
        }
    });
}

function addFilter(id) {
    if (!isLastFilterOfThisCategoy(id)) {
        filters = _.uniq(filters.concat([id]));
    }
}

function extractChartData(data) {
    return data.reduce(function (prev, cur) {
        var country = cur.properties.country;
        var originator = cur.properties.originator;
        var policy = cur.properties.policy;
        var quantity = cur.quantity;
        var lateLoans = cur.lateLoans;

        prev[country] = prev[country] + quantity;
        prev[originator] = prev[originator] + quantity;
        prev[policy] = prev[policy] + quantity;
        prev.lateLoans = prev.lateLoans.map(function(v, i) { return v + lateLoans[i]});

        return prev;
    }, {
        UK: 0,
        US: 0,
        Prosper: 0,
        'Lending Club': 0,
        'Funding Circle': 0,
        Consumer: 0,
        SME: 0,
        Auto: 0,
        Student: 0,
        Property: 0,
        lateLoans: [0, 0, 0, 0]
    });
}

var countryChart, originatorChart, policyChart;
function initCharts(chartsData) {
    countryChart = initCountryChart(filterChartData(chartsData, countries));
    originatorChart = initOriginatorChart(filterChartData(chartsData, originators));
    policyChart = initPolicyChart(filterChartData(chartsData, policies));

    fillUpChartLegendsInWhite();
}

function filterChartData(data, keysToKeep) {
    var result = {};
    _.keys(data).forEach(function(k) {
        if (keysToKeep.indexOf(k) >= 0) {
            result[k] = data[k];
        }
    });
    return result;
}

function updateCharts(data) {
    var chartData = extractChartData(data);

    updateChart(countryChart, filterChartData(chartData, countries));
    updateChart(originatorChart, filterChartData(chartData, originators));
    updateChart(policyChart, filterChartData(chartData, policies));
    updateStackedHorizontalBarChart(chartData.lateLoans);
}

function updateChart(chart, data) {
    chart.load({
        columns: _.pairs(data)
    });
}

function updateData() {
    var data = loadData();
    var filteredData = filters.reduce(function(prev, cur) {
        return prev.filter(function(elem) {
            return [elem.properties.country, elem.properties.originator, elem.properties.policy].indexOf(cur) >= 0;
        });
    }, data);

    renderData(filteredData);
    updateCharts(filteredData);
}

function unifyHeights(classs) {
    var maxHeight = 0;
    var $data = $('.' + classs);
    $data.css('height', '');
    $data.each(function() {
        var height = $(this).outerHeight();
        if ( height > maxHeight ) {
            maxHeight = height;
        }
    });
    $data.css('height', maxHeight);
    return maxHeight;
}

var margin = 20;
var fillingRatio = 0.65;
function unifyHeightsGlobal() {
    var heightSum = [
        unifyHeights('data-panel-top'),
        unifyHeights('data-panel-bottom')
    ]
        .reduce(function(agg, cur) { return cur + agg + margin; }, -margin);

    $('.dashboard-charts').each(function() {
        $(this).css('height', heightSum);
    });
    var $chart = $('.chart');
    var nbCharts = $chart.size();
    $chart.each(function() {
        $(this).css('height', (heightSum / nbCharts) * fillingRatio);
    });
}

function updateStackedHorizontalBarChart(data) {
    $('#delinquencyBreakdown').children().remove();
    drawStackedHorizontalBarChart(data);
}

function drawStackedHorizontalBarChart(data) {
    data.sort(function(a, b){return a-b;});

    var width = "100%",
        height = 70,
        perc_so_far = 0;


    var total_time = d3.sum(data);
    var chart = d3.select("#delinquencyBreakdown")
        .attr("width", width)
        .attr("height", height);

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g");

    bar.append("rect")
        .attr("width", function(d) { return ((d/total_time)*100) + "%"; } )
        .attr("x", function(d) {
            var prev_perc = perc_so_far;
            var this_perc = 100*(d/total_time);
            perc_so_far = perc_so_far + this_perc;
            return prev_perc + "%";
        })
        .attr("height", height)
        .attr("fill",  function(d, i) { return chartColors[i]; } );

    perc_so_far = 0;
    bar.append("text")
        .attr("x", function(d) {
            var this_perc = 100*(d/total_time);
            var prev_perc_so_far = perc_so_far;
            perc_so_far = this_perc + perc_so_far;
            return prev_perc_so_far + this_perc/2.7 + "%";
        })
        .attr("dy", "50%")
        .text(function(d) { return d; });

    d3.select(window).on('resize', resize);

    function resize () {
        var width = parseInt(d3.select("#chart").style("width"));
    }
}

function fillUpChartLegendsInWhite() {
    $('.c3-legend-item text').each(function() { $(this).attr('fill', 'white'); });
}