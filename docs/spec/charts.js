/* global createCollaborationChart, createHistoryChart, createList, createTable, createSpinner */

describe('global charts.js', function()
{
    describe('createCollaborationChart function', function()
    {
        it('should exist', function()
        {
            expect(createCollaborationChart).toBeDefined();
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
});
