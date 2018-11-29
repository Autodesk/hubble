/* global
    GitVersionsDatabase,
*/

describe('Git versions database', function()
{
    it('should detect oudated and vulnerable versions correctly', function(done)
    {
        const dataURL = '/base/assets/js/git-versions.json';
        const gitVersionsDatabase = new GitVersionsDatabase();

        d3.queue()
            .defer(callback => gitVersionsDatabase.load(callback, dataURL))
            .await(
                (error, gitVersionsData) =>
                {
                    expect(error).toBe(null);

                    const gitReleases = gitVersionsData.gitVersions.releases;
                    expect(gitReleases['2.16.2'].outdatedSince).toEqual(new Date('2018-03-22'));
                    expect(gitReleases['2.18.0'].outdatedSince).toEqual(new Date('2018-09-27'));
                    expect(gitReleases['2.16.2'].vulnerableSince).toEqual(new Date('2018-05-30'));
                    expect(gitReleases['2.18.0'].vulnerableSince).toEqual(new Date('2018-10-06'));

                    done();
                });
    });
});
