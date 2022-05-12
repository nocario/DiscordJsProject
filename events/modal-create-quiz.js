/*

const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');
const { Modal, TextInputComponent, showModal } = require('discord-modals') // Now we extract the showModal method
const { Formatters } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

//----------------------------------------------------------------------------------------------------------------------

// partie dans index car importation impossible du client !!!
const {modalCreateQuiz} = require('./events/modal-create-quiz.js');

client.on('interactionCreate', (interaction) => {
    // Let's say that the interaction will be an Slash Command called 'ping'.
    R.cond([
        [R.equals('modal'), async () => await modalCreateQuiz(interaction, client)],
    ])(interaction.commandName);
});

//----------------------------------------------------------------------------------------------------------------------

const modalCreateQuiz2 = async (interaction, client)  => {


    await interaction.deferReply();
    await wait(1000);

    await quizHelp(interaction, client) ;
}

//----------------------------------------------------------------------------------------------------------------------

const quizHelp = async (interaction, client) => {

    await showModal(modal, { client, interaction})

}

client.on('modalSubmit', async (modal) => {
    if (modal.customId === 'modal-customid') {
        console.log('ok');
        const firstResponse = modal.components[0].value;
        console.log(firstResponse);
        await interaction.followUp('question :' + `\`\`\`${firstResponse}\`\`\``);
    }
    else (console.log).catch(console.error);
})

const modal = new Modal()
        .setCustomId('modal-customid')
        .setTitle('Add new question to quiz')
        .addComponents(
            new TextInputComponent()
                .setCustomId('question-customid')
                .setLabel('Write your Question')
                .setStyle('SHORT')
                .setRequired(true),
            new TextInputComponent()
                .setCustomId('answer-customid')
                .setLabel('Write correct answer for your quiz')
                .setStyle('SHORT')
                .setRequired(true),
            new TextInputComponent()
                .setCustomId('option1-customid')
                .setLabel('Write your first incorrect option ')
                .setStyle('SHORT')
                .setRequired(true),
            new TextInputComponent()
                .setCustomId('option2-customid')
                .setLabel('Write your second incorrect option ')
                .setStyle('SHORT')
                .setRequired(true),
             new TextInputComponent()
                .setCustomId('option3-customid')
                .setLabel('Write your third incorrect option ')
                .setStyle('SHORT')
                .setRequired(true))


;

const createEmbed_ = (title, description) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor('YELLOW')
        .setDescription(description);
}

module.exports = {modalCreateQuiz};
*/