/* global
    GitVersionsDatabase,
    RecommendedGitVersionsChart,
*/

describe('Recommended Git versions chart', function()
{
    it('should count recommended, oudated, and vulnerable versions correctly', function(done)
    {
        const dataURL = '/base/demo-data/git-versions-new.tsv';
        const gitVersionsDataURL = '/base/assets/js/git-versions.json';
        const gitVersionsDatabase = new GitVersionsDatabase();

        let canvas = $('<canvas data-type="recommended-git-versions"></canvas>')[0];
        $('body').append(canvas);
        let actionBar = $('<div id=\'test\'></div>')[0];
        $('body').append(actionBar);

        d3.queue()
            .defer(d3.tsv, dataURL)
            .defer(callback => gitVersionsDatabase.load(callback, gitVersionsDataURL))
            .await(
                (error, data, gitVersionsData) =>
                {
                    expect(error).toBe(null);

                    const recommendedGitVersionsChart = new RecommendedGitVersionsChart(canvas, actionBar);
                    const chartData = recommendedGitVersionsChart._computeChartData(data, gitVersionsData);

                    expect(chartData[287].date).toEqual(new Date('2018-03-19'));
                    expect(chartData[287].vulnerable).toEqual(200);
                    expect(chartData[287].outdated).toEqual(188);
                    expect(chartData[287].recommended).toEqual(60);

                    expect(chartData[84].date).toEqual(new Date('2018-10-08'));
                    expect(chartData[84].vulnerable).toEqual(657);
                    expect(chartData[84].outdated).toEqual(0);
                    expect(chartData[84].recommended).toEqual(51);

                    expect(chartData[21].date).toEqual(new Date('2018-12-10'));
                    expect(chartData[21].vulnerable).toEqual(713);
                    expect(chartData[21].outdated).toEqual(146);
                    expect(chartData[21].recommended).toEqual(178);

                    done();
                });

        canvas.remove();
        actionBar.remove();
    });
});
