function compareVersions(versionA, versionB)
{
    const versionAComponents = versionA.split('.');
    const versionBComponents = versionB.split('.');

    const numberOfComponents = Math.min(versionAComponents.length, versionBComponents.length);

    for (let i = 0; i < numberOfComponents; i++)
    {
        let componentA = +versionAComponents[i];
        let componentB = +versionBComponents[i];

        if (componentA > componentB)
            return 1;

        if (componentB > componentA)
            return -1;
    }

    return 0;
}

// Determines whether versionB has a more recent patch level despite
// being on the same minor version as versionA.
// For example, version 2.3.4 is patched by 2.3.6 and 2.3.10 but neither
// by 1.5.0, 2.2.10, 2.3.3, 2.3.4, nor 2.4.1.
function isPatchedBy(versionA, versionB)
{
    const versionAComponents = versionA.split('.');
    const versionBComponents = versionB.split('.');

    if (min(versionAComponents.length, versionBComponents.length) < 3)
        throw "invalid semantic versioning format";

    if (versionAComponents[0] != versionBComponents[0]
        || versionAComponents[1] != versionBComponents[1])
    {
        return false;
    }

    return (compareVersions(versionA, versionB) < 0);
}

// TODO: document
// TODO: test
function satisfiesVersionRequirement(version, requirement)
{
    let requirementRegEx = /([<>]=?)(\d+(?:\.\d+)*)/;

    const requirements = requirement.split(' ');

    for (let i = 0; i < requirements.length; i++)
    {
        const requirement = requirements[i];
        let match = requirementRegEx.exec(requirement);

        if (match.length != 3)
            throw "invalid semantic versioning requirement format";

        let operator = match[1];
        let requirementVersion = match[2];

        let comparisonResult = compareVersions(version, requirementVersion);

        switch (operator)
        {
            case "<":
            {
                if (comparisonResult >= 0)
                    return false;
                break;
            }
            case "<=":
            {
                if (comparisonResult > 0)
                    return false;
                break;
            }
            case ">":
            {
                if (comparisonResult <= 0)
                    return false;
                break;
            }
            case ">=":
            {
                if (comparisonResult < 0)
                    return false;
                break;
            }
        }
    }

    return true;
}
