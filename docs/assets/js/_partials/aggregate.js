function sortTimeData(data)
{
    if (!(data instanceof Array))
        throw 'expected data array as input';

    // Turn date strings into proper date objects
    for (let i = 0; i < data.length; i++)
        data[i]['date'] = d3.isoParse(data[i]['date']);

    // Sort the data
    data.sort((row1, row2) => row1['date'] - row2['date']);
}

// Assumes that the data is sorted by date in ascending order
function aggregateTimeData(data, aggregationConfig)
{
    if (!(data instanceof Array))
        throw 'expected data array as input';

    if (data.length < 1)
        return;

    const dateStart = data[0]['date'];
    // Ranges are exclusive, so add one more day to include the last date
    const dateEnd = d3.utcDay.offset(data[data.length - 1]['date'], 1);

    let period;

    switch (aggregationConfig['period'])
    {
        case 'week':
            period = d3.utcMonday;
            break;
        case 'month':
            period = d3.utcMonth;
            break;
        default:
            throw 'unknown aggregation period "' + aggregationConfig['period'] + '"';
    }

    // Don't use incomplete periods at the beginning and the end of the data
    const t0 = period.ceil(dateStart);
    // In d3, ranges include the start value but exclude the end value.
    // We want to include the last period as well, so add one more period
    const t1 = period.offset(period.floor(dateEnd), 1);
    const periods = period.range(t0, t1);

    let aggregatedData = Array();

    for (let i = 0; i < periods.length - 1; i++)
    {
        const t0 = periods[i];
        const t1 = periods[i + 1];

        // Note that this assumes complete data in the period.
        // Should data points be missing, aggregation methods such as the sum will lead to results that can't be
        // compared to periods with complete data.
        // Hence, the maintainers of the data need to ensure that the input is well-formed
        const dates = data.filter(row => row['date'] >= t0 && row['date'] < t1);

        let row = Object();
        row['date'] = t0;
        row['_dateRange'] = [t0, t1];
        row['_infoText'] = aggregationConfig['method'];

        $.each(Object.keys(data[0]),
            function(keyID, key)
            {
                // Exclude the date itself from aggregation
                if (key == 'date')
                    return;

                if (dates.length == 0)
                {
                    row[key] = undefined;
                    return;
                }

                const accessor = (row => row[key]);

                switch (aggregationConfig['method'])
                {
                    case 'sum':
                        row[key] = d3.sum(dates, accessor);
                        break;
                    case 'mean':
                        row[key] = d3.mean(dates, accessor);
                        break;
                    case 'median':
                        row[key] = d3.median(dates, accessor);
                        break;
                    case 'first':
                        row[key] = dates[0][key];
                        // With the first/last aggregation methods, show only the affected date and not a range.
                        // The info text showing the aggregation method can also be omitted, because the date
                        // itself is enough information to understand the scope of the shown value.
                        row['_dateRange'][1] = t0;
                        row['_infoText'] = undefined;
                        break;
                    case 'last':
                        row[key] = dates[dates.length - 1][key];
                        row['_dateRange'][0] = t1;
                        row['_infoText'] = undefined;
                        break;
                    case 'min':
                        row[key] = d3.min(dates, accessor);
                        break;
                    case 'max':
                        row[key] = d3.max(dates, accessor);
                        break;
                    default:
                        throw 'unknown aggregation method "' + aggregationConfig['method'] + '"';
                }
            });

        aggregatedData.push(row);
    }

    return aggregatedData;
}
