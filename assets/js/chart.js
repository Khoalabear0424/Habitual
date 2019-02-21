let myChart = document.getElementById('myChart').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = "Roboto, sans-serif";
Chart.defaults.global.defaultFontSize = 15;
Chart.defaults.global.defaultFontColor = 'rgba(0, 0, 0, 0.87)';

var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

let massPopChart = new Chart(myChart, {
    type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data: {
        labels: [],
        datasets: [{
            label: 'Streak / mo.',
            data: [],
            //backgroundColor:'green',
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 132, 0.6)'
            ],
            borderWidth: 1,
            borderColor: '#777',
            hoverBorderWidth: 3,
            hoverBorderColor: '#000'
        }]
    },
    options: {
        title: {
            display: false,
            text: 'Habit Tracker',
            fontSize: 10
        },
        legend: {
            display: false,
            position: 'right',
            labels: {
                fontColor: '#000'
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
            }
        },
        tooltips: {
            enabled: true
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    stepSize: 1
                }
            }]
        }
    }
});

function addChartData() {
    var monthsNames = [];
    var monthstotalCompleted = []
    if(mm<7){
        for(let i = 0; i<6; i++){
            monthsNames.push(months[i]);
            monthstotalCompleted.push(userDetail.habits[0].totalCompleted[i]);
        }
    } else{
        for(let i = 6; i<12; i++){
            monthsNames.push(months[i]);
            monthstotalCompleted.push(userDetail.habits[0].totalCompleted[i]);
        }
    }
    massPopChart.data.labels = monthsNames
    massPopChart.data.datasets[0].data = monthstotalCompleted;
    massPopChart.update();
}