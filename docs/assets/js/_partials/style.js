const chartColors =
{
    red: [255, 94, 77],
    orange: [255, 167, 26],
    yellow: [255, 206, 0],
    green: [106, 237, 199],
    blue: [57, 194, 201],
    magenta: [248, 102, 185],
    violet: [153, 140, 227],
    grey: [201, 203, 207],
};

const extendedChartColors =
[
    '#4c99e5',
    '#ffa71a',
    '#6aedc7',
    '#ff5e4d',
    '#8bea12',
    '#ffe300',
    '#39c2c9',
    '#ff7845',
    '#16e94d',
    '#998ce3',
    '#ff5a99',
    '#ffce00',
    '#19dc80',
    '#10d9be',
    '#b0f20a',
    '#f8f535',
    '#c87adf',
    '#ffbf1a',
    '#f866b9',
    '#dfff4d',
];

function extendedChartColor(i)
{
    return extendedChartColors[i % extendedChartColors.length];
}

const chartColorSequence =
[
    chartColors.blue,
    chartColors.green,
    chartColors.yellow,
    chartColors.orange,
    chartColors.red,
    chartColors.violet,
    chartColors.magenta,
];

function parseColor(colorSpecifier)
{
    switch (colorSpecifier)
    {
        case 'blue':
            return chartColors.blue;
        case 'green':
            return chartColors.green;
        case 'yellow':
            return chartColors.yellow;
        case 'orange':
            return chartColors.orange;
        case 'red':
            return chartColors.red;
        case 'violet':
            return chartColors.violet;
        case 'magenta':
            return chartColors.magenta;
    }

    return chartColors.grey;
}

function formatDate(date)
{
    return moment(date).utc().format('D MMM YYYY');
}

function formatDateRange(dateRange)
{
    const t0 = dateRange[0];
    let t1 = new Date(dateRange[1].valueOf());

    // The date range is of the form [t0, t1), inclusive of t0 but exclusive of t1.
    // Hence, subtract one second from t1 to obtain the previous date in UTC
    t1.setSeconds(t1.getSeconds() - 1);

    return formatDate(t0) + ' to ' + formatDate(t1);
}
