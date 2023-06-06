document.addEventListener('DOMContentLoaded', function() {
    var dataPoints = [];
    var volumes = [];

    var chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Live chart with BTC-USDT"
        },
        data: [{
            type: "line",
            xValueType: "dateTime",
            dataPoints: dataPoints
        }]
    });

    async function updateData(startTime) {
        let initialFetchDone = false;

        while (true) {
            var url = `https://api.binance.us/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${startTime}`;
            let response = await fetch(url);
            let data = await response.json();
            var newData = data;
            if (newData.length < 1) {
                await new Promise(resolve => setTimeout(resolve, 800));
                continue;
            }

            for (var i = 0; i < newData.length; i++) {
                dataPoints.push({
                    x: new Date(newData[i][0]),
                    y: parseFloat(newData[i][4])
                });
                if (dataPoints.length > 86400) { // maintain only 24 hours of data
                    dataPoints.shift();
                }
            }
            chart.options.data[0].dataPoints = dataPoints;
            chart.render();

            if (initialFetchDone) {
                // Calculate and update the metrics
                var url2 = "https://api.binance.us/api/v3/ticker/24hr?symbol=BTCUSDT"
                let response2 = await fetch(url2);
                let data2 = await response2.json();
                var newData2 = data2;

                const volume = parseFloat(newData2.volume);
                const priceChange = parseFloat(newData2.priceChangePercent);

                // Calculate logarithmic returns
                var logReturns = [];
                for (var i = 1; i < dataPoints.length; i++) {
                    var currentPrice = dataPoints[i].y;
                    var previousPrice = dataPoints[i - 1].y;
                    var returnPercentage = (math.log(currentPrice / previousPrice)) * 100;
                    logReturns.push(returnPercentage);
                }

                // Calculate volatility
                var volatility = math.std(logReturns) * math.sqrt(86400);
                fetch('https://api.coingecko.com/api/v3/coins/bitcoin')
                    .then(response => response.json())
                    .then(data => {
                        var supply = data.market_data.circulating_supply;
                    })
                    .catch(error => console.error('Error:', error));
                const marketCap = parseFloat(newData2.lastPrice) * supply;


                // Update metric values in the table
                document.getElementById("volumeValue").textContent = volume.toFixed(2);
                document.getElementById("priceChangeValue").textContent = priceChange.toFixed(2);
                document.getElementById("volatilityValue").textContent = volatility.toFixed(2);
                document.getElementById("marketCapValue").textContent = marketCap.toFixed(2);

            }

            startTime = newData[newData.length - 1][0] + 1; // update start time to last data point + 1

            let delay = initialFetchDone ? 1000 : 300; // after initial fetch, delay updates to 1 second
            if (!initialFetchDone && dataPoints.length >= 86400) initialFetchDone = true;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Specify the initial start and end times
    var startTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    updateData(startTime);
});

// document.addEventListener('DOMContentLoaded', function() {
//     var dataPoints = [];

//     var chart = new CanvasJS.Chart("chartContainer", {
//         title: {
//             text: "Live chart with BTC-USDT"
//         },
//         data: [{
//             type: "line",
//             dataPoints: dataPoints
//         }]
//     });

//     function updateData(startTime, endTime) {
//         var url = `https://api.binance.us/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${startTime}&endTime=${endTime}`;
//         console.log(url)
//         fetch(url)
//             .then(response => response.json())
//             .then(data => {
//                 var newData = data;
//                 console.log(newData)
//                 var dataPoints = [];

//                 for (var i = 0; i < newData.length; i++) {
//                     dataPoints.push({
//                         x: new Date(newData[i][0]),
//                         y: parseFloat(newData[i][4])
//                     });

//                     if (dataPoints.length > newData.length) {
//                         dataPoints.shift();
//                     }
//                 }

//                 chart.options.data[0].dataPoints = dataPoints;
//                 chart.render();
//                 setTimeout(() => {
//                     // Update the start and end times for the next fetch
//                     var newStartTime = newData[newData.length - 1][0] + 1;
//                     var newEndTime = endTime + (newData.length * 1000);

//                     // updateData(newStartTime, newEndTime);
//                 }, 1000);
//             })
//             .catch(error => console.error('Error:', error));
//     }

//     // Specify the initial start and end times
//     var startTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
//     console.log("start", startTime)
//     var endTime = Date.now(); // Current time
//     console.log("end", endTime)

//     updateData(startTime, endTime);


// });