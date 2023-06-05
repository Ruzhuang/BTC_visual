$(document).ready(function() {
    var dataPoints = [];

    var chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Live chart with BTC-USDT"
        },
        data: [{
            type: "line",
            dataPoints: dataPoints
        }]
    });

    function updateData() {
        $.ajax({
            url: "https://api.kraken.com/0/public/OHLC?pair=BTCUSDT&interval=1",
            type: "GET",
            success: function(data) {
                var newData = data.result.BTCUSDT;
                for (var i = 0; i < newData.length; i++) {
                    dataPoints.push({
                        x: new Date(newData[i][0] * 1000),
                        y: [
                            parseFloat(newData[i][1]), // Open
                            parseFloat(newData[i][2]), // High
                            parseFloat(newData[i][3]), // Low
                            parseFloat(newData[i][4]) // Close
                        ]
                    });
                }
                chart.render();
                setTimeout(updateData, 1000);
            },
            error: function(err) {
                console.log(err.statusText);
            }
        });
    }

    updateData();
});