const R = require('ramda');


const checkCommandName = (commandName, interaction) => R.equals(commandName, R.prop('commandName', interaction));
const sendReply = async (reply, interaction) => await interaction.reply(reply);
const useCommand = R.pipe(R.cond([
	[R.curry(checkCommandName)('biggus'), R.curry(sendReply)('https://www.youtube.com/watch?v=yzgS61zgPEg')],
	[R.curry(checkCommandName)('tis'), R.curry(sendReply)('https://www.youtube.com/watch?v=ZmInkxbvlCs')],
	[R.curry(checkCommandName)('sacred'), R.curry(sendReply)('https://www.youtube.com/watch?v=fUspLVStPbk')]
]));
const isCommand = R.pipe(
	R.ifElse(
		R.invoker(0, 'isCommand'),
		useCommand,
		R.always(false)
	));

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		await isCommand(interaction);
		/*
        if (!interaction.isCommand()) return;
        const { commandName } = interaction;
        if (commandName === 'biggus') {
            await interaction.reply('https://www.youtube.com/watch?v=yzgS61zgPEg');
        } else if (commandName === 'tis') {
            await interaction.reply('https://www.youtube.com/watch?v=ZmInkxbvlCs');
        } else if (commandName === 'sacred') {
            await interaction.reply('https://www.youtube.com/watch?v=fUspLVStPbk');
        }
         */
	}
};