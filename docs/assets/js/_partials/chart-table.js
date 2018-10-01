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
                .text(d => d);

            let displayData = data;
            const configSlice = readConfig($(table), 'slice');
            if (Array.isArray(configSlice) && configSlice.length > 1)
                displayData = data.slice(configSlice[0], configSlice[1]);

            let rows = d3.select(table)
                .append('tbody')
                .selectAll('tr')
                .data(displayData)
                .enter()
                .append('tr');

            rows.selectAll('td')
                .data(function(row)
                {
                    return d3.range(Object.keys(row).length)
                        .map((column, i) => row[Object.keys(row)[i]]);
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
                                cell.text(d);
                        }
                    }
                });
        }
    ).on('load.spinner', function()
    {
        spinner.stop();
    });
}
