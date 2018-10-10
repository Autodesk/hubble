const gitVersionsChartDefaults =
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
                    tooltipFormat: 'D MMM YYYY',
                    minUnit: 'day',
                }
            }
        ],
        yAxes:
        [
            {
                stacked: true,
                ticks:
                    {
                        beginAtZero: true
                    }
            }
        ]
    },
};

function buildGitVersionsChartData(view)
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

            let color;

            switch (dataSeriesID)
            {
                case 0:
                    color = chartColorSequence[1];
                    break;
                case 1:
                    color = chartColorSequence[2];
                    break;
                case 2:
                    color = chartColorSequence[3];
                    break;
            }

            const backgroundColorString = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
            const borderColorString = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';

            let seriesData =
            {
                label: dataSeries,
                backgroundColor: backgroundColorString,
                borderColor: 'transparent',
                pointRadius: 0,
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

function createGitVersionsChart(canvas, actionBar)
{
    let spinner = createSpinner(canvas);

    // Flag Git versions as vulnerable or outdated
    const flagGitVersions =
        function(gitVersionsData)
        {
            let gitReleases = gitVersionsData["gitVersions"]["releases"];
            const knownVulnerabilities = gitVersionsData["gitVersions"]["knownVulnerabilities"];

            // Turn all dates into actual Date objects
            for (version in gitReleases)
                gitReleases[version]["publishedOn"] = new Date(gitReleases[version]["publishedOn"]);

            // Flag all outdated Git versions
            for (version in gitReleases)
            {
                const gitRelease = gitReleases[version];
                const versionComponents = version.split('.');
                const versionMajor = +versionComponents[0];
                const versionMinor = +versionComponents[1];
                const versionPatch = +versionComponents[2];

                if (versionPatch == 0)
                    continue;

                const directPredecessorVersion =
                    versionMajor + '.' + versionMinor + '.' + (versionPatch - 1);

                if (directPredecessorVersion in gitReleases)
                {
                    gitReleases[directPredecessorVersion]["outdatedSince"] = gitRelease["publishedOn"];
                    gitReleases[directPredecessorVersion]["outdatedBy"] = version;
                }
            }

            // Flag all vulnerable Git versions
            for (key in knownVulnerabilities)
            {
                // TODO: rename ~known~ vulnerabilities
                let vulnerability = knownVulnerabilities[key];
                vulnerability["publishedOn"] = new Date(vulnerability["publishedOn"]);

                // TODO: Fix mixed snake case/dash trains
                for (key in vulnerability["affectedVersions"])
                {
                    const affectedVersionsRequirement = vulnerability["affectedVersions"][key];

                    const affectedVersions = Object.keys(gitReleases).filter(
                        version => satisfiesVersionRequirement(version, affectedVersionsRequirement));

                    for (key in affectedVersions)
                    {
                        const affectedVersion = affectedVersions[key];
                        let affectedRelease = gitReleases[affectedVersion];

                        if ("vulnerableSince" in affectedRelease
                            && affectedRelease["vulnerableSince"] < vulnerability["publishedOn"])
                        {
                            continue;
                        }

                        affectedRelease["vulnerableSince"] = vulnerability["publishedOn"];
                        affectedRelease["vulnerableBy"] = vulnerability["issue"];
                    }
                }
            }
        };

    // Compute the chart data to display
    const computeChartData =
        function(data, gitVersionsData)
        {
            const gitReleases = gitVersionsData["gitVersions"]["releases"];
            let result = {};

            for (key in data)
            {
                const row = data[key];
                const date = new Date(row["date"]);
                let version = row["Git version"];
                const users = +row["users"];

                if (row["date"] === undefined)
                    continue;

                while (version.split('.').length < 3)
                    version += '.0';

                const versionMajor = version.split('.')[0];

                if (versionMajor == '0' || versionMajor == '1')
                {
                    result[date]["vulnerable"] += users;
                    continue;
                }

                if (!(date in result))
                    result[date] = {"date": date, "recommended": 0, "outdated": 0, "vulnerable": 0};

                if ("vulnerableSince" in gitReleases[version]
                    && gitReleases[version]["vulnerableSince"] < date)
                {
                    result[date]["vulnerable"] += users;
                    continue;
                }

                if ("outdatedSince" in gitReleases[version]
                    && gitReleases[version]["outdatedSince"] < date)
                {
                    result[date]["outdated"] += users;
                    continue;
                }

                result[date]["recommended"] += users;
            }

            result = Object.keys(result).map(key => result[key]);

            for (key in result)
            {
                let row = result[key];
                const total = row["vulnerable"] + row["outdated"] + row["recommended"];
                row["vulnerable"] *= 99.9999 / total;
                row["outdated"] *= 99.9999 / total;
                row["recommended"] *= 99.9999 / total;
            }

            return result;
        };

    // Build the chart from the data
    const createChart =
        function(data, gitVersionsData)
        {
            data = computeChartData(data, gitVersionsData);
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

                views[i].chartData = buildGitVersionsChartData(views[i]);
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

            let options = jQuery.extend({}, gitVersionsChartDefaults);

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
        };

    const handleData =
        function(error, data, gitVersionsData)
        {
            if (error)
                throw error;

            if (+gitVersionsData["schemaVersion"] != 1)
                throw "unexpected Git versions data schema, please update Hubble Enterprise";

            flagGitVersions(gitVersionsData);

            const chart = createChart(data, gitVersionsData);
            spinner.stop();
            return chart;
        };

    const dataURL = $(canvas).data('url');
    const gitVersionsDataURL = readConfig($(canvas), 'git-versions-data-url');

    d3.queue()
        .defer(d3.tsv, dataURL)
        .defer(d3.json, gitVersionsDataURL)
        .await(handleData);
}
