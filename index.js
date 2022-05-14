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

/*

const l = [ 'peu importe', 'so this is permanence', 's' ];
const f1 = R.both(R.equals(R.__, 's'),  R.includes(R.__, l));
console.log(f1('s'));*/


let d = { };

d =  R.append(R.assoc('c', 3), d);
console.log(d);

d = R.assoc('c', 3, d);
console.log(d);
d = R.assoc('c', 3, d);
console.log(d);
d = R.assoc('c', 3, d);
console.log(d)

let u = { user : 0};
u = R.set(R.lensProp('user'), R.inc, u);

var xLens = R.lensProp('x');

R.set(xLens, 4, {x: 1, y: 2});
console.log(xLens);
console.log(u);


let participants = {}
;




const user = R.lensProp('taredalen');

const result2 = R.set(R.lensProp('taredalen'), '1', participants);

const results=['s','s'];

for (const result of results) {
	const result = R.view(user, participants);

	if (R.isNil(result)) {

		console.log('n');
		R.append({'taredalen': 0}, participants);
	} else if (result === 's') {
		participants = R.over(R.lensProp('taredalen'), R.inc, participants);

	}

	console.log({participants});
}
//----------------------------------------------------------------------------------------------------------------------
client.login(token).then();
