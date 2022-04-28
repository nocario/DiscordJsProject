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

const commands = require("./events/commands.js");
let config = require('./config.json');
let prefix = config.prefix;

client.on('message', (msg) => {

    if (msg.author.username !== client.user.username && msg.author.discriminator !== client.user.discriminator) {
        let comm = msg.content.trim() + " ";
        let comm_name = comm.slice(0, comm.indexOf(" "));
        for (comm_count in commands.comms) {
            let comm2 = prefix + commands.comms[comm_count].name;
            if (comm2 === comm_name) {
                commands.comms[comm_count].out(client, msg);
            }
        }
    }
});

//----------------------------------------------------------------------------------------------------------------------

client.login(token).then()

