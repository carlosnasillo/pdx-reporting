/**
* @author : julienderay
* Created on 22/04/2016
*/

var filters = [];

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

    categories.forEach(function(cat) {
        renderObject(sum, cat);
    });

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

function onFilterUpdate(d) {
    addFilter(d);
    updateData();
    updateFilterButtons();
}

function initPolicyChart(unidentified, neverPrime, prime, subPrime) {
    return c3.generate({
        tooltip: {
            show: false
        },
        bindto: '#policy',
        data: {
            columns: [
                ['Unidentified', unidentified],
                ['Never Prime', neverPrime],
                ['Prime', prime],
                ['Sub Prime', subPrime]
            ],
            type : 'donut',
            onclick: onFilterUpdate,
            colors: {
                'Unidentified': '#f6a821',
                'Never Prime': '#949ba2',
                'Prime': '#c0392b',
                'Sub Prime': '#616779'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function(value, ratio, id) { return id; }
            }
        },
        legend: {
            position: 'bottom'
        }
    });
}

function initOriginatorChart(prosper, lc, fc) {
    return c3.generate({
        tooltip: {
            show: false
        },
        bindto: '#originator',
        data: {
            columns: [
                ['Prosper', prosper],
                ['Lending Club', lc],
                ['Funding Circle', fc]
            ],
            type : 'donut',
            onclick: onFilterUpdate,
            colors: {
                'Prosper': '#f6a821',
                'Lending Club': '#949ba2',
                'Funding Circle': '#616779'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function(value, ratio, id) { return id; }
            }
        },
        legend: {
            position: 'bottom'
        }
    });
}

function initCountryChart(uk, usa) {
    return c3.generate({
        tooltip: {
            show: false
        },
        bindto: '#country',
        data: {
            columns: [
                ['UK', uk],
                ['US', usa]
            ],
            type : 'donut',
            onclick: onFilterUpdate,
            colors: {
                UK: '#f6a821',
                US: '#949ba2'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function(value, ratio, id) { return id; }
            }
        },
        legend: {
            position: 'bottom'
        }
    });
}

function addFilter(d) {
    filters = _.uniq(filters.concat([d.id]));
}

function extractChartData(data) {
    return data.reduce(function (prev, cur) {
        var country = cur.properties.country;
        var originator = cur.properties.originator;
        var policy = cur.properties.policy;
        var quantity = cur.quantity;

        prev[country] = prev[country] + quantity;
        prev[originator] = prev[originator] + quantity;
        prev[policy] = prev[policy] + quantity;

        return prev;
    }, {
        UK: 0,
        US: 0,
        Prosper: 0,
        'Lending Club': 0,
        'Funding Circle': 0,
        Unidentified: 0,
        'Never Prime': 0,
        Prime: 0,
        'Sub Prime': 0
    });
}

var countryChart, originatorChart, policyChart;
function initCharts(data) {
    var chartsData = extractChartData(data);

    countryChart = initCountryChart(chartsData.UK, chartsData.US);
    originatorChart = initOriginatorChart(chartsData.Prosper, chartsData['Lending Club'], chartsData['Funding Circle']);
    policyChart = initPolicyChart(chartsData.Unidentified, chartsData['Never Prime'], chartsData.Prime, chartsData['Sub Prime']);
}

function updateCharts(data) {
    var chartData = extractChartData(data);

    updateCountryChart(chartData.UK, chartData.US);
    updateOriginatorChart(chartData.Prosper, chartData['Lending Club'], chartData['Funding Circle']);
    updatePolicyChart(chartData.Unidentified, chartData['Never Prime'], chartData.Prime, chartData['Sub Prime']);
}

function updateCountryChart(uk, usa) {
    countryChart.load({
        columns: [
            ['UK', uk],
            ['US', usa]
        ]});
}

function updateOriginatorChart(prosper, lc, fc) {
    originatorChart.load({
        columns: [
            ['Prosper', prosper],
            ['Lending Club', lc],
            ['Funding Circle', fc]
        ]});
}

function updatePolicyChart(unidentified, neverPrime, prime, subPrime) {
    policyChart.load({
        columns: [
            ['Unidentified', unidentified],
            ['Never Prime', neverPrime],
            ['Prime', prime],
            ['Sub Prime', subPrime]
        ]});
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