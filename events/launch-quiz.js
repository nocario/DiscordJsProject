const { MessageEmbed } = require('discord.js');
const shuffle = require('shuffle-array');
const R = require('ramda');
const data = require('../quiz.json');
const wait = require('node:timers/promises').setTimeout;

//---------------------------------------------------------------------------------------------------------------------
const QUESTION_INTERVAL = 20000;
const TIME_MAX = 15000;
const reactions = [ '💛', '💚', '💙', '💜' ];
const quizzes_name = R.pluck('quiz_name', data);
//----------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (interaction) => {
	R.cond([
		[ R.equals('last'), async () => await main(interaction, results(data[0]))],
		[ R.equals('random'), async () => await main(interaction, randomQuiz())],
		[ R.equals('select'), async () => await main(interaction, await selectedQuiz(interaction))],
		[ R.equals('list'), async () => await listQuiz(interaction)]
	])(interaction.options.getSubcommand());
}

const nameSelected = (interaction) => { return interaction.options.getString('selected');}

const dataSelected = (interaction) => { return results(R.find(R.propEq('quiz_name', nameSelected(interaction)))(data));}

const results = (quiz) => { return  R.prop('results', quiz)}

const listQuiz = async (interaction) =>  {
	return (await sendEmbed('✨ All available quiz ✨', R.join('\n', quizzes_name)), interaction);
}
const randomQuiz = () => {
	console.log(R.prop('results', shuffle(quizzes_name)[0]));
	return results(shuffle(quizzes_name)[0]);}

const selectedQuiz = async (interaction) => {
	const embed = createEmbed_(`✨ ${interaction.options.getString('selected')} quiz was selected ✨`,
		`You have ${TIME_MAX / 1000} seconds for each question.\n Players with incorrect answers will be 🌚🔫`);
	await sendEmbed(embed, interaction);
	await wait(QUESTION_INTERVAL);
 	return dataSelected(interaction);
}
//----------------------------------------------------------------------------------------------------------------------

const main = async (interaction, results) => {

	for (const result of results) {

		let usersWithCorrectAnswer = [];
		const looserList = new Set();

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

const getCollector = (embed) => { return embed.createReactionCollector({time: TIME_MAX }); };

const collector = (embed) => getCollector(embed);
const collectorOn = (list, answer, looserList) => (collector) => collector.on('collect', (reaction, user) => {
	console.log(user);
		if (!user.bot) {
			if (reaction.emoji.name !== answer) {
				looserList.add(user);
			}
			else if (!looserList.has(user)) {
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
