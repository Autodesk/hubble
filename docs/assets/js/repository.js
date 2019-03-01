$(window).bind('load', function()
{
    const queryString = new URLSearchParams(location.search);
    const nwo = queryString.get('nwo');

    $('h1.project-name').text(`${nwo} Metrics`);
    
    // fade header link in after the repository name has been set, otherwise the icon jumps around while the page is loading
    $('a.header-link').css("display", "inline-flex").hide().fadeIn('fast');

    // Add nwo query string to all navigation links
    $('.navigation a').each(function()
    {
        const href = $(this).attr('href');
        const noNwoQuery = $(this).attr('data-no-nwo-query')

        if (noNwoQuery === undefined) {
            $(this).attr('href', `${href}?nwo=${nwo}`);
        }
    });

    // Replace all canvas data urls with repository specific urls
    $('[data-url]').each(function()
    {
        const dataUrl = $(this).attr('data-url');
        $(this).attr('data-url', dataUrl.replace('/repository', `/repository/${nwo}`));
    });
});