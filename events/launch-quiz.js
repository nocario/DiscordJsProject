const { MessageEmbed } = require('discord.js');
const data = require('../quiz.json');
const fs = require('node:fs');
const R = require('ramda');
const shuffle = require('shuffle-array');
const { intersection } = require('ramda');
const wait = require('node:timers/promises').setTimeout;

//---------------------------------------------------------------------------------------------------------------------
const QUESTION_INTERVAL = 10000;
const TIME_MAX = 15000;
const reactions = [ '💛', '💚', '💙', '💜' ];

//const dataSelected = R.find(R.propEq('quiz_name', 'so this is permanence'))(data); //TODO
//const results = R.prop('results', dataSelected); //TODO
const results = R.prop('results', data[0]);

console.log(results)
//---------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (interaction) => {

	for (let i = 0; i < results.length; i++) {

		//R.forEach(async (result) => {

		console.log(results[i]);
		let usersWithCorrectAnswer = [];

		const correctAnswer = R.prop('correct_answer', results[i]);
		const incorrectAnswers = R.prop('incorrect_answers', results[i]);
		const choices = shuffle(R.concat(incorrectAnswers, [ correctAnswer ]));

		const messageEmbed = await description(choices)(results[i], interaction);

		R.pipe(
			compose(addReactions)(messageEmbed),
			compose(
				collectorOn(usersWithCorrectAnswer),
				collectorEnd(usersWithCorrectAnswer, correctAnswer, interaction))
			(collector(messageEmbed, correctAnswer, choices, interaction)),
			await sleep(), R.andThen(console.log),


		);
		await sleep();
	}
//, results, );

}

const sleep = async () => {
	console.log('ok');
	return await wait(QUESTION_INTERVAL);
};
//---------------------------------------------------------------------------------------------------------------------

const compose = (...funcs) => initialArg => funcs.reduce((acc, func) => func(acc), initialArg);

const correctAnswerEmoji = (correctAnswer, choices) => R.nth(R.indexOf(correctAnswer, choices))(reactions);

const addReactions = (embed) => R.forEach((reaction) => { embed.react(reaction); }, reactions);

const createQuestionDescription = (options, list) => {
	options.forEach((option, index) => {
		list.push(`\n${R.nth(index, reactions)} ${option}\n`);
	}); return R.join(' ', list);
};

const createQuestionEmbed = (description) => async (results, interaction) => {
	let embed = createEmbed_(`\n✨ ${R.prop('question', results)} ✨ \n`, description);
	return await interaction.followUp({ embeds: [ embed ] });
};

const createEmbed_ = (title, description) => {
	return new MessageEmbed()
		.setTitle(title)
		.setColor('YELLOW')
		.setDescription(description);
};

const description = (choices) => createQuestionEmbed(createQuestionDescription(choices,[]));

const getFilter = (answer, interaction) => (reaction) => {
	return (reaction.emoji.name === answer) && !interaction.user.bot;
};

const getCollector = (embed) => (filter) => { return embed.createReactionCollector({ filter, time: TIME_MAX }); };

const collector = (embed, answer, choices, interaction) =>
	getCollector(embed)(getFilter(correctAnswerEmoji(answer, choices), interaction));

const collectorOn = (list) => (collector) => collector.on('collect', (reaction, user) => {
	if (user.username != 'Big Brother') list.push(user.username);
	console.log(user.username);
}); //R.append(user.username, usersWithCorrectAnswer) => doesnt work, check later why

const collectorEnd = (list, answer, interaction) => (collector) => collector.on('end', async () => {
	const result = R.ifElse(
		R.isEmpty,
		R.always(createEmbed_('Time\'s Up! No one got it.... 🦉', `\n The correct answer was ${answer}`)),
		R.always(createEmbed_('Great! Here\'s who got it first 🍒:',
			`${R.join(', ', list)} \n The correct answer was ${answer}`,
		)),
	);
	await interaction.followUp({ embeds: [ result(list) ] });
});

//---------------------------------------------------------------------------------------------------------------------

module.exports = { launchQuiz };
