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




client.login(token).then()

