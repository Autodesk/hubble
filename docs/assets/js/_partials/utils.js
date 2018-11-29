function deepCopyArray(array)
{
    return jQuery.extend(true, [], array);
}

function deepCopyObject(object)
{
    return jQuery.extend(true, {}, object);
}
