const assert = require('chai').assert;
const {checkUwU} = require('../banUwU');

describe('CheckUwU test', ()=> {
    it('should return true', () => {
        const testOject = {content: "msg uwu"};
        assert.equal(checkUwU(testOject), true);
    });
    it('should return false', () => {
        const testObject = {content: 'normal message'};
        assert.equal(checkUwU(testObject), false);
    });
    it('should return bool type', () => {
        const testObject = {content: 'normal message'};
        assert.typeOf(checkUwU(testObject), 'boolean');
    })
})