function gheHostname()
{
    return $(location).prop('hostname').replace(/^(pages\.)/, '');
}

function gheUrl()
{
    return $(location).prop('protocol') + '//' + gheHostname();
}
