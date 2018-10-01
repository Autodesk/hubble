function createSpinner(canvas)
{
    let parent = $('<div style="position:absolute;height:100%;width:100%;" class="spinner-container"></div>');
    parent.insertBefore($(canvas));

    let spinner = new Spinner().spin(parent[0]);

    return {
        stop: function()
        {
            spinner.stop();
            parent.remove();
        }
    };
}
