function parseVersion(versionString)
{
    const version = versionString.split('.');

    for (let i = 0; i < version.length; i++)
    {
        if (isNaN(version[i]))
            throw `invalid semantic version format: “${version}”`;

        version[i] = +version[i];
    }

    return version;
}

function compareVersions(versionAString, versionBString)
{
    const versionA = parseVersion(versionAString);
    const versionB = parseVersion(versionBString);

    const numberOfComponents = Math.min(versionA.length, versionB.length);

    for (let i = 0; i < numberOfComponents; i++)
    {
        if (versionA[i] > versionB[i])
            return 1;

        if (versionA[i] < versionB[i])
            return -1;
    }

    return 0;
}

// Tests whether a given semantic version satisfies a version requirement. A version requirements is
// a space-separated list of comparisons against versions. For instance, “<2.15” defines the
// requirement that the version be lower than 2.15, and “>=2.15 <=2.15.6” requires the version to be
// between 2.15 and 2.15.6 (both inclusive).
function satisfiesVersionRequirement(versionString, requirementString)
{
    let requirementRegEx = /^([<>=]+)(\d+(?:\.\d+)*)$/;

    const requirements = requirementString.split(' ');

    for (const requirement of requirements)
    {
        const match = requirementRegEx.exec(requirement);

        if (match.length != 3)
            throw 'invalid semantic versioning requirement format';

        const operator = match[1];
        const requirementVersionString = match[2];
        const comparisonResult = compareVersions(versionString, requirementVersionString);

        switch (operator)
        {
            case '=':
                if (!(comparisonResult == 0))
                    return false;
                break;
            case '<':
                if (!(comparisonResult < 0))
                    return false;
                break;
            case '<=':
                if (!(comparisonResult <= 0))
                    return false;
                break;
            case '>':
                if (!(comparisonResult > 0))
                    return false;
                break;
            case '>=':
                if (!(comparisonResult >= 0))
                    return false;
                break;
            default:
                throw 'invalid comparison operator “' + operator + '”';
        }
    }

    return true;
}
