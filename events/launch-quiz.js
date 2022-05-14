const { MessageEmbed } = require('discord.js');
const shuffle = require('shuffle-array');
const R = require('ramda');
const data = require('../quiz.json');
const wait = require('node:timers/promises').setTimeout;

//---------------------------------------------------------------------------------------------------------------------
const QUESTION_INTERVAL = 15000;
const TIME_MAX = 10000;
const reactions = [ '💛', '💚', '💙', '💜' ];
const namesList = R.pluck('quiz_name', data);
//----------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (interaction) => {
 	R.cond([
		[ R.equals('random'), async () => await main(interaction, await quiz(interaction, shuffle(namesList)[0]))],
		[ R.equals('select'), async () => await nameSelected(interaction, interaction.options.getString('selected'))],
		[ R.equals('list'), async () => await listQuiz(interaction)]
	])(interaction.options.getSubcommand());
}

const nameSelected = async (interaction, name) => {
	if (R.includes(name, namesList)){ // check if quiz even exist, doesnt work with R.if else
		await main(interaction, await quiz(interaction, name))
	}
	else {
		await sendEmbed(
			createEmbed_('Quiz not found 😢','Use /start list to get the available'), interaction);
	}
}

const resultsByQuizName = (quizName) => { return R.prop('results', R.find(R.propEq('quiz_name', quizName))(data))}

const listQuiz = async (interaction) =>  {
	const embed = createEmbed_('✨ All available quiz ✨', R.join('\n', namesList));
	return await sendEmbed(embed, interaction);
}

const quiz = async (interaction, name) => {
	await createStartQuizMessage(interaction, name);
	return resultsByQuizName(name);
}

const createStartQuizMessage = async (interaction, title) =>{
	const embed = createEmbed_(`✨ ${title} ✨`,
		`You have ${TIME_MAX / 1000} seconds for each question.\n Players with incorrect answers will be 🌚🔫`);
	await sendEmbed(embed, interaction);
	//return await wait(QUESTION_INTERVAL);
}

//----------------------------------------------------------------------------------------------------------------------

const main = async (interaction, results) => {

	for (const result of results) {

		let participants = {};
		let usersWithCorrectAnswer = [];

		const correctAnswer = R.prop('correct_answer', result);
		const incorrectAnswers = R.prop('incorrect_answers', result);
		const choices = shuffle(R.concat(incorrectAnswers, [ correctAnswer ]));

		const messageEmbed = await description(choices)(result, interaction);

		R.pipe(
			compose(addReactions)(messageEmbed),
			compose(collectorOn(usersWithCorrectAnswer, correctAnswerEmoji(correctAnswer, choices), participants),
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

const filter = (reaction, user) => { return !user.bot;};

const collector = (embed) => { return embed.createReactionCollector({filter, time: TIME_MAX }); };

const collectorOn = (list, answer, participants) =>
	(collector) => collector.on('collect', (reaction, user) => {

		console.log('--------');

		console.log(R.prop(user.username, participants));
		console.log(R.isNil(R.prop(user.username, participants)));

		if (R.isNil(R.prop(user.username, participants))) {
			participants = R.assoc(user.username, 0, participants);
		}
		if(reaction.emoji.name === answer) {
			list.push(user.username);

			participants = R.over(R.lensProp('taredalen'), R.inc, participants);


		}
		console.log({ participants });
		return participants;
	}
);

const collectorEnd = (list, answer, interaction) => (collector) => collector.on('end', async () => {
	const result = R.ifElse(
		R.isEmpty,
		R.always(createEmbed_('Time\'s Up! No one got it.... 🦉', `\n The correct answer was ${answer}`)),
		R.always(createEmbed_('Great! Here\'s who got it first 🍒:\n',
			`${R.join(', ', list)} \n The correct answer was ${answer}`,
		)),
	);
	await sendEmbed(result(list), interaction);
});

//---------------------------------------------------------------------------------------------------------------------

module.exports = { launchQuiz };
