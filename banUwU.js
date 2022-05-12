const R = require('ramda');

const sendBanMessage = (member) => member.guild.channels.cache.find(channel => channel.name === 'general')
	.send(`${member.user} has been banned for using shameful language`);
const checkUwU = R.pipe(R.prop('content'), R.toLower, R.includes('uwu'));
const muteUser = (member) => member.disableCommunicationUntil(Date.now() + 60 * 1000);
const banUser = R.pipe(R.invoker(0, 'ban'), R.andThen(sendBanMessage));
const banUserIfBannable = R.ifElse(
	R.prop('bannable'),
	banUser,
	R.always(false),
);
const getUser = async (msg) => await msg.guild.members.fetch(msg.author.id);
const getUserThenBan = R.pipe(getUser, R.andThen(R.pipe(banUserIfBannable)));
const banUwU = R.pipe(
	R.ifElse(
		checkUwU,
		getUserThenBan,
		R.always(false),
	),
);

module.exports = { banUwU };