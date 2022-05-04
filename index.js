// Require the necessary discord.js classes
const {Intents} = require('discord.js');
const {token} = require('./config.json');
const R = require('ramda');
const Discord = require('discord.js');
const fs = require('node:fs');

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

const client = new Discord.Client({ intents:
		[Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_PRESENCES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS]});

const executeEventOnce = R.invoker(2, 'once');
const executeEventOn = R.invoker(2, 'on');
const events = R.pipe(R.forEach);


const checkExecuteEvent = (client, file) => {
	const event = require(`./events/${file}`);
	if (event.once) executeEventOnce(event.name, (...args) => event.execute(...args), client);
	else executeEventOn(event.name, (...args) => event.execute(...args), client);

};
const curriedCheckExecuteEvent = R.curry(checkExecuteEvent)(client);
events(curriedCheckExecuteEvent, eventFiles);

//---------------------------------------------------------------------------------------------------------------------

const {createQuiz} = require('./events/create-quiz.js');
const {launchQuiz} = require('./events/launch-quiz.js');

client.on('interactionCreate', interaction => {
	console.log(interaction);
});



client.on('messageCreate',  (message) => {
	if (message.content.startsWith('-c') && !message.author.bot) {
		createQuiz(client, message);
	}
	if (message.content.startsWith('-l') && !message.author.bot) {
		console.log('-l');
		launchQuiz(client, message);
	}
});


//----------------------------------------------------------------------------------------------------------------------
client.login(token).then();


function loginBot() {
	client.login(token).then();
}

exports.client = client;
exports.loginBot = loginBot;
