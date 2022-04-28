const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');
const wait = require('node:timers/promises').setTimeout

async function test(robot, message) {
    const response = await fetch('https://opentdb.com/api.php?amount=8&category=10&type=boolean');
    const data = await response.json();

    let length = data.results.length;

    let randomNumber = Math.floor(Math.random() * length);
    let randomQuestion = data.results[randomNumber];
    let question = randomQuestion.question;
    let correctAnswer = randomQuestion.correct_answer;


    message.channel.send(question);



    const filter = m => m.author.id === message.author.id;
    const answer = await message.channel.awaitMessages(filter,
        {maxMatches: 1, time: 10000,  errors: ['time', 'maxMatches']});
    console.log(answer);

    const ans = answer.first();


    if(ans.content.toLowerCase() === correctAnswer.toLowerCase())
    {
        message.channel.send('You got the question right');
    } else {
        message.channel.send('That is incorrect');
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
        name: 'test',
        out: test,
        about: 'test  command'
    },
    {
        name: 'quiz',
        out: quiz,
        about: 'quiz  command!'
    }
]

module.exports.comms = commands_list;