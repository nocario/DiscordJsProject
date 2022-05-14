const {concatGuildsOnlineMember} = require('../banForbiddenGames');
const assert = require('chai').assert;


describe('concatGuildsOnlineMember', ()=> {
    it('should return the same array with only one map collection', function () {
        const testArray = ['this', 'is', 'a', 'test'];
        const map = new Map([
            ["test1", 'this'],
            ["test2", 'is'],
            ["test3", 'a'],
            ["test", 'test']]
        );
        assert.deepEqual(concatGuildsOnlineMember([map]), testArray);
    });
    it('should return the same when multiple map collection', function () {
        const testArray = ['this', 'is', 'a', 'test'];
        const map1 = new Map([
            ["test1", 'this']]
        );
        const map2 = new Map([
            ["test2", 'is'],
        ])
        const map3 = new Map([
            ["test3", 'a'],
        ])
        const map4 = new Map([
            ["test2", 'test'],
        ])
        assert.deepEqual(concatGuildsOnlineMember([map1, map2,map3, map4]), testArray);
    });
})