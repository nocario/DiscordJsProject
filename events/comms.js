const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

async function test(robot, message, args) {
    const response = await fetch('https://opentdb.com/api.php?amount=8&category=10&type=boolean');
    const data = await response.json();

    let length = data.results.length;

    let randomNumber = Math.floor(Math.random() * length);
    let randomQuestion = data.results[randomNumber];
    let question = randomQuestion.question;
    let correctAnswer = randomQuestion.correct_answer;


    message.channel.send(question);



    const filter = m => m.author.id === message.author.id;
    const answer = await message.channel.awaitMessages(filter,
        {maxMatches: 1, time: 10000,  errors: ['time', 'maxMatches']});
    console.log(answer);

    const ans = answer.first();


    if(ans.content.toLowerCase() === correctAnswer.toLowerCase())
    {
        message.channel.send('You got the question right');
    } else {
        message.channel.send('That is incorrect');
    }

}

function quiz(robot, mess, args) {

// inside a command, event listener, etc.
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('A')
                .setLabel('A')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('B')
                .setLabel('B')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('C')
                .setLabel('C')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('D')
                .setLabel('D')
                .setStyle('SECONDARY')
        );

    const embed = new MessageEmbed()
        .setColor('#0xf2ff00')
        .setTitle('Some title')
        .setURL('https://discord.js.org/')
        .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        .setDescription('Some description here')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields(
            { name: 'Regular field title', value: 'Some value here' },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addField('Inline field title', 'Some value here', true)
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()

    mess.channel.send({ embeds: [embed], components: [row] });


}



let comms_list = [{
        name: "test",
        out: test,
        about: "test  command"
    },
    {
        name: "quiz",
        out: quiz,
        about: "quiz  command!"
    }
]

module.exports.comms = comms_list;