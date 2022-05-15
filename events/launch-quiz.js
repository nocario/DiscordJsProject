const { MessageEmbed } = require('discord.js');
const shuffle = require('shuffle-array');
const R = require('ramda');
const data = require('../quiz.json');
const wait = require('node:timers/promises').setTimeout;
const { startQuiz } = require('./start-quiz.js');
//----------------------------------------------------------------------------------------------------------------------
const TIME_MAX = 10000;
let namesList = R.pluck('quiz_name', data);
//----------------------------------------------------------------------------------------------------------------------

const launchQuiz = async (interaction) => {
	R.cond([
		[ R.equals('random'), async () => await startQuiz(interaction, await quiz(interaction, shuffle(namesList)[0]))],
		[ R.equals('select'), async () => await nameSelected(interaction, interaction.options.getString('selected'))],
		[ R.equals('list'), async () => await listQuiz(interaction)]
	])(interaction.options.getSubcommand());
}

const nameSelected = async (interaction, name) => {
	if (R.includes(name, namesList)){
		await startQuiz(interaction, await quiz(interaction, name))
	}
	else {
		await sendEmbed(
			createEmbed_('Quiz not found 😢','Use /start list to get the available'), interaction
		);
	}
}

const resultsByQuizName = (quizName) => { return R.prop('results', R.find(R.propEq('quiz_name', quizName))(data));}

const listQuiz = async (interaction) =>  {
	return await sendEmbed(createEmbed_('✨ All available quiz ✨', R.join('\n', namesList)), interaction);
}

const quiz = async (interaction, name) => {
	await createStartQuizMessage(interaction, name);
	return resultsByQuizName(name);
}

const createStartQuizMessage = async (interaction, title) =>{
	const embed = createEmbed_(`✨ ${title} ✨`,
		`You have ${TIME_MAX/1000} seconds for each question.\n Players with incorrect answers will be 🌚🔫\n`
	);
	await sendEmbed(embed, interaction);
	return await wait(TIME_MAX/2);
}

const sendEmbed = async (embed, interaction) => { return await interaction.followUp({embeds: [embed]});}

const createEmbed_ = (title, description) => {
	return new MessageEmbed()
		.setTitle(title)
		.setColor('YELLOW')
		.setDescription(description);
}

module.exports = { launchQuiz };
