const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');


let results = [];

const createQuiz = async (robot, message)  => {

    const quiz_name = (input) => {
        console.log(input);
        return R.trim(R.replace('-stop', ' ', input));}


    message.channel.send({embeds: [createEmbed_()]});

    const filter = (user) => { return !user.bot;};
    const collector = await message.channel.createMessageCollector( {filter});


    for await (const msg of collector) {
        const m = msg.content;
        const n = numberOfLines(m);

        R.cond([
            [R.includes('-stop'), msg => quiz_name(msg), collector.stop()],
            [R.equals('-stop'), message.reply('To finalize, please send -stop following with the name for your quiz:')],
            [R.T, msg => addQuestion(msg),
                message.reply(`Question n°${results.length} added. Write another one or stop with -stop.`)]
        ])(m);
    }


    const quiz = R.zipObj(['quiz_name', 'results'], [quiz_name, results]);


    fs.writeFile('quiz.json', JSON.stringify([quiz],null,2),
        function(err, result) {
        if(err) console.log('error', err);
    });
}

const lines = (input) => R.map(R.trim, R.split('\n',input));

const numberOfLines = (lines) => [...lines].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0);

const addQuestion = (input) => {const result = R.map(
    R.assoc('incorrect_answers', R.split(',', R.last(lines(input)))),
    R.zipObj(['question', 'correct_answer', 'incorrect_answers']));
    results.push(result(lines(input)));
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
