const assert = require('chai').assert;
const { zipQuestion, createEmbed_ } = require('../events/create-quiz');
const { MessageEmbed } = require('discord.js');

describe('zipQuestion test', () => {
    it('should return the same object', function () {
        const testObject = {question:1, correct_answer:2, incorrect_answers:3};
        assert.deepEqual(zipQuestion(1,2,3), testObject);
    });
})

describe('createEmbed test',() => {
    it('should return the same object', function () {
        const embedTest = new MessageEmbed().setTitle('test title').setColor('YELLOW').setDescription('test description');
        assert.deepEqual(createEmbed_('test title', 'test description'), embedTest);
    });
})