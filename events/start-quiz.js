const shuffle = require('shuffle-array');
const R = require('ramda');
const {MessageEmbed} = require("discord.js");
const wait = require('node:timers/promises').setTimeout;
const {fetchLowestScoringPlayer} = require('../ban-quiz');

//----------------------------------------------------------------------------------------------------------------------
const QUESTION_INTERVAL = 15000;
const TIME_MAX = 10000;
let participants = {};
const reactions = [ '💛', '💚', '💙', '💜' ];
//----------------------------------------------------------------------------------------------------------------------

const diff = (a,b) => {return a[1] - b[1]};
const getLowestScoringPlayer = R.pipe(R.toPairs, R.sort(diff), R.head, R.head);

//----------------------------------------------------------------------------------------------------------------------
const startQuiz = async (interaction, results) => {

    for (const result of results) {
        let usersWithCorrectAnswer = [];

        const correctAnswer = R.prop('correct_answer', result);
        const incorrectAnswers = R.prop('incorrect_answers', result);
        const choices = shuffle(R.concat(incorrectAnswers, [correctAnswer]));

        const messageEmbed = await description(choices)(result, interaction);

        R.pipe(
            compose(addReactions)(messageEmbed),
            compose(
                collectorOn(usersWithCorrectAnswer, correctAnswerEmoji(correctAnswer, choices)),
                collectorEnd(usersWithCorrectAnswer, correctAnswer, interaction))(collector(messageEmbed)
            ),
            await wait(QUESTION_INTERVAL),
        );
    }

    checkIfMoreThanOnePlayer(interaction, participants);


    const getUsersListScore = R.pipe(R.toPairs, R.map(fetchUserUsername(interaction)), R.bind(Promise.all, Promise));

    const embed = createEmbed_('Score', `${await getUsersListScore(participants)}`);
    await sendEmbed(embed, interaction);

    participants = R.empty(participants)
}
//----------------------------------------------------------------------------------------------------------------------

const checkIfMoreThanOnePlayer = (interaction, participants) => R.ifElse(
    R.pipe(R.keys, R.length, R.lte(2)),
    R.pipe(getLowestScoringPlayer, R.curry(fetchLowestScoringPlayer)(interaction)),
    R.always(false)
)(participants);

const fetchUserUsername = (interaction) => async (list) => `${await interaction.guild.members.fetch(list[0])}: ${list[1]}\n`




//----------------------------------------------------------------------------------------------------------------------

const compose = (...funcs) => initialArg => funcs.reduce((acc, func) => func(acc), initialArg);

const correctAnswerEmoji = (correctAnswer, choices) => R.nth(R.indexOf(correctAnswer, choices))(reactions);

const addReactions = (embed) => R.forEach((reaction) => { embed.react(reaction); }, reactions);

const createQuestionDescription = (options, list) => {
    options.forEach((option, index) => {
        list.push(`\n${R.nth(index, reactions)} ${option}\n`);
    }); return R.join(' ', list);
};

const createQuestionEmbed = (description) => async (results, interaction) => {
    return await sendEmbed(createEmbed_(`\n✨ ${R.prop('question', results)} ✨ \n`, description), interaction);
};

const sendEmbed = async (embed, interaction) => { return interaction.followUp({embeds: [embed]});}

const createEmbed_ = (title, description) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor('YELLOW')
        .setDescription(description);
}

const description = (choices) => createQuestionEmbed(createQuestionDescription(choices,[]));

const filter = (reaction, user)=> { return !user.bot ;};

const collector = (embed) =>{ return embed.createReactionCollector({filter, time: TIME_MAX }); };

const collectorOn = (list, answer, reactionList = new Set()) =>
    (collector) => collector.on('collect', (reaction, user) => {

            const userLens = R.lensProp(user.id);
            if (R.isNil(R.view(userLens, participants))) {
                participants = R.assoc(user.id, 0, participants);
            }
            if(reaction.emoji.name === answer && !reactionList.has(user.id)) {
                participants = R.over(userLens, R.inc, participants);
                list.push(user.username);
            }
            reactionList.add(user.id);
            console.log(participants);
            return participants;
        }
    );

const collectorEnd = (list, answer, interaction) => (collector) => collector.on('end', async () => {

    const result = R.ifElse(
        R.isEmpty,
        R.always(createEmbed_('Time\'s Up! No one got it.... 🦉', `\n The correct answer was ${answer}\n`)),
        R.always(createEmbed_('Great! Here\'s who got it first 🍒:\n',
            `${R.join(', ', list)} \n The correct answer was ${answer}`,
        )),
    );
    await sendEmbed(result(list), interaction)
});
//----------------------------------------------------------------------------------------------------------------------

module.exports = { startQuiz };
