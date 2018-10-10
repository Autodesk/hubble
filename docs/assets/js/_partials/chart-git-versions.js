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

function createGitVersionsChart(canvas, actionBar)
{
    let spinner = createSpinner(canvas);

    // Flag Git versions as vulnerable or outdated
    const flagGitVersions =
        function(gitVersionsData)
        {
            let gitReleases = gitVersionsData["git-versions"]["releases"];
            const knownVulnerabilities = gitVersionsData["git-versions"]["known-vulnerabilities"];

            // Turn all dates into actual Date objects
            for (version in gitReleases)
                gitReleases[version]["publish_date"] = new Date(gitReleases[version]["publish_date"]);

            // Flag all deprecated Git versions
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
                    gitReleases[directPredecessorVersion]["deprecate_date"] = gitRelease["publish_date"];
                    gitReleases[directPredecessorVersion]["deprecated_by"] = version;
                }
            }

            // Flag all vulnerable Git versions
            for (key in knownVulnerabilities)
            {
                // TODO: rename ~known~ vulnerabilities
                let vulnerability = knownVulnerabilities[key];
                vulnerability["publish_date"] = new Date(vulnerability["publish_date"]);

                // TODO: Fix mixed snake case/dash trains
                for (key in vulnerability["affected_versions"])
                {
                    const affectedVersionsRequirement = vulnerability["affected_versions"][key];

                    const affectedVersions = Object.keys(gitReleases).filter(
                        version => satisfiesVersionRequirement(version, affectedVersionsRequirement));

                    for (key in affectedVersions)
                    {
                        const affectedVersion = affectedVersions[key];
                        let affectedRelease = gitReleases[affectedVersion];

                        if ("vulnerable_date" in affectedRelease
                            && affectedRelease["vulnerable_date"] < vulnerability["publish_date"])
                        {
                            continue;
                        }

                        affectedRelease["vulnerable_date"] = vulnerability["publish_date"];
                        affectedRelease["vulnerable_by"] = vulnerability["issue"];
                    }
                }
            }
        };

    // Compute the chart data to display
    const computeChartData =
        function(data, gitVersionsData)
        {
            const gitReleases = gitVersionsData["git-versions"]["releases"];
            let result = {};

            for (key in data)
            {
                const row = data[key];
                const date = new Date(row["date"]);
                const version = row["Git version"];
                const users = +row["users"];

                if (row["date"] === undefined)
                    continue;

                if (!(date in result))
                    result[date] = {"date": date, "unknown": 0, "recommended": 0, "deprecated": 0, "vulnerable": 0};

                if (!(version in gitReleases))
                {
                    result[date]["unknown"] += users;
                    continue;
                }

                if ("vulnerable_date" in gitReleases[version]
                    && gitReleases[version]["vulnerable_date"] < date)
                {
                    result[date]["vulnerable"] += users;
                    continue;
                }

                if ("deprecate_date" in gitReleases[version]
                    && gitReleases[version]["deprecate_date"] < date)
                {
                    result[date]["deprecated"] += users;
                    continue;
                }

                result[date]["recommended"] += users;
            }

            result = Object.keys(result).map(key => result[key]);

            for (key in result)
            {
                let row = result[key];
                const total = row["vulnerable"] + row["deprecated"] + row["recommended"] + row["unknown"];
                row["vulnerable"] /= total;
                row["deprecated"] /= total;
                row["recommended"] /= total;
                row["unknown"] /= total;
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

            if (+gitVersionsData["schema-version"] != 1)
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
