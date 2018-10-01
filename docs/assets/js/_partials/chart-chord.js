function drawChord(orgs, matrix)
{
    function fadeRibbon(opacity)
    {
        return function(activeRibbon)
        {
            ribbons.filter(d => (d != activeRibbon))
                .transition()
                .style('opacity', opacity);
        };
    }

    function fadeRibbonsWithSameSource(opacity)
    {
        return function(d, i)
        {
            ribbons.filter(d => (d.source.index != i && d.target.index != i))
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
        count = matrix.reduce((a, b) => (a + b[i]), 0)
            + matrix[i].reduce((a, b) => (a + b), 0);
        if (count == 0)
        {
            matrix.splice(i, 1);
            matrix.map(x => x.splice(i, 1));
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
        .data(chords => chords)
        .enter().append('g')
        .on('mouseover', fadeRibbon(.1))
        .on('mouseout', fadeRibbon(1));

    ribbons
        .append('path')
        .attr('d', ribbon)
        .style('stroke-width', 5.0)
        .style('stroke', '#ffffff');

    ribbons
        .append('path')
        .attr('d', ribbon)
        .style('fill', d => extendedChartColor(d.source.index))
        .style('stroke-width', 2.0)
        .style('stroke', d => extendedChartColor(d.source.index));

    ribbons.append('title')
        .text(d => ribbonTip(d));

    // Defines each "group" in the chord diagram
    const group = g.append('g')
        .attr('class', 'groups')
        .selectAll('g')
        .data(chords => chords.groups)
        .enter().append('g');

    // Draw the radial arcs for each group
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    group.append('path')
        .style('fill', d => extendedChartColor(d.index))
        .style('stroke-width', 2.0)
        .style('stroke', d => extendedChartColor(d.index))
        .attr('d', arc)
        .on('mouseover', fadeRibbonsWithSameSource(.1))
        .on('mouseout', fadeRibbonsWithSameSource(1))
        .append('title')
        .text(d => chordTip(d));

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
        .style('text-anchor', d => (d.angle > Math.PI ? 'end' : null))
        .text(d => d.name);
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
            .map(x => x.map(y => (y > threshold ? 1 : 0)))
            .reduce((sumX, x) => (sumX + x.reduce((sumY, y) => (sumY + y), 0)), 0);
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

function createChordChart(canvas, actionBar)
{
    const url = $(canvas).data('url');
    const quota = 50;
    let spinner = createSpinner(canvas);

    d3.text(url,
        function(text)
        {
            const data = d3.tsvParseRows(text);

            let views;

            if (hasConfig($(canvas), 'views'))
                views = readConfig($(canvas), 'views');
            else
            {
                if ($(canvas).data('config') != undefined)
                    views = [$(canvas).data('config')];
                else
                    views = [{}];

                views[0].default = true;
            }

            // Obtain matrix for each view separately
            for (let i = 0; i < views.length; i++)
            {
                views[i].orgs = data.shift();
                const matrixSize = views[i].orgs.length;

                if (data.length < matrixSize)
                    throw `inconsistent data matrix format, missing rows: ${matrixSize - data.length}`;

                views[i].data = data.splice(0, matrixSize).map(x => x.map(y => +y));
                views[i].menuItems =
                    [
                        {value: -1, name: `Top ${quota} connections`},
                        {value: -1, name: '—'},
                    ].concat(views[i].orgs.map((x, i) => ({value: i, name: x})));
            }

            if (data.length > 0)
                throw `incosistent data matrix format, unused rows: ${data.length}`;

            let defaultView = views.find(view => (view['default'] == true));

            if (defaultView == undefined)
                defaultView = views[0];

            $(canvas).data('activeView', defaultView);

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

            const orgSelectionBox = $(canvas).parent().parent().parent().find('.org-selection');

            function update()
            {
                const activeView = $(canvas).data('activeView');

                // The rendering functions are going to adjust the org and
                // matrix array. Therefore, we create a deep copy here.
                const orgsCopy = activeView.orgs.slice(0);
                const dataCopy = activeView.data.map(x => x.slice(0));

                if (+orgSelectionBox.val() >= 0)
                    visualizeSingleOrg(orgsCopy, dataCopy, +orgSelectionBox.val());
                else
                    visualizeOrgsWithTopConnections(orgsCopy, dataCopy, quota);
            }

            orgSelectionBox.change(update);

            function switchToView(view)
            {
                $(canvas).data('activeView', view);

                orgSelectionBox.empty();

                for (let i = 0; i < view.menuItems.length; i++)
                    $('<option/>').val(view.menuItems[i].value)
                        .text(view.menuItems[i].name)
                        .appendTo(orgSelectionBox);

                update();
            }

            actionBar.find('.view-switch a').click(
                function()
                {
                    $(this).parent().find('.active').removeClass('active');
                    // Replace the visible data
                    switchToView(views[$(this).data('view-id')]);
                    // Trigger an update
                    update();
                    $(this).addClass('active');

                    return false;
                });

            switchToView(defaultView);
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}
