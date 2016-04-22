/**
* @author : julienderay
* Created on 22/04/2016
*/

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
            $('#' + prop + '_' + k).html(o[prop][k]);
        });
    }
}