const {MessageEmbed} = require('discord.js');
const data = require('../quiz.json');
const fs = require('node:fs');
const R = require('ramda');
const wait = require('node:timers/promises').setTimeout


const launchQuiz = async (robot, message)   => {

    for (let i = 0; i < data.length; i++) {
        let choices = [`${data[i].correct_answer}`];
        for (let j = 0; j < 3; j++) {
            choices.push(`${data[i].incorrect_answers[j]}`);
        }

        let result;
        let usersWithCorrectAnswer = [];
        let newEmbed = new MessageEmbed();

        const embed = new MessageEmbed()
            .setTitle('✨' + data[i].question + '✨')
            .setColor('YELLOW')
            .setDescription(+ '\n' +
                '\n💛 ' + (choices[0]) + '\n' +
                '\n💚 ' + (choices[1]) + '\n' +
                '\n💙 ' + (choices[2]) + '\n' +
                '\n💜 ' + (choices[3]) + '\n'
            );

            let reactions = ['💛', '💚', '💙', '💜'];
            let msgEmbed = await message.channel.send({embeds: [embed]});

            reactions.forEach((reaction) => msgEmbed.react(reaction));

            let answer = '';

            if (data[i].correct_answer === choices[0]) { // TODO : improve method
                answer = '💛';
            } else if (data[i].correct_answer === choices[1]) {
                answer = '💚';
            } else if (data[i].correct_answer === choices[2]) {
                answer = '💙';
            } else {
                answer = '💜';
            }

            const filter = (reaction, user) => {
                return (reaction.emoji.name === answer) && !user.bot;
            };

            const collector = msgEmbed.createReactionCollector({filter, time: 15000});

            collector.on('collect', (reaction, user) => {
                usersWithCorrectAnswer.push(user.username);
                console.log(usersWithCorrectAnswer);
            })

            collector.on('end', async () => {
                if (usersWithCorrectAnswer.length === 0) {
                    result = newEmbed
                        .setTitle("Time's Up! No one got it.... 🦉🦦")
                        .setDescription('\n The correct answer was ' + (data[i].correct_answer))
                        .setColor('YELLOW');
                    message.channel.send({embeds: [result]});

                } else {
                    result = newEmbed
                        .setTitle("Great! Here's who got it first 🍒:")
                        .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                        .setFooter('\n The correct answer was ' + data[i].correct_answer)
                        .setColor('YELLOW');
                    message.channel.send({embeds: [result]});

                }
            });
            await wait(15000);
    }
}

module.exports = {launchQuiz};
