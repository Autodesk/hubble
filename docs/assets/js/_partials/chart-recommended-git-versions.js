class RecommendedGitVersionsChart extends AreaChart
{
    constructor(canvas, actionBar)
    {
        const config =
        {
            views:
            [
                {
                    label: '2 m',
                    tooltip: 'Show the last 2 months',
                    aggregate: false,
                    slice: [0, 61],
                },
                {
                    label: '2 y',
                    tooltip: 'Show the last 2 years',
                    aggregate:
                    {
                        period: 'week',
                        method: 'first'
                    },
                    slice: [0, 106],
                    default: true,
                },
                {
                    label: 'all',
                    tooltip: 'Show all data',
                    aggregate:
                    {
                        period: 'week',
                        method: 'first',
                    },
                },
            ],
        };

        super(config, canvas, actionBar);
    }

    render()
    {
        const gitVersionsDatabase = new GitVersionsDatabase();
        const dataURL = '{{ site.dataURL }}/git-versions-new.tsv';

        // Attempt to retrieve the Git versions data from the online source first
        d3.queue()
            .defer(d3.tsv, dataURL)
            .defer(callback => gitVersionsDatabase.load(callback))
            .await((error, data, gitVersionsData) => this._handleData(error, data, gitVersionsData));
    }

    _handleData(error, data, gitVersionsData)
    {
        if (error)
            throw 'could not load chart data';

        const chartData = this._computeChartData(data, gitVersionsData);
        super.render(chartData);
    }

    // Compute the chart data to display
    _computeChartData(data, gitVersionsData)
    {
        const gitReleases = gitVersionsData.gitVersions.releases;
        let result = {};

        for (const key in data)
        {
            const row = data[key];
            const date = new Date(row.date);
            let version = row['Git version'];
            const users = +row.users;

            if (row.date === undefined)
                continue;

            if (!(date in result))
                result[date] =
                {
                    date: date,
                    recommended: 0,
                    outdated: 0,
                    vulnerable: 0,
                };

            while (version.split('.').length < 3)
                version += '.0';

            const versionMajor = version.split('.')[0];

            if (versionMajor == '0' || versionMajor == '1')
            {
                result[date].vulnerable += users;
                continue;
            }

            if ('vulnerableSince' in gitReleases[version]
                && gitReleases[version].vulnerableSince < date)
            {
                result[date].vulnerable += users;
                continue;
            }

            if ('outdatedSince' in gitReleases[version]
                && gitReleases[version].outdatedSince < date)
            {
                result[date].outdated += users;
                continue;
            }

            result[date].recommended += users;
        }

        // Turn dictionary with date as key into a plain array
        return Object.keys(result).map(key => result[key]);
    }
}
