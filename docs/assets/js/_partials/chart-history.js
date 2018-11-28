const timeSeriesChartDefaults =
{
    scales:
    {
        xAxes:
        [
            {
                type: 'time',
                time:
                {
                    parser: 'YYYY-MM-DD',
                    tooltipFormat: 'D MMM YYYY',
                    minUnit: 'day',
                }
            }
        ],
        yAxes:
        [
            {
                ticks:
                {
                    beginAtZero: true
                }
            }
        ]
    },
};

function buildHistoryChartData(view)
{
    if (view.data.length == 0)
        return Array();

    const originalDataSeries = Object.keys(view.data[0]).slice(1);
    const dataSeries = 'series' in view ? view.series : originalDataSeries;
    const visibleDataSeries = 'visibleSeries' in view ? view.visibleSeries : originalDataSeries;

    let chartData = Array();

    let index = 0;

    $.each(dataSeries,
        function(dataSeriesID, dataSeries)
        {
            // Skip auxiliarly columns
            if (dataSeries[0] == '_')
                return;

            const color = chartColorSequence[index % chartColorSequence.length];
            const backgroundColorString = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', 0.25)';
            const borderColorString = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';

            let seriesData =
            {
                label: dataSeries,
                backgroundColor: backgroundColorString,
                borderColor: borderColorString,
                fill: true,
                hidden: (visibleDataSeries.indexOf(dataSeries) == -1) ? true : false,
            };

            seriesData.data = view.data.map(
                row =>
                    ({
                        x: row.date,
                        y: row[dataSeries],
                        dateRange: row._dateRange,
                        infoText: row._infoText
                    }));
            chartData.push(seriesData);

            index++;
        });

    return chartData;
}

function createHistoryChart(canvas, actionBar)
{
    const url = $(canvas).data('url');

    let spinner = createSpinner(canvas);

    d3.tsv(url,
        function(row)
        {
            $.each(Object.keys(row).slice(1),
                function(keyID, key)
                {
                    if (row[key] == '')
                        row[key] = undefined;
                    else
                        row[key] = +row[key];
                });

            return row;
        },
        function(error, data)
        {
            if (error)
                throw error;

            sortTimeData(data);

            const context = canvas.getContext('2d');

            // Collect the data for each view in an array
            let views;

            if (hasConfig($(canvas), 'views'))
            {
                views = readConfig($(canvas), 'views');

                for (let i = 0; i < views.length; i++)
                    views[i].data = data;
            }
            else
            {
                if ($(canvas).data('config') != undefined)
                    views = [$(canvas).data('config')];
                else
                    views = [{}];

                views[0].default = true;
                views[0].data = data;
            }

            // Aggregate data for each view separately
            for (let i = 0; i < views.length; i++)
            {
                if ('aggregate' in views[i] && views[i].aggregate != false)
                    views[i].data = aggregateTimeData(views[i].data, views[i].aggregate);

                if ('slice' in views[i])
                {
                    const sliceIndex0 = Math.max(0, Math.min(views[i].data.length,
                        views[i].data.length - views[i].slice[1]));
                    const sliceIndex1 = Math.max(0, Math.min(views[i].data.length,
                        views[i].data.length - views[i].slice[0]));
                    views[i].data = views[i].data.slice(sliceIndex0, sliceIndex1);
                }

                views[i].chartData = buildHistoryChartData(views[i]);
            }

            let defaultView = views.find(view => (view['default'] == true));

            if (defaultView == undefined)
                defaultView = views[0];

            if (views.length > 1)
            {
                let buttons = `
                    <div class="button-bar view-switch">
                        <div title="Select time range to show"><i class="fas fa-calendar"></i></div>`;

                for (let i = 0; i < views.length; i++)
                    buttons += `
                        <a class="button${views[i] === defaultView ? ' active' : ''}" href="#"
                            title="${views[i].tooltip}" data-view-id="${i}">${views[i].label}</a>`;

                buttons += `
                    </div>`;

                actionBar.prepend(buttons);
            }

            const tooltipTitleCallback =
                function(tooltipItem, data)
                {
                    // In the history chart, tooltips are rendered for individual data points.
                    // Hence, the tooltipItem array contains exactly one element
                    const dataPoint = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index];

                    const date = dataPoint.x;
                    const dateRange = dataPoint.dateRange;

                    const suffix = (dataPoint.infoText === undefined)
                        ? ''
                        : ' (' + dataPoint.infoText + ')';

                    if (dateRange === undefined)
                        return formatDate(date) + suffix;

                    if (dateRange[0] == dateRange[1])
                        return formatDate(dateRange[0]) + suffix;

                    return formatDateRange(dateRange) + suffix;
                };

            let options = jQuery.extend({}, timeSeriesChartDefaults);

            options['tooltips'] =
            {
                callbacks:
                {
                    title: tooltipTitleCallback
                }
            };

            $(canvas).data('chart', new Chart(context,
                {
                    type: 'line',
                    data:
                    {
                        datasets: defaultView['chartData']
                    },
                    options: options
                }));

            $(canvas).data('views', views);

            actionBar.find('.view-switch a').click(
                function()
                {
                    $(this).parent().find('.active').removeClass('active');
                    // Replace the visible data
                    $(canvas).data('chart').data.datasets
                        = $(canvas).data('views')[$(this).data('view-id')].chartData;
                    // Trigger a Chart.js update
                    $(canvas).data('chart').update();
                    $(this).addClass('active');

                    return false;
                });
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}
