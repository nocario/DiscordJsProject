const R = require('ramda');
const { createQuiz } = require('./create-quiz.js');
const { launchQuiz } = require('./launch-quiz.js');
const wait = require('node:timers/promises').setTimeout;

const checkCommandName = (commandName, interaction) => R.equals(commandName, R.prop('commandName', interaction));
const sendReply = async (reply, interaction) => await interaction.reply(reply);
const deferReply = async interaction => {
	await interaction.deferReply();
	await wait(1000);
	return interaction;
};

const useCommand = R.pipe(R.cond([
	[ R.curry(checkCommandName)('biggus'), R.curry(sendReply)('https://www.youtube.com/watch?v=yzgS61zgPEg') ],
	[ R.curry(checkCommandName)('tis'), R.curry(sendReply)('https://www.youtube.com/watch?v=ZmInkxbvlCs') ],
	[ R.curry(checkCommandName)('sacred'), R.curry(sendReply)('https://www.youtube.com/watch?v=fUspLVStPbk') ],
	[ R.curry(checkCommandName)('quiz'), R.pipe(deferReply, R.andThen(createQuiz)) ],
	[ R.curry(checkCommandName)('start'), R.pipe(deferReply, R.andThen(launchQuiz)) ],

]));
const isCommand = R.pipe(
	R.ifElse(
		R.invoker(0, 'isCommand'),
		useCommand,
		R.always(false),
	));

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		await isCommand(interaction);
	},
};
