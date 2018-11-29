---
---

{% include_relative _partials/style.js %}
{% include_relative _partials/spinner.js %}
{% include_relative _partials/urls.js %}
{% include_relative _partials/semantic-versioning.js %}
{% include_relative _partials/aggregate.js %}
{% include_relative _partials/chart-base.js %}

{% include_relative _partials/chart-history.js %}
{% include_relative _partials/chart-list.js %}
{% include_relative _partials/chart-table.js %}
{% include_relative _partials/chart-chord.js %}

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
            titles.insertBefore(chartPlaceholder).wrapAll(
                '<div class="row action-bar"><div class="col-main"></div></div>');

            // Add an action bar as the first info box
            let actionBarHTML = `
                <div class="col-aside">
                    <div class="info-box">
                        <div class="button-container">
                            <div class="left">
                            </div>
                            <div class="right">`;

            if (readConfig($(charts.first()), 'showRawDataLink') != false && $(charts.first()).attr('data-url'))
                actionBarHTML += `
                                <a class="button" href="${$(charts.first()).attr('data-url')}" target="_blank"
                                    title="Download raw data"><i class="fas fa-download"></i></a>`;

            actionBarHTML += `
                            </div>
                        </div>
                    </div>
                </div>`;

            titles.parent().parent().append(actionBarHTML);

            const actionBar = titles.parent().parent().find('.button-container .left');

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
                            createHistoryChart(canvas, actionBar);
                            break;
                        case 'list':
                            createList(canvas);
                            break;
                        case 'chord':
                            createChordChart(canvas, actionBar);
                            break;
                    }
                });

            tables.each(
                function(index, table)
                {
                    if ($(table).attr('data-type') == 'table')
                        createTable(table);
                });
        });
});
