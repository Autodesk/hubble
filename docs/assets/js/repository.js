$(window).bind('load', function()
{
    const queryString = new URLSearchParams(location.search);
    const nwo = queryString.get('nwo');

    $('.navigation a').each(function()
    {
        let href = $(this).attr('href');
        $(this).attr('href', `${href}?nwo=${nwo}`);
    });
});