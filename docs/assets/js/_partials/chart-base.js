function hasConfig(element, key)
{
    return element.data('config') && (key in element.data('config'));
}

function readConfig(element, key)
{
    if (!hasConfig(element, key))
        return undefined;

    return element.data('config')[key];
}
