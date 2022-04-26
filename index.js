// Require the necessary discord.js classes
const { Intents} = require('discord.js');
const { token} = require('./config.json');
const  R  = require('ramda')
const Discord = require("discord.js")
const fs = require('node:fs');


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

const client = new Discord.Client({ intents:
        [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] })
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

client.on('message', async message => {

    if (message.content.toLowerCase().startsWith('-test')){
        const response = await fetch('https://opentdb.com/api.php?amount=8&category=10&type=boolean');
        const data = await response.json();

        let length = data.results.length;

        let randomNumber = Math.floor(Math.random() * length);
        let randomQuestion = data.results[randomNumber];
        let question = randomQuestion.question;
        let correctAnswer = randomQuestion.correct_answer;


        message.channel.send(question);



        const filter = m => m.author.id === message.author.id;

        console.log(message.author.username);



        const answer = await message.channel.awaitMessages({filter : filter,
            maxMatches: 1, time: 10000,  errors: ['time', 'maxMatches']});
        console.log(answer);

        const ans = answer.first();


        if(ans.content.toLowerCase() === correctAnswer.toLowerCase())
        {
            message.channel.send('You got the question right');
        } else {
            message.channel.send('That is incorrect');
        }
    }
});






//----------------------------------------------------------------------------------------------------------------------

client.login(token).then()

