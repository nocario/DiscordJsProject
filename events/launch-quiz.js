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

const quizzes_name = R.pluck('quiz_name', data);


//const results = R.prop('results', dataSelected);
//const results = R.prop('results', data[0]);  antoine
//----------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (interaction) => {

	//const quizName = () => { return  interaction.options.getString('selected');}

	//const dataSelected = R.find(R.propEq('quiz_name', 'so this is permanence'))(data); //TODO
//const results = R.prop('results', dataSelected); //TODO


	console.log( R.prop('results', interaction.options.getString('selected')));
	R.cond([
		[ R.equals('last'), async () => await main(interaction, R.prop('results', data[0]))],
		[ R.equals('random'), async () => await main(interaction, randomQuiz())],
		[ R.equals('selected'), async () => await main(interaction, R.prop('results', selectedQuiz(interaction)))],
		[ R.equals('list'), async () => await listQuiz(interaction)]
	])(interaction.options.getSubcommand());
}

const selectedQuiz = (interaction) => {
	console.log(R.prop('results', R.find(R.propEq('quiz_name', interaction.options.getString('selected')))(data)));
	return R.find(R.propEq('quiz_name', interaction.options.getString('selected')))(data);
}

const randomQuiz = () => { return R.prop('results', shuffle(quizzes_name)[0]);}

const listQuiz = async (interaction) =>  {
	let embed = createEmbed_('✨ All available quiz ✨',
		R.join('\n', quizzes_name));
	return await interaction.followUp({ embeds: [ embed ] });
}

const main = async (interaction, results) => {

	console.log(results);

	for (const result of results) {

		let usersWithCorrectAnswer = [];

		const correctAnswer = R.prop('correct_answer', result);
		const incorrectAnswers = R.prop('incorrect_answers', result);
		const choices = shuffle(R.concat(incorrectAnswers, [ correctAnswer ]));

		const messageEmbed = await description(choices)(result, interaction);

		R.pipe(
			compose(addReactions)(messageEmbed),
			compose(collectorOn(usersWithCorrectAnswer, correctAnswerEmoji(correctAnswer, choices), looserList),
				    collectorEnd(usersWithCorrectAnswer, correctAnswer, interaction))
			(collector(messageEmbed))
		);
		await wait(QUESTION_INTERVAL);
		console.log(usersWithCorrectAnswer);
	}
}

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
}

const description = (choices) => createQuestionEmbed(createQuestionDescription(choices,[]));

const getCollector = (embed) => { return embed.createReactionCollector({time: TIME_MAX }); };

const collector = (embed) => getCollector(embed);

const collectorOn = (list, answer, looserList) => (collector) => collector.on('collect', (reaction, user) => {
		if (!user.bot) {
			if (reaction.emoji.name !== answer) {
				looserList.add(user.username);
			}
			else if (!looserList.has(user.username)) {
				list.push(user.username);
			}

		}
});

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
