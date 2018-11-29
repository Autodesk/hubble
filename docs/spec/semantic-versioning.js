/* global
    compareVersions,
    satisfiesVersionRequirement,
*/

describe('semantic versioning utilities', function()
{
    it('should compare semantic versions as specified', function()
    {
        expect(compareVersions('9', '10')).toEqual(-1);
        expect(compareVersions('0.9', '0.10')).toEqual(-1);
        expect(compareVersions('9.3', '10.2')).toEqual(-1);
        expect(compareVersions('0.0.9', '0.0.10')).toEqual(-1);
        expect(compareVersions('0.9.4', '0.10.3')).toEqual(-1);
        expect(compareVersions('9.4.5', '10.3.4')).toEqual(-1);
        expect(compareVersions('0.0.0.9', '0.0.0.10')).toEqual(-1);
        expect(compareVersions('0.0.9.8', '0.0.10.7')).toEqual(-1);
        expect(compareVersions('0.9.8.7', '0.10.7.6')).toEqual(-1);
        expect(compareVersions('9.8.7.6', '10.7.6.5')).toEqual(-1);

        expect(compareVersions('10', '9')).toEqual(1);
        expect(compareVersions('0.10', '0.9')).toEqual(1);
        expect(compareVersions('10.2', '9.3')).toEqual(1);
        expect(compareVersions('0.0.10', '0.0.9')).toEqual(1);
        expect(compareVersions('0.10.3', '0.9.4')).toEqual(1);
        expect(compareVersions('10.3.4', '9.4.5')).toEqual(1);
        expect(compareVersions('0.0.0.10', '0.0.0.9')).toEqual(1);
        expect(compareVersions('0.0.10.7', '0.0.9.8')).toEqual(1);
        expect(compareVersions('0.10.7.6', '0.9.8.7')).toEqual(1);
        expect(compareVersions('10.7.6.5', '9.8.7.6')).toEqual(1);

        expect(compareVersions('0.1.2.3', '0.1.2.3')).toEqual(0);
        expect(compareVersions('10.9.8.7', '10.9.8.7')).toEqual(0);

        expect(compareVersions('9', '8')).toEqual(1);
        expect(compareVersions('9', '9')).toEqual(0);
        expect(compareVersions('9', '10')).toEqual(-1);
        expect(compareVersions('9', '8.10')).toEqual(1);
        expect(compareVersions('9', '9.5')).toEqual(0);
        expect(compareVersions('9', '10.0')).toEqual(-1);
        expect(compareVersions('9', '8.10.11')).toEqual(1);
        expect(compareVersions('9', '9.4.5')).toEqual(0);
        expect(compareVersions('9', '10.2.3')).toEqual(-1);

        expect(compareVersions('9.5', '8')).toEqual(1);
        expect(compareVersions('9.5', '9')).toEqual(0);
        expect(compareVersions('9.5', '10')).toEqual(-1);
        expect(compareVersions('9.5', '8.10')).toEqual(1);
        expect(compareVersions('9.5', '9.4')).toEqual(1);
        expect(compareVersions('9.5', '9.5')).toEqual(0);
        expect(compareVersions('9.5', '9.6')).toEqual(-1);
        expect(compareVersions('9.5', '10.4')).toEqual(-1);
        expect(compareVersions('9.5', '8.4.5')).toEqual(1);
        expect(compareVersions('9.5', '9.4.5')).toEqual(1);
        expect(compareVersions('9.5', '9.5.3')).toEqual(0);
        expect(compareVersions('9.5', '9.6.5')).toEqual(-1);
        expect(compareVersions('9.5', '10.4.5')).toEqual(-1);

        expect(compareVersions('9.5.5', '8')).toEqual(1);
        expect(compareVersions('9.5.5', '9')).toEqual(0);
        expect(compareVersions('9.5.5', '10')).toEqual(-1);
        expect(compareVersions('9.5.5', '8.10')).toEqual(1);
        expect(compareVersions('9.5.5', '9.4')).toEqual(1);
        expect(compareVersions('9.5.5', '9.5')).toEqual(0);
        expect(compareVersions('9.5.5', '9.6')).toEqual(-1);
        expect(compareVersions('9.5.5', '10.4')).toEqual(-1);
        expect(compareVersions('9.5.5', '8.4.5')).toEqual(1);
        expect(compareVersions('9.5.5', '9.4.5')).toEqual(1);
        expect(compareVersions('9.5.5', '9.5.4')).toEqual(1);
        expect(compareVersions('9.5.5', '9.5.5')).toEqual(0);
        expect(compareVersions('9.5.5', '9.5.6')).toEqual(-1);
        expect(compareVersions('9.5.5', '9.6.5')).toEqual(-1);
        expect(compareVersions('9.5.5', '10.4.5')).toEqual(-1);
    });
    it('should test semantic version requirements as expected', function()
    {
        expect(satisfiesVersionRequirement('9', '=10')).toEqual(false);
        expect(satisfiesVersionRequirement('9', '<=10')).toEqual(true);
        expect(satisfiesVersionRequirement('9', '<10')).toEqual(true);
        expect(satisfiesVersionRequirement('9', '>=10')).toEqual(false);
        expect(satisfiesVersionRequirement('9', '>10')).toEqual(false);
        expect(satisfiesVersionRequirement('9', '=9')).toEqual(true);
        expect(satisfiesVersionRequirement('9', '<=9')).toEqual(true);
        expect(satisfiesVersionRequirement('9', '<9')).toEqual(false);
        expect(satisfiesVersionRequirement('9', '>=9')).toEqual(true);
        expect(satisfiesVersionRequirement('9', '>9')).toEqual(false);
        expect(satisfiesVersionRequirement('10', '=9')).toEqual(false);
        expect(satisfiesVersionRequirement('10', '<=9')).toEqual(false);
        expect(satisfiesVersionRequirement('10', '<9')).toEqual(false);
        expect(satisfiesVersionRequirement('10', '>=9')).toEqual(true);
        expect(satisfiesVersionRequirement('10', '>9')).toEqual(true);

        expect(satisfiesVersionRequirement('9.5.4', '=10.4.3')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '<=10.4.3')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '<10.4.3')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>=10.4.3')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>10.4.3')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '=9.4.3')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '<=9.4.3')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '<9.4.3')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>=9.4.3')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>9.4.3')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '=9.5.4')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '<=9.5.4')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '<9.5.4')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>=9.5.4')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>9.5.4')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '=9.6.5')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '<=9.6.5')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '<9.6.5')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>=9.6.5')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>9.6.5')).toEqual(false);
        expect(satisfiesVersionRequirement('10.5.4', '=9.5.4')).toEqual(false);
        expect(satisfiesVersionRequirement('10.5.4', '<=9.5.4')).toEqual(false);
        expect(satisfiesVersionRequirement('10.5.4', '<9.5.4')).toEqual(false);
        expect(satisfiesVersionRequirement('10.5.4', '>=9.5.4')).toEqual(true);
        expect(satisfiesVersionRequirement('10.5.4', '>9.5.4')).toEqual(true);

        expect(satisfiesVersionRequirement('9', '>=9 <10')).toEqual(true);
        expect(satisfiesVersionRequirement('9', '<10 <9')).toEqual(false);
        expect(satisfiesVersionRequirement('9', '>10 <9')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>=9.5.0 <10')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>=9.5.4 <10')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>8 <=9')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>8 <9.6')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>=9 <=9.5')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '>9 <9.5')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>9.4.4 <9.5.4')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '<10 <9')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '>10 <9')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '=9 =9.5')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '=9 =9.5.5')).toEqual(false);
        expect(satisfiesVersionRequirement('9.5.4', '=9 >=9.5 <9.6')).toEqual(true);
        expect(satisfiesVersionRequirement('9.5.4', '=9 >=9.5 <9.6 =10')).toEqual(false);
    });
    it('should expectedly fail if the syntax is incorrect', function()
    {
        // It’s necessary to use a function as the argument here, because it would be directly
        // evaluated otherwise, meaning that the thrown error wouldn’t be caught by Karma.
        expect(() => satisfiesVersionRequirement('9.5.4', '==9')).toThrow();
        expect(() => satisfiesVersionRequirement('9.5.4', '>=9 && <9.5')).toThrow();
        expect(() => satisfiesVersionRequirement('9.5.4', '>=9<9.5')).toThrow();
    });
});
