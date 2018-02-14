/* global
    aggregateTimeData,
    createChordChart,
    createHistoryChart,
    createList,
    createTable,
    createSpinner,
    document,
*/

describe('global charts.js', function()
{
    describe('createChordChart function', function()
    {
        it('should exist', function()
        {
            expect(createChordChart).toBeDefined();
        });
    });
    describe('createHistoryChart function', function()
    {
        it('should exist', function()
        {
            expect(createHistoryChart).toBeDefined();
        });
    });
    describe('createList function', function()
    {
        it('should exist', function()
        {
            expect(createList).toBeDefined();
        });
    });
    describe('createTable function', function()
    {
        it('should exist', function()
        {
            expect(createTable).toBeDefined();
        });
    });
    describe('createSpinner function', function()
    {
        let canvas;
        beforeEach(function()
        {
            canvas = $('<div id=\'test\'></div>');
            $('body').append(canvas);
        });
        afterEach(function()
        {
            canvas.remove();
        });
        it('should exist', function()
        {
            expect(createSpinner).toBeDefined();
        });
        it('should return an object with a stop method', function()
        {
            let spinner = createSpinner(canvas[0]);
            expect(spinner.stop).toBeDefined();
            spinner.stop();
        });
        describe('stop method', function()
        {
            it('should destroy the spinner container after execution', function()
            {
                let spinner = createSpinner(canvas[0]);
                spinner.stop();
                expect($('.spinner-container').length).toEqual(0);
            });
        });
    });
    describe('aggregation for time series', function()
    {
        // Generate data from startDate to endDate (both inclusive) with a generator functor
        function generateData(startDate, endDate, generator)
        {
            let dates = d3.utcDay.range(d3.isoParse(startDate), d3.utcDay.offset(d3.isoParse(endDate), 1));
            let data = Array();

            for (let i = 0; i < dates.length; i++)
                data.push({'date': dates[i], 'value': generator(i)});

            return data;
        }

        // Integer range generator
        function integerRangeGenerator(start, modulo)
        {
            if (modulo)
                return (i => (start + i) % modulo);

            return (i => start + i);
        }

        const dateToString = d3.utcFormat('%Y-%m-%d');

        it('should aggregate over weeks correctly', function()
        {
            const aggregationConfig = {'period': 'week', 'method': 'max'};
            const generator = integerRangeGenerator(0, 28);
            // 2018-01-01 is a Monday, and 2018-09-30 is a Sunday
            const data = generateData('2018-01-01', '2018-09-30', generator);
            const aggregatedData = aggregateTimeData(data, aggregationConfig);

            expect(aggregatedData.length = 39);
            expect(dateToString(aggregatedData[0]['date'])).toEqual('2018-01-01');
            expect(dateToString(aggregatedData[1]['date'])).toEqual('2018-01-08');
            expect(dateToString(aggregatedData[2]['date'])).toEqual('2018-01-15');
            expect(dateToString(aggregatedData[37]['date'])).toEqual('2018-09-17');
            expect(dateToString(aggregatedData[38]['date'])).toEqual('2018-09-24');
            expect(aggregatedData[0]['value']).toEqual(6);
            expect(aggregatedData[1]['value']).toEqual(13);
            expect(aggregatedData[2]['value']).toEqual(20);
            expect(aggregatedData[4]['value']).toEqual(6);
            expect(aggregatedData[5]['value']).toEqual(13);
            expect(aggregatedData[36]['value']).toEqual(6);
            expect(aggregatedData[37]['value']).toEqual(13);
            expect(aggregatedData[38]['value']).toEqual(20);
        });

        it('should not have off-by-one errors (1)', function()
        {
            const aggregationConfig = {'period': 'week', 'method': 'max'};
            const generator = integerRangeGenerator(27, 28);
            // 2017-12-31 is a Sunday, and 2018-10-01 is a Monday
            const data = generateData('2017-12-31', '2018-10-01', generator);
            const aggregatedData = aggregateTimeData(data, aggregationConfig);

            expect(aggregatedData.length = 39);
            expect(dateToString(aggregatedData[0]['date'])).toEqual('2018-01-01');
            expect(dateToString(aggregatedData[1]['date'])).toEqual('2018-01-08');
            expect(dateToString(aggregatedData[2]['date'])).toEqual('2018-01-15');
            expect(dateToString(aggregatedData[37]['date'])).toEqual('2018-09-17');
            expect(dateToString(aggregatedData[38]['date'])).toEqual('2018-09-24');
            expect(aggregatedData[0]['value']).toEqual(6);
            expect(aggregatedData[1]['value']).toEqual(13);
            expect(aggregatedData[2]['value']).toEqual(20);
            expect(aggregatedData[4]['value']).toEqual(6);
            expect(aggregatedData[5]['value']).toEqual(13);
            expect(aggregatedData[36]['value']).toEqual(6);
            expect(aggregatedData[37]['value']).toEqual(13);
            expect(aggregatedData[38]['value']).toEqual(20);
        });

        it('should not have off-by-one errors (2)', function()
        {
            const aggregationConfig = {'period': 'week', 'method': 'max'};
            const generator = integerRangeGenerator(1, 28);
            // 2018-01-02 is a Tuesday, and 2018-09-29 is a Saturday
            const data = generateData('2018-01-02', '2018-09-29', generator);
            const aggregatedData = aggregateTimeData(data, aggregationConfig);

            expect(aggregatedData.length = 37);
            expect(dateToString(aggregatedData[0]['date'])).toEqual('2018-01-08');
            expect(dateToString(aggregatedData[1]['date'])).toEqual('2018-01-15');
            expect(dateToString(aggregatedData[35]['date'])).toEqual('2018-09-10');
            expect(dateToString(aggregatedData[36]['date'])).toEqual('2018-09-17');
            expect(aggregatedData[0]['value']).toEqual(13);
            expect(aggregatedData[1]['value']).toEqual(20);
            expect(aggregatedData[3]['value']).toEqual(6);
            expect(aggregatedData[4]['value']).toEqual(13);
            expect(aggregatedData[35]['value']).toEqual(6);
            expect(aggregatedData[36]['value']).toEqual(13);
        });

        it('should aggregate sums correctly', function()
        {
            const aggregationConfig = {'period': 'week', 'method': 'sum'};
            const generator = integerRangeGenerator(0, 10);
            // 2018-01-01 is a Monday, and 2018-09-30 is a Sunday
            const data = generateData('2018-01-01', '2018-09-30', generator);
            const aggregatedData = aggregateTimeData(data, aggregationConfig);

            expect(aggregatedData.length = 39);
            expect(aggregatedData[0]['value']).toEqual(21);
            expect(aggregatedData[1]['value']).toEqual(30);
            expect(aggregatedData[2]['value']).toEqual(39);
            expect(aggregatedData[36]['value']).toEqual(35);
            expect(aggregatedData[37]['value']).toEqual(24);
            expect(aggregatedData[38]['value']).toEqual(33);
        });

        it('should aggregate over months correctly', function()
        {
            const aggregationConfig = {'period': 'month', 'method': 'first'};
            const generator = integerRangeGenerator(9, 10);
            const data = generateData('2017-12-31', '2019-01-01', generator);
            const aggregatedData = aggregateTimeData(data, aggregationConfig);

            expect(aggregatedData.length = 12);
            expect(dateToString(aggregatedData[0]['date'])).toEqual('2018-01-01');
            expect(dateToString(aggregatedData[1]['date'])).toEqual('2018-02-01');
            expect(dateToString(aggregatedData[10]['date'])).toEqual('2018-11-01');
            expect(dateToString(aggregatedData[11]['date'])).toEqual('2018-12-01');
            expect(aggregatedData[0]['value']).toEqual(0);
            expect(aggregatedData[1]['value']).toEqual(1);
            expect(aggregatedData[10]['value']).toEqual(4);
            expect(aggregatedData[11]['value']).toEqual(4);
        });
    });
    describe('multiview charts', function()
    {
        const chartPlaceholders = `
<div class="chart-placeholder" id="chart-1">
    <h3>Pull Requests (Total)</h3>
    <canvas
        data-url="test-data/pull-request-history.tsv"
        data-type="history"
        data-config='{
            "views":
            [
                {
                    "label": "2 m",
                    "tooltip": "Show the last 2 months",
                    "aggregate": false,
                    "series": ["merged", "new"],
                    "visibleSeries": ["merged"],
                    "slice": [0, 61]
                },
                {
                    "label": "2 y",
                    "tooltip": "Show the last 2 years",
                    "aggregate":
                    {
                        "period": "week",
                        "method": "sum"
                    },
                    "series": ["merged", "new"],
                    "visibleSeries": ["merged"],
                    "slice": [0, 106],
                    "default": true
                },
                {
                    "label": "all",
                    "tooltip": "Show all data",
                    "aggregate":
                    {
                        "period": "week",
                        "method": "sum"
                    },
                    "series": ["merged", "new"],
                    "visibleSeries": ["merged"]
                }
            ]
        }'
    ></canvas>
</div>
<div class="chart-placeholder" id="chart-2">
    <h3>Pull Request Usage</h3>
    <canvas
        data-url="test-data/pull-request-usage.tsv"
        data-type="history"
        data-config='{"aggregate": {"period": "month", "method": "first"}}'
    ></canvas>
</div>`;
        beforeEach(function()
        {
            document.body.insertAdjacentHTML('afterbegin', chartPlaceholders);
        });
        afterEach(function()
        {
            document.body.removeChild(document.getElementById('chart-1'));
            document.body.removeChild(document.getElementById('chart-2'));
        });
        it('should be generated if multiple views are configured', function()
        {
            // TODO: add testing code for chart 1
        });
        it('should not be generated if a plain configuration without views is used', function()
        {
            // TODO: add testing code for chart 2
        });
    });
});
