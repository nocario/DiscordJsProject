const {MessageEmbed} = require('discord.js');
const data = require('../quiz.json');
const fs = require('node:fs');
const R = require('ramda');
const shuffle = require('shuffle-array');
const wait = require('node:timers/promises').setTimeout;

//---------------------------------------------------------------------------------------------------------------------
const QUESTION_INTERVAL = 10000;
const TIME_MAX = 10000;
const reactions = ['💛', '💚', '💙', '💜'];

const dataSelected = R.find(R.propEq('quiz_name', 'antoine c:'))(data);
const results = R.prop('results', dataSelected);
//---------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (robot, message) => R.forEach(async (result) => {

    let usersWithCorrectAnswer = [];

    const correctAnswer =  R.prop('correct_answer', result);
    const incorrectAnswers = R.prop('incorrect_answers', result);
    const choices = shuffle(R.concat(incorrectAnswers, [correctAnswer]));

    const messageEmbed = await description(choices)(result, message);

    R.pipe(
        compose(addReactions)(messageEmbed),
        compose(
            collectorOn(usersWithCorrectAnswer),
            collectorEnd(usersWithCorrectAnswer, correctAnswer, message))
        (collector(messageEmbed, correctAnswer, choices)),
    );
    await wait(QUESTION_INTERVAL);
    }, results
);
//---------------------------------------------------------------------------------------------------------------------

const compose = (...funcs) => initialArg => funcs.reduce((acc, func) => func(acc), initialArg);

const correctAnswerEmoji = (correctAnswer, choices) => R.nth(R.indexOf(correctAnswer, choices))(reactions);

const addReactions = (embed) => R.forEach((reaction) => { embed.react(reaction); }, reactions);

const createQuestionDescription = (options, list) => {
    options.forEach((option, index) => {
        list.push(`\n${R.nth(index, reactions)} ${option}\n`)
    }); return R.join(' ', list);
}

const createQuestionEmbed = (description) => (results, message) => {
    let embed = createEmbed_(`\n✨ ${R.prop('question', results)} ✨ \n`, description);
    return message.channel.send({embeds: [embed]})
}

const createEmbed_ = (title, description) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor('YELLOW')
        .setDescription(description);
}

const description = (choices) => createQuestionEmbed(createQuestionDescription(choices,[]));

const getFilter = (answer) => (reaction, user) => { return (reaction.emoji.name === answer) && !user.bot;};

const getCollector = (embed) => (filter) => { return embed.createReactionCollector({filter, time: TIME_MAX});}

const collector = (embed, answer, choices) => getCollector(embed)(getFilter(correctAnswerEmoji(answer, choices)));

const collectorOn = (list) => (collector) => collector.on('collect', (reaction, user) => {
    list.push(user.username);
    console.log(user.username);
}); //R.append(user.username, usersWithCorrectAnswer) => doesnt work, check later why

const collectorEnd = (list, answer, message) => (collector) => collector.on('end', async () => {
    const result = R.ifElse(
        R.isEmpty,
        R.always(createEmbed_('Time\'s Up! No one got it.... 🦉', `\n The correct answer was ${answer}`)),
        R.always(createEmbed_('Great! Here\'s who got it first 🍒:',
            `${R.join(', ', list)} \n The correct answer was ${answer}`
        ))
    );
    message.channel.send({embeds: [result(list)]});
});

//---------------------------------------------------------------------------------------------------------------------

module.exports = {launchQuiz};

