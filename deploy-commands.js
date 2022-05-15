const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

require('dotenv').config();

const commands = [
	new SlashCommandBuilder()
		.setName('quiz')
		.setDescription('create quiz')
		.addSubcommand(subcommand =>
			subcommand
				.setName('help')
				.setDescription('about this command'),

		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('please check /quiz help command before using this one')
				.addStringOption(option => option.setName('question').setDescription('quiz question').setRequired(true))
				.addStringOption(option => option.setName('answer').setDescription('correct answer').setRequired(true))
				.addStringOption(option => option.setName('option1').setDescription('quiz option 1').setRequired(true))
				.addStringOption(option => option.setName('option2').setDescription('quiz option 2').setRequired(true))
				.addStringOption(option => option.setName('option3').setDescription('quiz option 3').setRequired(true)),

		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('save')
				.setDescription('please check /quiz help command before using this one')
				.addStringOption(option => option.setName('name').setDescription('write name for your quiz').setRequired(true)),
		),
	//  .addStringOption(option => option.setName('input').setDescription('Enter a string'))
	new SlashCommandBuilder()
		.setName('start')
		.setDescription('start quiz')
		.addSubcommand(subcommand =>
			subcommand
				.setName('random')
				.setDescription('start random quiz'),

		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('select')
				.setDescription('select quiz by name ')
				.addStringOption(option => option.setName('selected').setDescription('quiz selected name').setRequired(true)),

		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('show all quiz names'),
		),

	new SlashCommandBuilder()
		.setName('modal')
		.setDescription('testing part'),
	new SlashCommandBuilder().setName('tis').setDescription('Replies with Tis but a scratch'),
	new SlashCommandBuilder().setName('biggus').setDescription('Replies with the Biggus Dickus scene'),
	new SlashCommandBuilder().setName('sacred').setDescription('Replies with Every Sperm is Sacred'),
]
	.map(command => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

