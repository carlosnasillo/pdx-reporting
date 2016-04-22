(function() {
    "use strict";

    var countryChart = c3.generate({
        bindto: '#country',
        data: {
            columns: [
                ['UK', 30],
                ['USA', 120]
            ],
            type : 'donut',
            onclick: function (d, i) { console.log("onclick", d, i); },
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

    var originatorChart = c3.generate({
        bindto: '#originator',
        data: {
            columns: [
                ['Prosper', 30],
                ['Lending Club', 120],
                ['Funding Circle', 60]
            ],
            type : 'donut',
            onclick: function (d, i) { console.log("onclick", d, i); },
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

    var policyChart = c3.generate({
        bindto: '#policy',
        data: {
            columns: [
                ['Unidentified', 50],
                ['Never Prime', 100],
                ['Prime', 60],
                ['Sub Prime', 10]
            ],
            type : 'donut',
            onclick: function (d, i) { console.log("onclick", d, i); },
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

    renderData(loadData());
    setDateHeaders();
}());