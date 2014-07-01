var cut = require('../tasks/lib/ObjectsStructureComparator');
var expect = require('chai').expect;

describe('Comparator of objects structures', function () {

    it('should get a difference of two sets of keys', function () {
        //given
        var firstSet = ['a', 'b' , 'c'];
        var secondSet = ['a', 'd' , 'e'];
        var expectedDifference = [
            ['b'] ,
            ['c']
        ];

        //when
        var actualDifference = cut._getDifferenceBetweenKeysSets(firstSet, secondSet, []);

        //then
        expect(actualDifference).to.deep.equal(expectedDifference);
    });

    it('should get a difference of two sets of keys with given path', function () {
        //given
        var path = ['a'];
        var firstSet = ['b', 'c'];
        var secondSet = ['b'];
        var expectedDifference = [
            ['a', 'c']
        ];

        //when
        var actualDifference = cut._getDifferenceBetweenKeysSets(firstSet, secondSet, path);

        //then
        expect(actualDifference).to.deep.equal(expectedDifference);
    });

    it('should prepare results container', function () {
        //given
        var objectsToCompare = [
            {id: "id1", value: {}},
            {id: "id2", value: {}}
        ];
        var expectedResult = {
            "id1": [],
            "id2": []
        };

        //when
        var actualResults = cut._prepareResultsContainer(objectsToCompare);

        //then
        expect(actualResults).to.deep.equal(expectedResult);
    });

    it('should find a difference in objects structures', function () {
        //given
        var firstObj = {
            id: "id1",
            value: {
                'a': {
                    b: '1',
                    c: '2'
                },
                e: {
                    f: '3'
                }
            }};

        var secondObj = {
            id: "id2",
            value: {
                'a': {
                    b: '1',
                    d: '2'
                }
            }};

        //when
        var difference = cut._compareAndGetMissingKeys([firstObj, secondObj]);

        //then
        expect(difference[firstObj.id]).to.deep.equal([
            ['a', 'd']
        ]);
        expect(difference[secondObj.id]).to.deep.equal([
            ['e'],
            ['a', 'c']
        ]);
    });

    it('should find a difference in objects structures when for a given key the ' +
        'first object contains another object and the second one contains a string', function () {
        //given
        var firstObj = {
            id: "id1",
            value: {
                'a': {
                    b: '1'
                },
                c: {
                    d: '2',
                    e: '3'
                }
            }};

        var secondObj = {
            id: "id2",
            value: {
                'a': {
                    b: '1'
                },
                c: "2"
            }};

        //when
        var difference = cut._compareAndGetMissingKeys([firstObj, secondObj]);

        //then
        expect(difference[firstObj.id]).to.deep.equal([]);
        expect(difference[secondObj.id]).to.deep.equal([
            ['c', 'd'],
            ['c', 'e'],
        ]);
    });

    it('should compare structures of input objects and return the missing keys with paths concatenated with the delimiter', function () {
        //given
        var delimiter = "->";
        var firstObj = {
            id: "id1",
            value: {
                'a': {
                    b: '1'
                }
            }};

        var secondObj = {
            id: "id2",
            value: {
                'a': {
                    b: '2'
                }
            }};

        var thirdObj = {
            id: "id3",
            value: {
                'a': {

                }
            }};

        //when
        var difference = cut.compareObjects([firstObj, secondObj, thirdObj], delimiter);

        //then
        expect(difference[thirdObj.id]).to.deep.equal([
            'a->b'
        ]);
    });

    it('should compare JSON input files', function () {
        //given
        var location = '../../test/fixtures/';
        var ids = ['first', 'second', 'third'];
        var pathSeparator = "->";
        var expectedResults = {
            'second': ['a->b', 'd->e->f', 'g->h'],
            'third': ['g']
        };

        //when
        var actualResults = cut.compareFiles(location, ids, pathSeparator);

        //then
        expect(actualResults).to.deep.equal(expectedResults);
    });

});

