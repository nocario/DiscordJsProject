const {MessageEmbed} = require('discord.js');
const data = require('../quiz.json');
const fs = require('node:fs');
const R = require('ramda');
const shuffle = require('shuffle-array');
const wait = require('node:timers/promises').setTimeout;


const QUESTION_INTERVAL = 15000;
const TIME_MAX = 10000;
const reactions = ['💛', '💚', '💙', '💜'];



const launchQuiz = async (robot, message)   => {

    let dataSelected = data.find(el => el.quiz_name === 'test');

    let results = R.prop('results', dataSelected);

    const main = async (results) => {

        let usersWithCorrectAnswer = [];

        let correctAnswer = R.prop('correct_answer', results);
        let incorrectAnswers = R.prop('incorrect_answers', results);

        let choices = shuffle(R.concat(incorrectAnswers, [correctAnswer]));

        let messageEmbed = await createQuestionEmbed(
            createQuestionDescription(choices, reactions,[]))
            (R.prop('question', results), message);

        const collector = getCollector(messageEmbed)(getFilter(
            getCorrectAnswer(correctAnswer, choices)(reactions))
        );

        R.pipe(
            addReactions(messageEmbed, reactions),
            collectorOn(collector, usersWithCorrectAnswer),
            collectorEnd(collector, usersWithCorrectAnswer, correctAnswer, message),
            await wait(QUESTION_INTERVAL)
        );
    }

    R.forEach(main, results);

}

const createEmbed_ = (title, description) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor('YELLOW')
        .setDescription(description);
};


const createReactions = (embed, reactions) => R.forEach((reaction) => { embed.react(reaction); }, reactions);

const addReactions = (embed) => createReactions(embed, reactions);

const getCorrectAnswer = (correctAnswer, choices) => R.nth(R.indexOf(correctAnswer, choices));

const createQuestionDescription = (options, reactions, list) => {
    options.forEach((option, index) => { list.push(`\n${R.nth(index, reactions)} ${option}\n`)});
    return R.join(' ', list);
}
const createQuestionEmbed = (description) => (question, message) => {
    let embed = createEmbed_(`\n✨ ${question} ✨ \n`, description);
    return message.channel.send({embeds: [embed]})
}

const getFilter = (answer) => (reaction, user) => { return (reaction.emoji.name === answer) && !user.bot;};

const getCollector = (embed) => (filter) => { return embed.createReactionCollector({filter, time: TIME_MAX});}


// getCollector(messageEmbed, getFilter(correctAnswerEmoji))

const collectorOn = (collector, list) => collector.on('collect', (reaction, user) => { list.push(user.username);})
//R.append(user.username, usersWithCorrectAnswer) => doesnt work, check later why



const collectorEnd = (collector, list, answer, message) => collector.on('end', async () => {
    const result = R.ifElse(
        R.isEmpty,
        R.always(createEmbed_('Time\'s Up! No one got it.... 🦉', `\n The correct answer was ${answer}`)),
        R.always(createEmbed_('Great! Here\'s who got it first 🍒:',
            `${R.join(', ', list)} \n The correct answer was ${answer}`
        ))
    );
    message.channel.send({embeds: [result(list)]});
});

module.exports = {launchQuiz};

