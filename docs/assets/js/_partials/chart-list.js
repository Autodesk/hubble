const barWidth = 35;

const barChartDefaults =
{
    legend:
    {
        display: true
    },
    maintainAspectRatio: false
};

const stackedBarChartDefaults =
{
    scales:
    {
        xAxes:
        [
            {
                stacked: true
            }
        ],
        yAxes:
        [
            {
                stacked: true
            }
        ]
    },
    legend:
    {
        display: true
    },
    maintainAspectRatio: false
};

function createList(canvas)
{
    const url = $(canvas).data('url');

    let spinner = createSpinner(canvas);

    d3.tsv(url,
        function(row)
        {
            $.each(Object.keys(row).slice(1),
                function(keyID, key)
                {
                    row[key] = +row[key];
                });

            return row;
        },
        function(error, data)
        {
            if (error)
                throw error;

            if (data.length == 0)
                return;

            const context = canvas.getContext('2d');

            if (hasConfig($(canvas), 'slice'))
                data = data.slice(readConfig($(canvas), 'slice')[0], readConfig($(canvas), 'slice')[1]);

            const types = hasConfig($(canvas), 'series')
                ? readConfig($(canvas), 'series')
                : Object.keys(data[0]).slice(1);

            const visibleTypes = hasConfig($(canvas), 'visibleSeries')
                ? readConfig($(canvas), 'visibleSeries')
                : types;

            let chartData = Array();

            let index = 0;

            $.each(types,
                function(typeID, type)
                {
                    const color = chartColorSequence[index % chartColorSequence.length];
                    const colorString = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';

                    let seriesData =
                    {
                        label: type,
                        backgroundColor: colorString,
                        borderColor: colorString,
                        fill: true,
                        hidden: (visibleTypes.indexOf(type) == -1) ? true : false,
                    };

                    seriesData.data = data.map(row => Object.values(row)[1 + typeID]);
                    chartData.push(seriesData);

                    index++;
                });

            const repositories = data.map(row => Object.values(row)[0]);

            $(canvas).attr('height', data.length * barWidth);

            const isStacked = (readConfig($(canvas), 'stacked') == true);
            let options = isStacked ? stackedBarChartDefaults : barChartDefaults;
            options['legend']['display'] = (types.length > 1);

            new Chart(context,
                {
                    type: 'horizontalBar',
                    data:
                    {
                        labels: repositories,
                        datasets: chartData
                    },
                    options: options
                });
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}
