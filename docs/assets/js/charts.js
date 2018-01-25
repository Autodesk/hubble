const chartColors =
{
    red: [255, 94, 77],
    orange: [255, 167, 26],
    yellow: [255, 206, 0],
    green: [106, 237, 199],
    blue: [57, 194, 201],
    purple: [248, 102, 185],
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
    chartColors.purple,
];

const barWidth = 35;

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
                    format: 'YYYY-MM-DD',
                    tooltipFormat: 'D MMMM YYYY',
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

function hasConfig(element, key)
{
    return element.data('config') && (key in element.data('config'));
}

function readConfig(element, key)
{
    if (!hasConfig(element, key))
        return undefined;

    return element.data('config')[key];
}

function createSpinner(canvas)
{
    let parent = $('<div style="position:absolute;height:100%;width:100%;" class="spinner-container"></div>');
    parent.insertBefore($(canvas));

    let spinner = new Spinner().spin(parent[0]);

    return {
        stop: function()
        {
            spinner.stop();
            parent.remove();
        }
    };
}

function aggregateTimeData(data, aggregationConfig)
{
    if (!(data instanceof Array))
        throw 'expected data array as input';

    if (data.length < 1)
        return;

    // Turn date strings into proper date objects
    for (let i = 0; i < data.length; i++)
        data[i]['date'] = d3.isoParse(data[i]['date']);

    // Sort data, just in case it isn’t already
    data.sort((row1, row2) => row1['date'] - row2['date']);

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
                        break;
                    case 'last':
                        row[key] = dates[dates.length - 1][key];
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

function createHistoryChart(canvas)
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

            const context = canvas.getContext('2d');

            if (hasConfig($(canvas), 'sliceData'))
                data = data.slice(readConfig($(canvas), 'sliceData')[0], readConfig($(canvas), 'sliceData')[1]);

            if (hasConfig($(canvas), 'aggregate'))
                data = aggregateTimeData(data, $(canvas).data('config').aggregate);

            const originalDataSeries = Object.keys(data[0]).slice(1);

            const dataSeries = hasConfig($(canvas), 'series')
                ? readConfig($(canvas), 'series')
                : originalDataSeries;

            const visibleDataSeries = hasConfig($(canvas), 'visibleSeries')
                ? readConfig($(canvas), 'visibleSeries')
                : originalDataSeries;

            let chartData = Array();

            let index = 0;

            $.each(dataSeries,
                function(dataSeriesID, dataSeries)
                {
                    const color = chartColorSequence[index % chartColorSequence.length];
                    const backgroundColorString = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] +
                        ', 0.25)';
                    const borderColorString = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';

                    let seriesData =
                    {
                        label: dataSeries,
                        backgroundColor: backgroundColorString,
                        borderColor: borderColorString,
                        fill: true,
                        hidden: (visibleDataSeries.indexOf(dataSeries) == -1) ? true : false,
                    };

                    seriesData.data = data.map(function(row)
                    {
                        return {x: row.date, y: row[dataSeries]};
                    });
                    chartData.push(seriesData);

                    index++;
                });

            new Chart(context,
                {
                    type: 'line',
                    data:
                    {
                        datasets: chartData
                    },
                    options: timeSeriesChartDefaults
                });
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}

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

            if (hasConfig($(canvas), 'sliceData'))
                data = data.slice(readConfig($(canvas), 'sliceData')[0], readConfig($(canvas), 'sliceData')[1]);

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

                    seriesData.data = data.map(function(row)
                    {
                        return Object.values(row)[1 + typeID];
                    });
                    chartData.push(seriesData);

                    index++;
                });

            const repositories = data.map(function(row)
            {
                return Object.values(row)[0];
            });

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

function gheHostname()
{
    return $(location).prop('hostname').replace(/^(pages\.)/, '');
}

function gheUrl()
{
    return $(location).prop('protocol') + '//' + gheHostname();
}

function createTable(table)
{
    const url = $(table).data('url');

    let spinner = createSpinner(table);

    d3.tsv(url,
        function(error, data)
        {
            if (error)
                throw error;

            if (data.length == 0)
                return;

            d3.select(table)
                .append('thead')
                .append('tr')
                .selectAll('th')
                .data(data.columns)
                .enter()
                .append('th')
                .text(function(d)
                {
                    return d;
                });

            let rows = d3.select(table)
                .append('tbody')
                .selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

            rows.selectAll('td')
                .data(function(row)
                {
                    return d3.range(Object.keys(row).length).map(
                        function(column, i)
                        {
                            return row[Object.keys(row)[i]];
                        });
                })
                .enter()
                .append('td')
                .each(function(d, i)
                {
                    const cell = d3.select(this);
                    const entries = d.split(/[\s,]+/);
                    const column = data.columns[i].toLowerCase();

                    for (let j = 0; j < entries.length; j++)
                    {
                        if (j > 0)
                            cell.append().text(', ');
                        const entry = entries[j];
                        switch (column)
                        {
                            case 'fork':
                            case 'organization':
                            case 'owner(s)':
                            case 'repository':
                            case 'resource':
                            case 'user':
                                let a = cell.append('a').text(entry)
                                    .attr('target', '_blank')
                                    .attr('href', gheUrl() + '/' + entry)
                                    .text(entry);

                                const tableID = d3.select(table).attr('id');
                                const prefix = (tableID ? (tableID + '-') : '');


                                // Add anchors, but only for the first column,
                                // which is usually unique
                                if (i == 0)
                                    a.attr('id', prefix + entry);

                                break;
                            default:
                                cell.text(entry);
                        }
                    }
                });
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}

function drawChord(orgs, matrix)
{
    function fadeRibbon(opacity)
    {
        return function(activeRibbon)
        {
            ribbons.filter(function(d)
            {
                return d != activeRibbon;
            })
                .transition()
                .style('opacity', opacity);
        };
    }

    function fadeRibbonsWithSameSource(opacity)
    {
        return function(d, i)
        {
            ribbons.filter(function(d)
            {
                return d.source.index != i && d.target.index != i;
            })
                .transition()
                .style('opacity', opacity);
        };
    }

    function ribbonTip(d)
    {
        let tip = d.source.value + ' ' + orgs[d.source.index] + ' member' +
            (d.source.value > 1 ? 's' : '') + ' contributed to ' + orgs[d.target.index] + '.';
        if (d.target.value > 0)
        {
            tip = tip + '\n' + d.target.value + ' ' + orgs[d.target.index] + ' member' +
                (d.target.value > 1 ? 's' : '') + ' contributed to ' + orgs[d.source.index] + '.';
        }
        return tip;
    }

    function chordTip(d)
    {
        return orgs[d.index];
    }

    // Remove all organizations that have no connections
    let i = orgs.length - 1, count;
    while (i >= 0)
    {
        count = matrix.reduce(function(a, b)
        {
            return a + b[i];
        }, 0)
            + matrix[i].reduce(function(a, b)
            {
                return a + b;
            }, 0);
        if (count == 0)
        {
            matrix.splice(i, 1);
            matrix.map(function(x)
            {
                return x.splice(i, 1);
            });
            orgs.splice(i, 1);
        }
        i--;
    }

    // Remove all existing elements below the SVG element
    d3.select('svg').selectAll('*').remove();

    const pad = 0;
    const svg = d3.select('svg'),
        width = +svg.attr('width')-2*pad,
        height = +svg.attr('height')-2*pad,
        outerRadius = Math.min(width, height) * 0.5 - 200,
        innerRadius = outerRadius - 50;

    //Initialize chord diagram
    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    const g = svg.append('g')
        .attr('transform', 'translate(' + (width / 2 + pad) + ',' + (height / 2 + pad) + ')')
        .datum(chord(matrix));

    // Draw the ribbons that go from group to group
    const ribbon = d3.ribbon()
        .radius(innerRadius);

    const ribbons = g.append('g')
        .attr('class', 'ribbons')
        .selectAll('path')
        .data(function(chords)
        {
            return chords;
        })
        .enter().append('g')
        .on('mouseover', fadeRibbon(.1))
        .on('mouseout', fadeRibbon(1));

    ribbons
        .append('path')
        .attr('d', ribbon)
        .style('stroke-width', 5.0)
        .style('stroke', function()
        {
            return '#ffffff';
        });

    ribbons
        .append('path')
        .attr('d', ribbon)
        .style('fill', function(d)
        {
            return extendedChartColor(d.source.index);
        })
        .style('stroke-width', 2.0)
        .style('stroke', function(d)
        {
            return extendedChartColor(d.source.index);
        });

    ribbons.append('title')
        .text(function(d)
        {
            return ribbonTip(d);
        });

    // Defines each "group" in the chord diagram
    const group = g.append('g')
        .attr('class', 'groups')
        .selectAll('g')
        .data(function(chords)
        {
            return chords.groups;
        })
        .enter().append('g');

    // Draw the radial arcs for each group
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    group.append('path')
        .style('fill', function(d)
        {
            return extendedChartColor(d.index);
        })
        .style('stroke-width', 2.0)
        .style('stroke', function(d)
        {
            return extendedChartColor(d.index);
        })
        .attr('d', arc)
        .on('mouseover', fadeRibbonsWithSameSource(.1))
        .on('mouseout', fadeRibbonsWithSameSource(1))
        .append('title')
        .text(function(d)
        {
            return chordTip(d);
        });

    // Add labels to each group
    group.append('text')
        .attr('dy', '.35em') //width
        .attr('class', 'org-label')
        .attr('transform', function(d, i)
        {
            d.angle = (d.startAngle + d.endAngle) / 2;
            d.name = orgs[i];
            const degree = d.angle * 180 / Math.PI;
            const flip = (degree > 180 ? 90 : -90);
            return 'rotate(' + degree + ')' +
                'translate(0,' + -1 * (outerRadius + 5) + ')' +
                'rotate(' + flip + ')';
        })
        .style('text-anchor', function(d)
        {
            return d.angle > Math.PI ? 'end' : null;
        })
        .text(function(d)
        {
            return d.name;
        });
}

function visualizeOrgsWithTopConnections(orgs, matrix, quota)
{
    // Calculate the number of connections that we would need to visualize
    // if we only visualize connections larger than the threshold
    let threshold = 0;
    let connections = 0;
    let lastConnections;
    do
    {
        lastConnections = connections;
        connections = matrix
            .map(function(x)
            {
                return x.map(function(y)
                {
                    return y > threshold ? 1 : 0;
                });
            })
            .reduce(function(sumX, x)
            {
                return sumX + x.reduce(function(sumY, y)
                {
                    return sumY + y;
                }, 0);
            }, 0);
        threshold++;
    } while (connections > quota && lastConnections != connections);

    // Clear all organizations relationships that have less than threshold
    // count connections in both (!) directions
    for (let x = matrix.length - 1; x >= 0; x--)
    {
        for (let y = matrix[0].length - 1; y >= 0; y--)
        {
            if (matrix[x][y] < threshold && matrix[y][x] < threshold)
                matrix[x][y] = 0;
        }
    }

    drawChord(orgs, matrix);
}

function visualizeSingleOrg(orgs, matrix, orgID)
{
    for (let x = matrix.length - 1; x >= 0; x--)
    {
        for (let y = matrix[0].length - 1; y >= 0; y--)
        {
            if (x != orgID && y != orgID)
                matrix[x][y] = 0;
        }
    }

    // Make the single org the first entry in the matrix to ensure that it
    // always gets the same color in the chart.
    if (orgID != 0)
    {
        let t = orgs[orgID];
        orgs[orgID] = orgs[0];
        orgs[0] = t;
        for (let x = matrix.length - 1; x >= 0; x--)
        {
            for (let y = matrix[0].length - 1; y >= 0; y--)
            {
                if (x == orgID)
                {
                    let t = matrix[x][y];
                    matrix[x][y] = matrix[0][y];
                    matrix[0][y] = t;
                }
                if (y == orgID)
                {
                    let t = matrix[x][y];
                    matrix[x][y] = matrix[x][0];
                    matrix[x][0] = t;
                }
            }
        }
    }

    drawChord(orgs, matrix);
}

function createChordChart(canvas)
{
    const url = $(canvas).data('url');
    const quota = 50;
    let spinner = createSpinner(canvas);

    d3.text(url,
        function(text)
        {
            const data = d3.tsvParseRows(text);
            const orgs = data.shift();
            const matrix = data.map(function(x)
            {
                return x.map(function(y)
                {
                    return +y;
                });
            });

            function menuChanged()
            {
                // The rendering functions are going to adjust the org and
                // matrix array. Therefore, we create a deep copy here.
                const orgsCopy = orgs.slice(0);
                const matrixCopy = matrix.map(function(x)
                {
                    return x.slice(0);
                });

                if (d3.event && +d3.event.target.value >= 0)
                {
                    visualizeSingleOrg(orgsCopy, matrixCopy, +d3.event.target.value);
                }
                else
                {
                    visualizeOrgsWithTopConnections(orgsCopy, matrixCopy, quota);
                }
            }

            const menuItems = [
                {value: -1, name: `Top ${quota} connections`},
                {value: -1, name: '—'},
            ].concat(
                orgs.map(function(x, i)
                {
                    return {value: i, name: x};
                })
            );
            d3.select('select')
                .attr('class', 'select')
                .on('change', menuChanged)
                .selectAll('option')
                .data(menuItems).enter()
                .append('option')
                .attr('value', function(d)
                {
                    return d.value;
                })
                .text(function(d)
                {
                    return d.name;
                });

            menuChanged();
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}

$(window).bind('load', function()
{
    Chart.defaults.global.defaultFontFamily = '\'Open Sans\', sans-serif';

    const chartPlaceholders = $('.chart-placeholder');

    chartPlaceholders.each(
        function(index, chartPlaceholder)
        {
            const titles = $(chartPlaceholder).find('h3');
            const charts = $(chartPlaceholder).find('canvas, svg, table');
            const canvases = $(chartPlaceholder).find('canvas, svg');
            const tables = $(chartPlaceholder).find('table');
            const infoBoxes = $(chartPlaceholder).find('.info-box');

            // Put a bar with the title and additional actions before the chart container
            if (readConfig($(charts.first()), 'showRawDataLink') != false && $(charts.first()).attr('data-url'))
            {
                titles.insertBefore(chartPlaceholder).wrapAll(
                    '<div class="row action-bar"><div class="col-main"></div></div>');

                // Add an action box as the first info box
                const downloadLink = '<a class="button" href="' + $(charts.first()).attr('data-url')
                                   + '" target="_blank">Raw data</a>';
                titles.parent().parent().append(
                    '<div class="col-aside"><div class="info-box"><p>' + downloadLink + '</p></div></div>');
            }
            else
                titles.insertBefore(chartPlaceholder).wrap('<div class="row"></div>');

            // Turn the placeholder into a proper layout row
            $(chartPlaceholder).removeClass('chart-placeholder');
            $(chartPlaceholder).addClass('row');

            // Put the canvas into the main column
            $(charts).wrapAll('<div class="col-main"><div class="chart-container"></div></div>');
            // Put all the info boxes into the aside column
            infoBoxes.wrapAll('<div class="col-aside"></div>');

            // Create the actual charts
            canvases.each(
                function(index, canvas)
                {
                    switch ($(canvas).attr('data-type'))
                    {
                        case 'history':
                            return createHistoryChart(canvas);
                        case 'list':
                            return createList(canvas);
                        case 'chord':
                            return createChordChart(canvas);
                    }
                });

            tables.each(
                function(index, table)
                {
                    return createTable(table);
                });
        });
});
