const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('create quiz')
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('about this command')

        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('please check /quiz help command before using this one')
                .addStringOption(option => option.setName('question').setDescription('quiz question').setRequired(true))
                .addStringOption(option => option.setName('answer').setDescription('correct answer').setRequired(true))
                .addStringOption(option => option.setName('option1').setDescription('quiz option 1').setRequired(true))
                .addStringOption(option => option.setName('option2').setDescription('quiz option 2').setRequired(true))
                .addStringOption(option => option.setName('option3').setDescription('quiz option 3').setRequired(true))

        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('save')
                .setDescription('please check /quiz help command before using this one')
                .addStringOption(option => option.setName('name').setDescription('write name for your quiz').setRequired(true))
        )
      //  .addStringOption(option => option.setName('input').setDescription('Enter a string'))
    , new SlashCommandBuilder()
        .setName('start')
        .setDescription('start quiz')
    , new SlashCommandBuilder()
        .setName('modal')
        .setDescription('testing part')
]
    .map(command => command.toJSON());

const rest = new REST().setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);

