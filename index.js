// Require the necessary discord.js classes
const fs = require('node:fs');
const { Intents } = require('discord.js');
const R = require('ramda');
const Discord = require('discord.js');
const { token } = require('./config.json');

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));


const client = new Discord.Client({ intents:
		[ Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_PRESENCES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] });

const executeEventOnce = R.invoker(2, 'once');
const executeEventOn = R.invoker(2, 'on');

const checkExecuteEvent = (client, file) => {
	const event = require(`./events/${file}`);
	if (event.once) {
		executeEventOnce(event.name, (...args) => event.execute(...args), client);
	} else {
		executeEventOn(event.name, (...args) => event.execute(...args), client);
	}
};

const curriedCheckExecuteEvent = R.curry(checkExecuteEvent)(client);
const events = R.pipe(R.forEach(curriedCheckExecuteEvent));
events(eventFiles);

//----------------------------------------------------------------------------------------------------------------------
client.login(token).then();
