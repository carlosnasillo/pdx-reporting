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
            position: 'inset'
        }
    });
}

function initOriginatorChart(prosper, lc, fc) {
    return c3.generate({
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
            position: 'inset'
        }
    });
}

function initCountryChart(uk, usa) {
    return c3.generate({
        bindto: '#country',
        data: {
            columns: [
                ['UK', uk],
                ['USA', usa]
            ],
            type : 'donut',
            onclick: onFilterUpdate,
            colors: {
                UK: '#f6a821',
                USA: '#949ba2'
            }
        },
        donut: {
            width: 30,
            label: {
                format: function(value, ratio, id) { return id; }
            }
        },
        legend: {
            position: 'inset'
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
        USA: 0,
        Prosper: 0,
        LC: 0,
        'Funding Club': 0,
        Unidentified: 0,
        NeverPrime: 0,
        Prime: 0,
        SubPrime: 0
    });
}

var countryChart, originatorChart, policyChart;
function initCharts(data) {
    var chartsData = extractChartData(data);

    countryChart = initCountryChart(chartsData.UK, chartsData.USA);
    originatorChart = initOriginatorChart(chartsData.Prosper, chartsData.LC, chartsData['Funding Club']);
    policyChart = initPolicyChart(chartsData.Unidentified, chartsData.NeverPrime, chartsData.Prime, chartsData.SubPrime);
}

function updateCharts(data) {
    var chartData = extractChartData(data);

    updateCountryChart(chartData.UK, chartData.USA);
    updateOriginatorChart(chartData.Prosper, chartData.LC, chartData['Funding Club']);
    updatePolicyChart(chartData.Unidentified, chartData.NeverPrime, chartData.Prime, chartData.SubPrime);
}

function updateCountryChart(uk, usa) {
    countryChart.load({
        columns: [
            ['UK', uk],
            ['USA', usa]
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