const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');
const wait = require('node:timers/promises').setTimeout

async function test(robot, message) {


    let quiz = [];
    let filter = (msg) => !msg.author.bot;

    const embed = new MessageEmbed() // on peut également definir le temps de reponse
        .setTitle('Quiz generator')
        .setColor('YELLOW')
        .setDescription(
            'Welcome to the !c command. To create your quiz you need to send ' +
            'the text in a multiline format following the next pattern: ' +'\n'+
            '\n' + 'Quiz topic' +
            '\n' + 'Question?' +
            '\n' + 'Correct answer' +
            '\n' + 'Incorrect answers, separated by commas' +
            '\n' + 'True or False, for add another question' +'\n'+
            '\n' + 'Example:' +
            '\n' + 'Programming'  +
            '\n' + 'Which language is out of place?'  +
            '\n' + 'HTML' +
            '\n' + 'Java, C++, JavaScript' +
            '\n' + 'True'
        );

    let add_question = true;

    while (add_question){
        message.channel
            .send({embeds: [embed]})
            .then(() => {
                return message.channel.send(`You can write your question ${quiz.length + 1}: `);
            })
            .then(() => {
                return message.channel.awaitMessages({filter, time: 60000*2, max: 1});
            })
            .then((collected) => {
                let message = collected.first().content;
                let lines = message.trim().split('\n');
                quiz.push({
                    'topic': lines[0],
                    'question': lines[1],
                    'correct_answer': lines[2],
                    'incorrect_answers': lines[3].split(',')
                })
                console.log(quiz);
            });
    }

    console.log(quiz);

    while (add_question){
        console.log('ok');
        add_question = false;
    }
}

async function quiz(robot, message) {

    const response = await fetch('https://opentdb.com/api.php?amount=4&category=15&difficulty=medium&type=multiple');
    const data = await response.json();

    const embed = new MessageEmbed();
    let newEmbed = new MessageEmbed();

    let result;
    let usersWithCorrectAnswer = [];

    console.log(data.results.correct_answer)
    for (let i = 0; i < data.results.length; i++) {
        let choices = [`${data.results[i].correct_answer}`];
        for (let j = 0; j < 3; j++) {
            choices.push(`${data.results[i].incorrect_answers[j]}`);
        }

        embed
            .setTitle(`Question ${i + 1}`)
            .setColor('YELLOW')
            .setDescription(
                (data.results[i].question) +
                '\n' + '\n**Choices:**' + '\n' +
                '\n💛 ' + (choices[0]) + '\n' +
                '\n💚 ' + (choices[1]) + '\n' +
                '\n💙 ' + (choices[2]) + '\n' +
                '\n💜 ' + (choices[3]) + '\n' +
                '\n' + '\n**Difficulty:** ' + (data.results[i].difficulty) +
                '\n**Category:** ' + (data.results[i].category)
            );


        let reactions = ['💛', '💚', '💙', '💜'];
        let msgEmbed = await message.channel.send({embeds: [embed]});

        reactions.forEach((reaction) => msgEmbed.react(reaction));

        let answer = '';

        if (data.results[i].correct_answer === choices[0]) { // TODO : improve method
            answer = '💛';
        } else if (data.results[i].correct_answer === choices[1]) {
            answer = '💚';
        } else if (data.results[i].correct_answer === choices[2]) {
            answer = '💙';
        } else {
            answer = '💜';
        }

        const filter = (reaction, user) => {
            return (reaction.emoji.name === answer) && !user.bot;
        };


        const collector = msgEmbed.createReactionCollector({filter, time: 30000});

        collector.on('collect', (reaction, user) => {
            usersWithCorrectAnswer.push(user.username);
            console.log(usersWithCorrectAnswer);
        });


        collector.on('end', async () => {
            if (usersWithCorrectAnswer.length === 0) {
                result = newEmbed
                    .setTitle("Time's Up! No one got it....")
                    .setDescription('\n The correct answer was ' + (data.results[i].correct_answer))
                    .setColor('YELLOW');
                message.channel.send({embeds: [result]});

            } else {
                result = newEmbed
                    .setTitle("That's IT! Here's who got it first:")
                    .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                    .setFooter('\n The correct answer was ' + data.results[i].correct_answer)
                    .setColor('YELLOW');
                message.channel.send({embeds: [result]});

            }
        });
        await wait(30000);
    }
}



let commands_list = [{
        name: 't',
        out: test,
        about: 'test  command'
    },
    {
        name: 'q',
        out: quiz,
        about: 'quiz  command!'
    }
]

module.exports.comms = commands_list;