const { MessageEmbed } = require('discord.js');
const shuffle = require('shuffle-array');
const R = require('ramda');
const data = require('../quiz.json');
const wait = require('node:timers/promises').setTimeout;

//---------------------------------------------------------------------------------------------------------------------
const QUESTION_INTERVAL = 15000;
const TIME_MAX = 10000;
const reactions = [ '💛', '💚', '💙', '💜' ];
const quizzes_name = R.pluck('quiz_name', data);
//----------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (interaction) => {
	R.cond([
		[ R.equals('random'), async () => await main(interaction, await quiz(interaction, shuffle(quizzes_name)[0]))],
		[ R.equals('select'), async () => await main(interaction, await quiz(interaction, nameSelected(interaction)))],
		[ R.equals('list'), async () => await listQuiz(interaction)]
		//[ R.T, async () =>  ]
	])(interaction.options.getSubcommand());
}

const nameSelected = (interaction) => {

	return interaction.options.getString('selected');
}

const resultsByQuizName = (quizName) => { return R.prop('results', R.find(R.propEq('quiz_name',quizName))(data))}

const listQuiz = async (interaction) =>  {
	return await sendEmbed('✨ All available quiz ✨', R.join('\n', quizzes_name), interaction);
}

const quiz = async (interaction, name) => {
	await createStartQuizMessage(interaction, name);
	return resultsByQuizName(name);
}

const createStartQuizMessage = async (interaction, title) =>{
	const embed = createEmbed_(`✨ ${title} ✨`,
		`You have ${TIME_MAX / 1000} seconds for each question.\n Players with incorrect answers will be 🌚🔫`);
	await sendEmbed(embed, interaction);
	return await wait(QUESTION_INTERVAL);
}

//----------------------------------------------------------------------------------------------------------------------

const main = async (interaction, results) => {

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

const collector = (embed) => { return embed.createReactionCollector({time: TIME_MAX }); };

//const collector = (embed) => getCollector(embed);

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
	await sendEmbed(result(list), interaction);
});

//---------------------------------------------------------------------------------------------------------------------

module.exports = { launchQuiz };
