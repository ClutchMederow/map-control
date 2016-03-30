/* global Highcharts */
/* global moment */
/* global document */

// Load the fonts
// Highcharts.createElement('link', {
//    href: '//fonts.googleapis.com/css?family=Unica+One',
//    rel: 'stylesheet',
//    type: 'text/css',
// }, null, document.getElementsByTagName('head')[0]);

const theme = {

   // scroll charts
};

// Apply the theme
// Highcharts.setOptions(Highcharts.theme);

const data = [
    [Number(moment(new Date('2015-10-05')).format('x')), 257.01, 257.01, 250.99, 265.48],
    [Number(moment(new Date('2015-10-12')).format('x')), 260.67, 260.67, 252.35, 269.79],
    [Number(moment(new Date('2015-10-19')).format('x')), 253.11, 253.11, 236.63, 269.98],
    [Number(moment(new Date('2015-11-02')).format('x')), 294, 294, 294, 294],
    [Number(moment(new Date('2015-11-09')).format('x')), 289.13, 289.13, 289.13, 289.13],
    [Number(moment(new Date('2015-11-23')).format('x')), 319.47, 319.47, 313.77, 333.5],
    [Number(moment(new Date('2015-11-30')).format('x')), 339.61, 339.61, 316.71, 375.51],
    [Number(moment(new Date('2015-12-07')).format('x')), 332.63, 332.63, 299, 350],
    [Number(moment(new Date('2015-12-14')).format('x')), 337.57, 337.57, 322.55, 346.01],
    [Number(moment(new Date('2015-12-14')).format('x')), 393.09, 393.09, 386.17, 400],
    [Number(moment(new Date('2015-12-21')).format('x')), 336.62, 336.62, 306.49, 358.16],
    [Number(moment(new Date('2015-12-21')).format('x')), 400, 400, 400, 400],
    [Number(moment(new Date('2015-12-28')).format('x')), 333.48, 333.48, 255.2, 367.35],
    [Number(moment(new Date('2016-01-04')).format('x')), 339.3, 339.3, 261.44, 363.77],
    [Number(moment(new Date('2016-01-11')).format('x')), 340.43, 340.43, 272.68, 391.78],
    [Number(moment(new Date('2016-01-18')).format('x')), 353.13, 353.13, 320.01, 392.19],
    [Number(moment(new Date('2016-01-18')).format('x')), 372.67, 372.67, 367.35, 377.98],
    [Number(moment(new Date('2016-01-25')).format('x')), 358.12, 358.12, 310.01, 400],
];

// Template.chart.helpers({
    // theChart: function() {
const options = {
   colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
    chart: {
        // plotBackgroundColor: '#F6F6F6',
        plotBorderWidth: null,
        plotShadow: false,
        backgroundColor: {
           linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
           stops: [
              [0, '#2a2a2b'],
              [1, '#3e3e40'],
           ],
        },
        style: {
           fontFamily: "'Unica One', sans-serif",
        },
        plotBorderColor: '#606063',
    },
    title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '20px',
      },
    },
    subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
      },
    },
    tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
           color: '#F0F0F0',
        },
    },
    plotOptions: {
        boxplot: {
           fillColor: '#505053',
        },
        candlestick: {
           lineColor: 'white',
        },
        errorbar: {
           color: 'white',
        },
        // pie: {
        //     allowPointSelect: true,
        //     cursor: 'pointer',
        //     dataLabels: {
        //         enabled: true,
        //         format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        //         // style: {
        //         //     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
        //         // },
        //         connectorColor: 'silver',
        //     },
        // },
    },
    series: [{
        dataLabels: {
           color: '#B0B0B3',
        },
        marker: {
           lineColor: '#333',
        },
        type: 'candlestick',
        name: 'price',
        data: data,
        //     ['Adventure', 45.0],
        //     ['Action', 26.8],
        //     ['Ecchi', 12.8],
        //     ['Comedy', 8.5],
        //     ['Yuri', 6.2],
        // ],
        dataGrouping: {
            units: [
                [
                    'day', // unit name
                    [1], // allowed multiples
                ], [
                    'month',
                    [1, 2, 3, 4, 6],
                ],
            ],
        },
    }],
    xAxis: [{
        gridLineColor: '#707073',
        labels: {
           style: {
              color: '#707073',
              format: '{value:%Y-%m-%d}',
           },
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
           style: {
              color: '#A0A0A3',

           },
        },
        type: 'datetime',
    }],
    yAxis: {
       gridLineColor: '#707073',
       labels: {
          style: {
             color: '#E0E0E3',
          },
       },
       lineColor: '#707073',
       minorGridLineColor: '#505053',
       tickColor: '#707073',
       tickWidth: 1,
       title: {
          style: {
             color: '#A0A0A3',
          },
       },
   },
   legend: {
        itemStyle: {
           color: '#E0E0E3',
        },
        itemHoverStyle: {
           color: '#FFF',
        },
        itemHiddenStyle: {
           color: '#606063',
        },
   },
   credits: {
      style: {
         color: '#666',
      },
   },
   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3',
      },
      activeDataLabelStyle: {
         color: '#F0F0F3',
      },
   },
   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053',
         },
      },
   },
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC',
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white',
               },
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white',
               },
            },
         },
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver',
      },
      labelStyle: {
         color: 'silver',
      },
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA',
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED',
      },
      xAxis: {
         gridLineColor: '#505053',
      },
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043',
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: '#505053',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)',
};
    // }
// });

Template.chart.onRendered(function() {
    $('#chart').highcharts('StockChart', options);
});
