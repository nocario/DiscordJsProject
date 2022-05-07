const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');
const {Command} = require('commander');
const program = new Command();
//----------------------------------------------------------------------------------------------------------------------
const MATCHER = /^([^\n]+)([^,]+,[^,]+,[^,\n]{2})(\n){0}/g;
let results = [];
//----------------------------------------------------------------------------------------------------------------------

const createQuiz = async (client, interaction)  => {

    console.log(interaction);

    const filter = interaction => R.lt(numberOfLines(interaction.content), 3) && !interaction.author.bot;

    const collector = await interaction.channel.createMessageCollector({filter});

    const sendMessage = (output) => interaction.channel.send(output);
   // message.channel.send({embeds: [createEmbed_()]});
          //sendMessage({embeds: [createEmbed_()]}),
       // collectMessages(collector)


    //await interaction.editReply({embeds: [createEmbed_()]});
    //await collectMessages(collector, interaction);

    if (interaction.options.getSubcommand() === 'start') {
        const question = interaction.options.getString('question');
        const answer = interaction.options.getString('answer');
        const optionFirst = interaction.options.getString('option1');
        const optionSecond = interaction.options.getString('option2');
        const optionThird = interaction.options.getString('option3');

        const
        console.log('ok');

        console.log(question);


        await interaction.channel.send(`question: ${question}`);
        await interaction.channel.send(`answer: ${answer}`);
        await interaction.channel.send(`option 1: ${optionFirst}`);
        await interaction.channel.send(`option 2: ${optionSecond}`);
        await interaction.channel.send(`option 3: ${optionThird}`);
    }

}

const collectMessages = async (collector, interaction) => {
    for await (const message of collector) {
        console.log(message.content);

        R.cond([
            [R.equals('-end'), () => message.channel.send('To finalize, please send -name following the name for your quiz:')],
            [R.includes('-name'), (input) => quiz(input, collector, interaction)],
            [R.test(MATCHER), (input) => addQuestion(input, message)],
            [R.T, () => message.channel.send('There is something wrong... (°.°)')],
        ])(message.content);
    }
}

const lines = (input) => R.map(R.trim, R.split('\n', input));

const question = (lines) => {
    return R.map(
        R.assoc('incorrect_answers',  R.split(',', R.last(lines))),
        R.zipObj(['question', 'correct_answer', 'incorrect_answers']))(lines);
}

const numberOfLines = (lines) => { return [...lines].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0);}

const addQuestion = (input, message) => {
    results.push(question(lines(input)));
    message.channel.send(`Question n°${results.length} added, write another one or stop with -end.`);
}

const quiz = (input, collector, interaction) => {
    const quiz = R.zipObj(['quiz_name', 'results'], [R.trim(R.replace('-name', ' ', input)), results]);
    createJson(quiz, interaction);
    collector.stop();
}

const createJson = (quiz, interaction) => {
    fs.writeFile('quiz.json', JSON.stringify([quiz],null,2),
        async function (err) {
            if (err) console.log('error', err);
            else await interaction.followUp('quiz saved!')

        });
}

const createEmbed_ = () => {
    return new MessageEmbed()
        .setTitle('✨Quiz Generator✨')
        .setColor('YELLOW')
        .setFooter({text : 'To stop, use the command -stop.'})
        .setDescription(
            'Welcome to the !c command. To create your quiz you need to send ' +
            'the text in a multiline format following the next pattern: ' +'\n'+
            '\n' + 'Question?' +
            '\n' + 'Correct answer' +
            '\n' + 'Incorrect answers, separated by commas (3 max)' +'\n'+
            '\n' + 'Example:' +
            '\n' + 'Which language is out of place?'  +
            '\n' + 'HTML' +
            '\n' + 'Java, C++, JavaScript'
        );
}

module.exports = {createQuiz};