// Require the necessary discord.js classes
const { Intents} = require('discord.js');
const { token} = require('./config.json');
const  R  = require('ramda')
const Discord = require("discord.js")
const fs = require('node:fs');


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

const client = new Discord.Client({ intents:
        [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS]})
/*
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(() => {
        client.channels.cache.get("963428264272080977").send('test')
    }, 30000)
    const guild = client.guilds.cache.get("963428263806529576");
    if (!guild) console.log("error");
    //guild.members.fetch({withPresences: true}) pour obtenir liste en ligne
    guild.members.cache.forEach( (member) => {
        //const game = member.presence.activities.find(activity => activity.type === 'PLAYING')
        const game = false;
        if (game) {

            if (game.name === "Fallout 2")
                //
                client.channels.cache.get("963428264272080977").send(`${member.user} is playing ${game.name}`);
        }
        else {
            if (!member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                //timeout 2min
                const mute = member.disableCommunicationUntil(Date.now() + (1 * 60 * 1000), 'i can mute you');

                client.channels.cache.get("963428264272080977").send(`${member.user} you are being muted for fun`);
            }
        }
    });
});


 */

const executeEventOnce = R.invoker(2, "once");
const executeEventOn = R.invoker(2, "on");
const events = R.pipe(R.forEach);


const checkExecuteEvent = (client, file) => {
    const event = require(`./events/${file}`);
    if (event.once) executeEventOnce(event.name, (...args) => event.execute(...args), client);
    else executeEventOn(event.name, (...args) => event.execute(...args), client);

};
const curriedCheckExecuteEvent = R.curry(checkExecuteEvent)(client);

events(curriedCheckExecuteEvent, eventFiles);

//----------------------------------------------------------------------------------------------------------------------

const comms = require("./events/comms.js"); // Подключаем файл с командами для бота
let config = require('./config.json'); // Подключаем файл с параметрами и информацией
let prefix = config.prefix;

client.on('message', (msg) => {
    if (msg.author.username !== client.user.username && msg.author.discriminator !== client.user.discriminator) {
        let comm = msg.content.trim() + " ";
        let comm_name = comm.slice(0, comm.indexOf(" "));
        let messArr = comm.split(" ");
        for (comm_count in comms.comms) {
            let comm2 = prefix + comms.comms[comm_count].name;
            if (comm2 == comm_name) {
                comms.comms[comm_count].out(client, msg, messArr);
            }
        }
    }
});
const fetch = require('node-fetch');
const {MessageEmbed} = require("discord.js");


client.on('messageCreate', async message => {
if (message.content === 'poll') {
    let embedPoll = new Discord.MessageEmbed()
         .setColor('YELLOW')
        .addField('1:', 'name')
        .addField('2:', 'name2')
        .addField('3:', 'name3');

    let reactions = ['1️⃣', '2️⃣', '3️⃣'];
    let msgEmbed = await message.channel.send({ embeds: [embedPoll] });

    reactions.forEach((reaction) => msgEmbed.react(reaction));

    const filter = (reaction) => reactions.includes(reaction.emoji.name);
    const collector = msgEmbed.createReactionCollector({ filter, time:1111 });

    // code inside this runs every time someone reacts with those emojis
    collector.on('collect', (reaction, user) => {
        message.channel.send(`Collected ${reaction.emoji.name} from ${user.tag}`);

        console.log(`Just collected a ${reaction.emoji.name} reaction from ${user.username}`);
    });



    collector.on('end', collected => {
        console.log(`Collected ${collected.size} interactions.`);
    });
}

});
client.on('messageCreate', async message => {


    if (message.content.toLowerCase().startsWith('-test')){
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=10&type=boolean');
        const data = await response.json();

        console.log(data);


        let length = data.results.length;

        let randomNumber = Math.floor(Math.random() * length);
        let randomQuestion = data.results[randomNumber];
        let question = randomQuestion.question;
        let correctAnswer = randomQuestion.correct_answer;

        console.log(question);

        message.channel.send(question);





        //const filter = m => m.author.id === message.author.id;

        let filter = (message) => !message.author.bot;

        console.log(message.author.username);

        console.log(message.author.username);

        const answer = await message.channel.awaitMessages({ filter, max: 1, time: 10_000, errors: ['time']})
             ;

        //const answer = await message.channel.awaitMessages(filter, {max: 1, time: 10000, errors: ['time', 'maxMatches']})
        //    .then(collected => message.channel.send(collected.first().content))
        //    .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));


        const ans = answer.first();

        message.channel.send(ans);


        if(ans.content.toLowerCase() === correctAnswer.toLowerCase())
        {
            message.channel.send('You got the question right');
        } else {
            message.channel.send('That is incorrect');
        }
    }

    if (message.content.toLowerCase().startsWith('-m')){
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=10&difficulty=medium&type=multiple');
        const data = await response.json();

        const embed = new MessageEmbed();
        let leaderboard = {};
        let usersWithCorrectAnswer = [];


        console.log(data.results)
        for (let i = 0; i < data.results.length; i++) {
            let choices = [`${data.results[i].correct_answer}`]; // for testing, inputs the correct answer as the first choice for each question
            for (let j = 0; j < 3; j++) {
                // adds the incorrect answers into the choices array created before
                choices.push(`${data.results[i].incorrect_answers[j]}`);
            }

            embed
                .setTitle(`Question ${i + 1}`) // Title dynamically updates depending on which iteration we're on
                .setColor('YELLOW')
                .setDescription(
                    (data.results[i].question) +
                    '\n' + '\n**Choices:**' + '\n' +
                    '\n💛 ' + (choices[0]) + '\n' +
                    '\n💚 ' + (choices[1]) + '\n' +
                    '\n💙 ' + (choices[2]) + '\n' +
                    '\n💜 ' + (choices[3]) + '\n' +
                    '\n' + '\n**Difficulty:** ' +
                     (data.results[i].difficulty) + // difficulty
                    '\n**Category:** ' +
                     (data.results[i].category) // category
                );


            let reactions = ['💛', '💚', '💙', '💜'];
            let msgEmbed = await message.channel.send({ embeds: [embed] });

            reactions.forEach((reaction) => msgEmbed.react(reaction));

            let answer = '';

            if (data.results[i].correct_answer === choices[0]) {
                answer = '💛';
            } else if (data.results[i].correct_answer === choices[1]) {
                answer = '💚';
            } else if (data.results[i].correct_answer === choices[2]) {
                answer = '💙';
            } else {
                answer = '💜';
            }

            const filter = (reaction, user) => {
                return (reaction.emoji.name === answer) && !user.bot;
            };

            const collector = msgEmbed.createReactionCollector({filter, time: 30000 }); // will only collect for 10 seconds, and take one correct answer

            collector.on('collect', (reaction, user) => {

                console.log('usersWithCorrectAnswer')
                usersWithCorrectAnswer.push(user.username);
                console.log(usersWithCorrectAnswer)
                if (leaderboard[user.username] === undefined) {
                    leaderboard[user.username] = 1;
                } else {
                    leaderboard[user.username] += 1
                }
            });

            let newEmbed = new MessageEmbed();
            let result;

            collector.on('end', async () => {
                if (usersWithCorrectAnswer.length === 0) {
                     result = newEmbed
                        .setTitle("Time's Up! No one got it....")
                        .setDescription('\n The correct answer was ' + (data.results[i].correct_answer))
                        .setColor('YELLOW');
                         message.channel.send({ embeds: [result]});

                } else {
                    result = newEmbed
                        .setTitle("That's IT! Here's who got it first:")
                        .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                        .setFooter('\n The correct answer was ' + data.results[i].correct_answer)
                        .setColor('YELLOW');
                        message.channel.send({ embeds: [result]});

                }
            });
        }
    }
});

//----------------------------------------------------------------------------------------------------------------------

client.login(token).then()

