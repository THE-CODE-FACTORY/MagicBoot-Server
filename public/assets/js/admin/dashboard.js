app.controller('Dashboard', function ($scope) {

    const chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    const options = {

        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        labels: {
            enabled: false
        },
        animation: {
            duration: 100,
            easing: "linear"
        },


        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [{
                display: true
            }],
        }



    };





    setTimeout(function () {

        console.log("timeout")


        var chart1 = new Chart(document.getElementById('usage-ram').getContext('2d'), {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                datasets: [{
                    //label: "My First dataset",
                    backgroundColor: chartColors.red,
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                }]
            },

            // Configuration options go here
            options: options
        });


        var chart2 = new Chart(document.getElementById('usage-cpu').getContext('2d'), {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                datasets: [{
                    //label: "My First dataset",
                    backgroundColor: chartColors.green,
                    data: [10, 80, 30, 40, 50, 60, 70, 80, 90, 100],
                }]
            },

            // Configuration options go here
            options: options
        });



        var chart3 = new Chart(document.getElementById('usage-net').getContext('2d'), {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                datasets: [{
                    //label: "My First dataset",
                    backgroundColor: chartColors.blue,
                    data: [10, 80, 30, 40, 50, 60, 70, 80, 90, 100],
                }]
            },

            // Configuration options go here
            options: options
        });

        var chart4 = new Chart(document.getElementById('usage-hdd').getContext('2d'), {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                datasets: [{
                    //label: "My First dataset",
                    backgroundColor: chartColors.purple,
                    data: [10, 80, 30, 40, 50, 60, 70, 80, 90, 100],
                }/*, {
                    //label: "My First dataset",
                    backgroundColor: 'rgb(200, 0, 0)',
                    data: [10, 80, 30, 40, 50, 60, 70, 80, 90, 100],
                }*/]
            },

            // Configuration options go here
            options

        });





        setInterval(function () {

            console.log(Date.now())

            chart1.data.datasets.forEach((dataset) => {
                dataset.data.shift();
                dataset.data.push(Math.floor((Math.random() * 100) + 1));
            });

            chart2.data.datasets.forEach((dataset) => {
                dataset.data.shift();
                dataset.data.push(Math.floor((Math.random() * 100) + 1));
            });

            chart3.data.datasets.forEach((dataset) => {
                dataset.data.shift();
                dataset.data.push(Math.floor((Math.random() * 20) + 1));
            });

            chart4.data.datasets.forEach((dataset) => {
                dataset.data.shift();
                dataset.data.push(Math.floor((Math.random() * 100) + 1));
            });

            chart1.update();
            chart2.update();
            chart3.update();
            chart4.update();

        }, 3000);



        // For a pie chart
        var myPieChart = new Chart(document.getElementById('usage-queue').getContext('2d'), {
            type: 'pie',
            data: {

                datasets: [{
                    data: [
                        Math.round(Math.random() * 100),
                        Math.round(Math.random() * 100),
                        Math.round(Math.random() * 100),
                        Math.round(Math.random() * 100),
                        Math.round(Math.random() * 100),
                    ],
                    backgroundColor: [
                        chartColors.red,
                        chartColors.orange,
                        chartColors.yellow,
                        chartColors.green,
                        chartColors.blue,
                    ],
                    label: 'Dataset 1'
                }],
                labels: [
                    'Red',
                    'Orange',
                    'Yellow',
                    'Green',
                    'Blue'
                ]

            },
            options: Object.assign({}, options, {
                scales: {}
            })
        });

    }, 100);

});
