const R = require('ramda');

const BannedGames = [
	'fortnite',
	'fallout 4',
];

const INTERVAL_CHECK_WARNING = 20 * 60 * 1000;
const INTERVAL_CHECK_BAN = 5 * 60 * 1000;
// Const INTERVAL_CHECK_WARNING = 5 * 1000;
// const INTERVAL_CHECK_BAN = 2 * 1000;

const checkPlayedGameAtInterval = client => setInterval(() => checkOnlineUsersPlayedGame(client), INTERVAL_CHECK_WARNING);

//----------------------------------------------------------------------------------------------------------------------

const constructObjectMemberGamePlayed = member => ({ user: member, gamePlayed: member.presence?.activities
	.find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase() });

const getGameName = member => member.presence?.activities
	.find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase();

const sendWarning = async member => member.user.guild.channels.cache.find(channel => channel.name === 'general')
	.send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);

const checkIfPlayingGame = member => member.presence?.activities.find(activity => activity.type.toString() === 'PLAYING');

const checkIfPlayingForbiddenGame = (bannedGames, member) => bannedGames.includes(member?.presence?.activities
	.find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase());
const curriedCheckIfPlayingForbiddenGame = R.curry(checkIfPlayingForbiddenGame)(BannedGames);

const checkIfMemberIsOnline = guild => guild.members.fetch({ withPresences: true });
const getOnlineMembers = R.pipe(R.map(checkIfMemberIsOnline));
const getGuilds = client => client.guilds.cache.map(guild => client.guilds.cache.get(guild.id));
const getValueOfMapCollection = array => [ ...array.values() ];
const concatGuildsOnlineMember = R.pipe(R.map(getValueOfMapCollection), R.flatten);

const timeOutWarning = warned => setTimeout(() => checkWarnedMember(warned), INTERVAL_CHECK_BAN);

const checkOnlineUserPlayedGame = R.pipe(
	getGuilds,
	getOnlineMembers,
	R.bind(Promise.all, Promise),
	R.andThen(R.pipe(concatGuildsOnlineMember,
		R.filter(checkIfPlayingGame),
		R.filter(curriedCheckIfPlayingForbiddenGame),
		R.map(constructObjectMemberGamePlayed),
		R.forEach(sendWarning),
	)));

const checkOnlineUsersPlayedGame = R.pipe(checkOnlineUserPlayedGame, R.andThen(timeOutWarning));

//----------------------------------------------------------------------------------------------------------------------

const announceUserNotBannable = member => member.guild.channels.cache.find(channel => channel.name === 'general')
	.send(`${member.user} cannot be banned unfortunately`);
const announceUserBan = member => member.guild.channels.cache.find(channel => channel.name === 'general')
	.send(`${member.user} has been banned`);

const banUser = R.pipe(R.invoker(0, 'ban'), R.andThen(announceUserBan));

const banWarnedMember = R.pipe(R.forEach(R.ifElse(
	R.prop('bannable'),
	banUser,
	announceUserNotBannable,
)));

//----------------------------------------------------------------------------------------------------------------------

const checkIfStillPlayingGame = R.pipe(R.prop('user'), checkIfPlayingGame);

const checkIfPLayingSameBannedGame = member => R.equals(getGameName(R.prop('user', member)), R.prop('gamePlayed', member));

const checkWarnedMember = R.pipe(
	R.filter(checkIfStillPlayingGame),
	R.filter(checkIfPLayingSameBannedGame),
	R.map(R.prop('user')),
	banWarnedMember);

//----------------------------------------------------------------------------------------------------------------------

module.exports = { checkPlayedGameAtInterval, concatGuildsOnlineMember };
