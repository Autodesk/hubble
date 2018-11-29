class GitVersionsDatabase
{
    // This is a singleton class to avoid loading the Git versions database multiple times
    constructor()
    {
        if (GitVersionsDatabase._instance)
            return GitVersionsDatabase._instance;

        GitVersionsDatabase._instance = this;
    }

    load(callback, customDataURL = undefined)
    {
        // If the data has already been collected, immediately return it
        if (this.data != undefined)
        {
            callback(null, this.data);
            return;
        }

        const dataURL = (customDataURL != undefined) ? customDataURL : GitVersionsDatabase.dataURL;

        // Attempt to retrieve the data from the online source first
        d3.queue()
            .defer(d3.json, dataURL)
            .await((error, data) => this._handleData(callback, error, data));
    }

    _handleData(callback, error, data)
    {
        if (error)
            throw 'could not load Git versions database';

        const isSchemaSupported = ('schemaVersion' in data && +data.schemaVersion == 1);

        if (!isSchemaSupported)
            throw 'Git versions database schema unsupported, please migrate data repository';

        this.data = data;
        this._flagGitVersions(this.data);

        // Return the data asynchronously
        callback(null, this.data);
    }

    // Flag Git versions as vulnerable or outdated
    _flagGitVersions(data)
    {
        let gitReleases = data.gitVersions.releases;
        const vulnerabilities = data.gitVersions.vulnerabilities;

        // Turn all dates into actual Date objects
        for (const version in gitReleases)
            gitReleases[version].publishedOn = new Date(gitReleases[version].publishedOn);

        // Flag all outdated Git versions
        for (const version in gitReleases)
        {
            const gitRelease = gitReleases[version];
            const versionComponents = version.split('.');
            const versionMajor = +versionComponents[0];
            const versionMinor = +versionComponents[1];
            const versionPatch = +versionComponents[2];

            if (versionPatch == 0)
                continue;

            const directPredecessorVersion =
                versionMajor + '.' + versionMinor + '.' + (versionPatch - 1);

            if (directPredecessorVersion in gitReleases)
            {
                gitReleases[directPredecessorVersion].outdatedSince = gitRelease.publishedOn;
                gitReleases[directPredecessorVersion].outdatedBy = version;
            }
        }

        // Flag all vulnerable Git versions
        for (const key in vulnerabilities)
        {
            let vulnerability = vulnerabilities[key];
            vulnerability.publishedOn = new Date(vulnerability.publishedOn);

            for (const key in vulnerability.affectedVersions)
            {
                const affectedVersionsRequirement = vulnerability.affectedVersions[key];

                const affectedVersions = Object.keys(gitReleases).filter(
                    version => satisfiesVersionRequirement(version, affectedVersionsRequirement));

                for (const key in affectedVersions)
                {
                    const affectedVersion = affectedVersions[key];
                    let affectedRelease = gitReleases[affectedVersion];

                    if ('vulnerableSince' in affectedRelease
                        && affectedRelease.vulnerableSince < vulnerability.publishedOn)
                    {
                        continue;
                    }

                    affectedRelease.vulnerableSince = vulnerability.publishedOn;
                    affectedRelease.vulnerableBy = vulnerability.issue;
                }
            }
        }
    }
}

GitVersionsDatabase.dataURL = '{{ site.baseurl }}/assets/js/git-versions.json';
