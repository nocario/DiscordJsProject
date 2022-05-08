const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');
//----------------------------------------------------------------------------------------------------------------------
let results = [];

const createQuiz = async (interaction)  => {

    const getString = (name) => interaction.options.getString(name);

    const quiz = () => { return R.zipObj(['quiz_name', 'results'], [getString('name'), results]);}

    const question = () => {
        return  zipQuestion(getString('question'), getString('answer'),
        [getString('option1'), getString('option2'), getString('option3')])}

    R.cond([
        [R.equals('help'), async () => await quizHelp(interaction)],
        [R.equals('add'), async () => await quizAdd(interaction, question())],
        [R.equals('save'), async () => await quizSave(interaction, quiz())],
    ])(interaction.options.getSubcommand());
}

//----------------------------------------------------------------------------------------------------------------------

const zipQuestion = (question, answer, options) => {
    return R.zipObj(['question', 'correct_answer', 'incorrect_answers'], [question, answer, options]);
}

const quizAdd = async (interaction, question) => {
    results.push(question);
    await interaction.followUp({embeds: [createEmbed_(`✨Question n°${results.length} added✨`,
            ' Write another one or end with -save.')]});
}

const quizHelp = async (interaction) => {
    await interaction.followUp({embeds: [
    createEmbed_('✨ Quiz Generator ✨',
        'Welcome to the ****/quiz**** command. To create your quiz you need to use ' +
        'the following subcommands:\n \n /quiz ****add****\n \n Use this command to add a ' +
        'question to your quiz which is created automatically with the addition of the first ' +
        'question.\n Question, correct answer and following options (3 max) are required.\n \n' +
        '\n /quiz ****save****\n \n To avoid wasting time and effort, use this command to save ' +
        'the quiz. \nThe name for your quiz will be requested.')
    ]});
}

const quizSave = async (interaction, quiz) => {
    fs.writeFile('quiz.json', JSON.stringify([quiz],null,2),
        async function (err) {
            if (err) console.log('error', err);
            else await interaction.followUp(
                {embeds: [createEmbed_('✨Quiz saved!✨','Launch it  with /quiz start ')]})
    });
}

const createEmbed_ = (title, description) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor('YELLOW')
        .setDescription(description);
}

module.exports = {createQuiz};