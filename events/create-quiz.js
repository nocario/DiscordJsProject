const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');

const createQuiz = async (robot, message)  => {

    let quiz = [];

    const embed = new MessageEmbed() // on peut également definir le temps de reponse
        .setTitle('✨Quiz Generator✨')
        .setColor('YELLOW')
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

    message.channel.send({embeds: [embed]});

    const filter = message => !message.author.bot;
    const collector = await message.channel.createMessageCollector( {filter});


    for await (const msg of collector) {
        if (msg.content.toLowerCase() === '-stop') {
            collector.stop();
        }
        else {
            const lines = R.map(
                R.trim,
                R.split('\n', msg.content));

            quiz.push({
                'question': lines[0],
                'correct_answer': lines[1],
                'incorrect_answers': R.split(',', lines[2])
            });
            message.reply(`Question n°${quiz.length} added. Write another one or stop with -stop.`);
        }
     }

    console.log(quiz);

    fs.writeFile('quiz.json', JSON.stringify(quiz,null,2),
        function(err, result) {
        if(err) console.log('error', err);
    });

    `
    message.channel
            .send({embeds: [embed]})
            .then(() => {
            })
            .then(() => {
                return message.channel.awaitMessages({time: 60000 * 2, max: 1});
            })
            .then((collected) => {
                const lines = R.map(
                    R.trim,
                    R.split('\n', collected.first().content));

                quiz.push({
                    'question': lines[0],
                    'correct_answer': lines[1],
                    'incorrect_answers': R.split(',', lines[2])
                })
            });
    `
}

module.exports = {createQuiz};
