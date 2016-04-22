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
            var elem = $('#' + prop + '_' + k);

            if (k.indexOf('Delta') > 0) {
                var num = parseFloat(o[prop][k]);
                if (num > 0) {
                    num = '<span class="slight"><i class="fa fa-play fa-rotate-270 text-warning"> </i> ' + '+' + num + '</span>';
                }
                else if (num < 0) {
                    num = '<span class="slight"><i class="fa fa-play fa-rotate-90 c-white"> </i> ' + num + '</span>';
                }
                
                elem.html(num);
            }
            else {
                elem.html(o[prop][k]);
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