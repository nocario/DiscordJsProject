
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('biggus').setDescription('Replies with the best scene from The Life of Brian'),
	new SlashCommandBuilder().setName('tis').setDescription('Replies with Tis a but a scratch scene from Holy Grail'),
	new SlashCommandBuilder().setName('sacred').setDescription('Replies with Every Sperm is Sacred'),

]
	.map(command => command.toJSON());

const rest = new REST().setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

