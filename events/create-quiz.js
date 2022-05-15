const { MessageEmbed } = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');
//----------------------------------------------------------------------------------------------------------------------
const readFile = fs.readFileSync('./quiz.json');
const parsedData = JSON.parse(readFile);
let results = [];
//----------------------------------------------------------------------------------------------------------------------

const createQuiz = async (interaction)  => {

	const getString = (name) => interaction.options.getString(name);

	const quiz = () => { return R.zipObj([ 'quiz_name', 'results' ], [ getString('name'), results ]); };

	const question = () => {
		return  zipQuestion(getString('question'), getString('answer'),
			[ getString('option1'), getString('option2'), getString('option3') ]); };

	R.cond([
		[ R.equals('help'), async () => await quizHelp(interaction) ],
		[ R.equals('add'), async () => await quizAdd(interaction, question()) ],
		[ R.equals('save'), async () => await quizSave(interaction, quiz()) ],
	])(interaction.options.getSubcommand());
};

//----------------------------------------------------------------------------------------------------------------------

const zipQuestion = (question, answer, options) => {
	return R.zipObj([ 'question', 'correct_answer', 'incorrect_answers' ], [ question, answer, options ]);
};

const quizAdd = async (interaction, question) => {
	results.push(question);
	await interaction.followUp({ embeds: [ createEmbed_(`✨Question n°${results.length} added✨`,
		' Write another one or end with ****/quiz save**** command.') ] });
};

const quizHelp = async (interaction) => {
	await interaction.followUp({ embeds: [
		createEmbed_('✨ Quiz Generator ✨',
			'Welcome to the ****/quiz**** command. To create your quiz you need to use ' +
			'the following subcommands:\n \n ' +
			'✨ ****/quiz add**** : use this command to enter a question for your quiz      ✨\n\n' +
			'✨ ****/quiz save**** : without this command, all entering questions will be lost!!!     ✨\n\n' +
			'✨ ****/start list**** : to see the list of all available quizzes    ✨ \n\n' +
			'✨ ****/start random ****: to launch random quiz from quiz list   ✨ \n\n' +
			'✨ ****/start select ****: to launch quiz selected by name    ✨ \n\n'
		)
	] });
};

const quizSave = async (interaction, quiz) => {
	parsedData.push(quiz);
	const data = JSON.stringify(parsedData, null, 2);

	fs.writeFile('quiz.json', data,
		async function (err) {
			if (err) console.log('error', err);
			else await interaction.followUp(
				{ embeds: [ createEmbed_('✨Quiz saved!✨','Launch it  with /quiz start ') ] });
		});
};

const sendEmbed = async (embed, interaction) => { return interaction.followUp({embeds: [embed]});}

const createEmbed_ = (title, description) => {
	return new MessageEmbed()
		.setTitle(title)
		.setColor('YELLOW')
		.setDescription(description);
};

module.exports = { createQuiz, zipQuestion, createEmbed_ };