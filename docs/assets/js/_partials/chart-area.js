class AreaChart
{
    constructor(config, canvas, actionBar)
    {
        this.config = config;
        this.actionBar = actionBar;

        this.context = canvas.getContext('2d');
        this.views = [];
        this.defaultView = null;

        // Show spinning animation while loading
        this.spinner = createSpinner(canvas);
    }

    render(data)
    {
        sortTimeData(data);

        this._checkData(data);
        this._initializeViews(data);

        // Build chart data for each view separately
        for (const view of this.views)
        {
            this._aggregateData(view);

            if (view.normalize)
                this._normalizeData(view);

            // Build the actual data used by Chart.js for rendering
            this._buildChartData(view);
        }

        this.chartJSChart = new Chart(
            this.context,
            {
                type: 'line',
                data:
                {
                    datasets: this.defaultView.chartData,
                },
                options: this.defaultView.style,
            });

        this._renderActionBar();
        this.spinner.stop();
    }

    _checkData(data)
    {
        for (const row of data)
            if (!('date' in row))
                throw 'invalid data format';
    }

    _initializeViews(data)
    {
        // Collect the data for each view in an array
        if ('views' in this.config)
        {
            this.views = this.config.views;

            for (const view of this.views)
                view.rawData = deepCopyArray(data);
        }
        else
        {
            this.views = [{'default': true}];
            this.views[0].default = true;
            this.views[0].rawData = deepCopyArray(data);
        }

        this.defaultView = this.views.find(view => (view.default == true));

        if (this.defaultView == undefined)
            this.defaultView = this.views[0];

        for (const view of this.views)
        {
            const originalDatasetIDs = Object.keys(view.rawData[0]).slice(1);

            if ('datasets' in view)
                view.datasetIDs = view.datasets;
            else
            {
                if ('datasets' in this.config)
                    view.datasetIDs = this.config.datasets;
                else
                    view.datasetIDs = originalDatasetIDs;
            }

            if ('visibleDatasets' in view)
                view.visibleDatasetIDs = view.visibleDatasets;
            else
            {
                if ('visibleDatasets' in this.config)
                    view.visibleDatasetIDs = this.config.visibleDatasets;
                else
                    view.visibleDatasetIDs = originalDatasetIDs;
            }

            if (!('normalize' in view))
                view.normalize = false;

            view.style = view.normalize ? AreaChart.normalizedStyle : AreaChart.style;
        }
    }

    _aggregateData(view)
    {
        if ('aggregate' in view && view.aggregate != false)
            view.rawData = aggregateTimeData(view.rawData, view.aggregate);

        if ('slice' in view)
        {
            const sliceIndex0 = Math.max(0, Math.min(view.rawData.length,
                view.rawData.length - view.slice[1]));
            const sliceIndex1 = Math.max(0, Math.min(view.rawData.length,
                view.rawData.length - view.slice[0]));
            view.rawData = view.rawData.slice(sliceIndex0, sliceIndex1);
        }
    }

    _normalizeData(view)
    {
        if (view.rawData.length == 0)
            return;

        view.rawData.forEach(
            row =>
            {
                const sum = view.datasetIDs.reduce((sum, datasetID) => sum + row[datasetID], 0);

                view.datasetIDs.forEach(
                    datasetID =>
                    {
                        row[datasetID] = (sum == 0) ? undefined : row[datasetID] / sum;
                    });
            });
    }

    _buildChartData(view)
    {
        if (view.rawData.length == 0)
            return;

        view.chartData = Array();

        for (const datasetID of view.datasetIDs)
        {
            // Hide auxiliary columns
            if (datasetID[0] == '_')
                continue;

            const color = chartColorSequence[view.chartData.length % chartColorSequence.length];
            const backgroundColorString = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', 0.75)';

            let dataset =
                {
                    label: datasetID,
                    backgroundColor: backgroundColorString,
                    borderColor: 'transparent',
                    fill: (view.chartData.length == 0 ? 'start' : '-1'),
                    radius: 0,
                    hidden: (view.visibleDatasetIDs.indexOf(datasetID) == -1) ? true : false,
                };

            dataset.data = view.rawData.map(
                row =>
                    ({
                        x: row.date,
                        y: row[datasetID],
                        dateRange: row._dateRange,
                        infoText: row._infoText,
                    }));

            view.chartData.push(dataset);
        }
    }

    _renderActionBar()
    {
        if (this.views.length == 0)
            return;

        let buttons = `
            <div class="button-bar view-switch">
                <div title="Select time range to show"><i class="fas fa-calendar"></i></div>`;

        for (const [index, view] of this.views.entries())
            buttons += `
                <a class="button${view === this.defaultView ? ' active' : ''}" href="#"
                    title="${view.tooltip}" data-view-id="${index}">${view.label}</a>`;

        buttons += `
            </div>`;

        this.actionBar.prepend(buttons);

        let chart = this;

        this.actionBar.find('.view-switch a').click(
            function()
            {
                $(this).parent().find('.active').removeClass('active');

                const view = chart.views[$(this).data('view-id')];

                // Replace the visible data
                chart.chartJSChart.data.datasets = view.chartData;
                chart.chartJSChart.options = view.style;

                // Trigger a Chart.js update
                chart.chartJSChart.update();
                $(this).addClass('active');

                return false;
            });
    }
}

AreaChart.style =
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
                    },
                },
            ],
            yAxes:
            [
                {
                    stacked: true,
                },
            ],
        },
        tooltips:
        {
            intersect: false,
            callbacks:
            {
                title:
                    (tooltipItem, data) =>
                    {
                        // In this chart, tooltips are rendered for individual data points.
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
                    },
            },
        },
    };

AreaChart.normalizedStyle = deepCopyObject(AreaChart.style);
AreaChart.normalizedStyle.scales.yAxes[0].ticks =
    {
        beginAtZero: true,
        max: 1,
        callback: value => (value * 100).toFixed(0) + ' %',
    };
AreaChart.normalizedStyle.tooltips.callbacks.label =
    function(tooltipItem, data)
    {
        const dataset = data.datasets[tooltipItem.datasetIndex];
        const label = dataset.label;
        const value = dataset.data[tooltipItem.index].y;

        return label + ': ' + (value * 100).toFixed(1) + ' %';
    };
