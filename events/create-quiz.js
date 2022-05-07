const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');


let MATCHER = /^([^\n]+)([^,]+,[^,]+,[^,\n]{2})(\n){0}/g

let results = [];

const createQuiz = async (robot, message)  => {

    message.channel.send({embeds: [createEmbed_()]});

    const filter = message => R.lt(numberOfLines(message.content), 3) && !message.author.bot;

    const collector = await message.channel.createMessageCollector( {filter});

    for await (const msg of collector) {
        R.cond([
            [R.equals('-end'), () => message.reply('To finalize, please send -name following the name for your quiz:')],
            [R.includes('-name'), (input) => quiz(input, collector)],
            [R.test(MATCHER), (input) => addQuestion(input)],
            [R.T, () => message.reply('There is something wrong... (°.°)')],
        ])(msg.content);
        message.reply(`Question n°${results.length + 1} added, write another one or stop with -stop.`);
    }
}


const createJson = (quiz) => {
    fs.writeFile('quiz.json', JSON.stringify([quiz],null,2),
        function(err, result) {
            if(err) console.log('error', err);
            else console.log('Quiz saved! :)')
    });
}

const quiz = (input, collector) => {
    createJson(R.zipObj(
        ['quiz_name', 'results'],
        [R.trim(R.replace('-name', ' ', input)), results])
    );
    collector.stop();
}

const addQuestion = (input) => {
    results.push(question(R.map(R.trim, R.split('\n', input))));
}

const numberOfLines = (lines) => { return [...lines].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0);}

const lines = (input) => R.map(R.trim, R.split('\n', input));

const question = (lines) => {
    return R.map(
        R.assoc('incorrect_answers',  R.split(',', R.last(lines))),
        R.zipObj(['question', 'correct_answer', 'incorrect_answers']))(lines);
    //return result(lines);
}

const createEmbed_ = () => {
    return new MessageEmbed()
        .setTitle('✨Quiz Generator✨')
        .setColor('YELLOW')
        .setFooter({text : 'To stop, use the command -stop.'})
        .setDescription(
            'Welcome to the !c command. To create your quiz you need to send ' +
            'the text in a multiline format following the next pattern: ' +'\n'+
            '\n' + 'Question?' +
            '\n' + 'Correct answer' +
            '\n' + 'Incorrect answers, separated by commas (3 max)' +'\n'+
            '\n' + 'Example:' +
            '\n' + 'Which language is out of place?'  +
            '\n' + 'HTML' +
            '\n' + 'Java, C++, JavaScript'
        );
}

module.exports = {createQuiz};