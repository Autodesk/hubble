/* global
    aggregateTimeData,
    createChordChart,
    createHistoryChart,
    createList,
    createTable,
    createSpinner,
    formatDate,
    formatDateRange,
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

            expect(aggregatedData.length).toEqual(39);
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

            expect(aggregatedData.length).toEqual(39);
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

            expect(aggregatedData.length).toEqual(37);
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

            expect(aggregatedData.length).toEqual(39);
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

            expect(aggregatedData.length).toEqual(12);
            expect(dateToString(aggregatedData[0]['date'])).toEqual('2018-01-01');
            expect(dateToString(aggregatedData[1]['date'])).toEqual('2018-02-01');
            expect(dateToString(aggregatedData[10]['date'])).toEqual('2018-11-01');
            expect(dateToString(aggregatedData[11]['date'])).toEqual('2018-12-01');
            expect(aggregatedData[0]['value']).toEqual(0);
            expect(aggregatedData[1]['value']).toEqual(1);
            expect(aggregatedData[10]['value']).toEqual(4);
            expect(aggregatedData[11]['value']).toEqual(4);
        });

        it('should format dates correctly', function()
        {
            // The local time zone should not affect the displayed dates, which are to be interpreted as UTC
            const testCases =
            [
                {localTimeZone: 'Etc/GMT-1', date: '2018-12-31T00:00:00.000Z', expectedResult: '31 Dec 2018'},
                {localTimeZone: 'Etc/GMT-1', date: '2018-12-31T23:59:59.000Z', expectedResult: '31 Dec 2018'},
                {localTimeZone: 'Etc/GMT-1', date: '2019-01-01T00:30:00.000Z', expectedResult: '1 Jan 2019'},
                {localTimeZone: 'Etc/GMT', date: '2018-12-31T00:00:00.000Z', expectedResult: '31 Dec 2018'},
                {localTimeZone: 'Etc/GMT', date: '2018-12-31T23:59:59.000Z', expectedResult: '31 Dec 2018'},
                {localTimeZone: 'Etc/GMT', date: '2019-01-01T00:30:00.000Z', expectedResult: '1 Jan 2019'},
                {localTimeZone: 'Etc/GMT+1', date: '2018-12-31T00:00:00.000Z', expectedResult: '31 Dec 2018'},
                {localTimeZone: 'Etc/GMT+1', date: '2018-12-31T23:59:59.000Z', expectedResult: '31 Dec 2018'},
                {localTimeZone: 'Etc/GMT+1', date: '2019-01-01T00:30:00.000Z', expectedResult: '1 Jan 2019'}
            ];

            for (let i = 0; i < testCases.length; i++)
            {
                moment.tz.setDefault(testCases[i].localTimeZone);

                expect(formatDate(testCases[i].date)).toEqual(testCases[i].expectedResult);
            }
        });

        it('should format date ranges correctly', function()
        {
            // The local time zone should not affect the displayed dates, which are to be interpreted as UTC
            // Ranges are exclusive of the end date and should handle this correctly
            const testCases =
            [
                {localTimeZone: 'Etc/GMT-1', dateRange: ['2018-06-01T00:00:00.000Z', '2018-06-08T00:00:00.000Z'],
                    expectedResult: '1 Jun 2018 to 7 Jun 2018'},
                {localTimeZone: 'Etc/GMT', dateRange: ['2018-06-01T00:00:00.000Z', '2018-06-08T00:00:00.000Z'],
                    expectedResult: '1 Jun 2018 to 7 Jun 2018'},
                {localTimeZone: 'Etc/GMT+1', dateRange: ['2018-06-01T00:00:00.000Z', '2018-06-08T00:00:00.000Z'],
                    expectedResult: '1 Jun 2018 to 7 Jun 2018'}
            ];

            for (let i = 0; i < testCases.length; i++)
            {
                moment.tz.setDefault(testCases[i].localTimeZone);

                expect(formatDateRange(testCases[i].dateRange)).toEqual(testCases[i].expectedResult);
            }
        });

        it('formatting date ranges repeatedly should not modify the data', function()
        {
            moment.tz.setDefault('Etc/GMT');

            const date1 = new Date('2018-06-01T00:00:00.000Z');
            const date2 = new Date('2018-06-08T00:00:00.000Z');
            const date3 = new Date('2018-06-15T00:00:00.000Z');

            const dateRange1 = [date1, date2];
            const dateRange2 = [date2, date3];

            for (let i = 0; i < 20; i++)
            {
                expect(formatDateRange(dateRange1)).toEqual('1 Jun 2018 to 7 Jun 2018');
                expect(formatDateRange(dateRange2)).toEqual('8 Jun 2018 to 14 Jun 2018');
            }
        });
    });
});
