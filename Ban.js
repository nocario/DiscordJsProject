const R = require('ramda')

const BannedGames = [
    "fortnite",
    "fallout",
    "fallout 4"
];

//const INTERVAL_CHECK_WARNING = 30 * 60 * 1000;
//const INTERVAL_CHECK_BAN = 5 * 60 * 1000;
const INTERVAL_CHECK_WARNING = 5 * 1000;
const INTERVAL_CHECK_BAN = 2 * 1000;

const checkPlayedGameAtInterval = (client) => setInterval(() => checkOnlineUsersPlayedGame(client), INTERVAL_CHECK_WARNING);

//----------------------------------------------------------------------------------------------------------------------

const constructObjectMemberGamePlayed =  (member) => {
    return {'user': member, 'gamePlayed': member.presence?.activities
            .find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase()}
}

const getGameName = (member) => member.presence?.activities
    .find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase();
/*
const constructObjectMemberGamePlayed = (member) => R.pipe(R.applySpec({
    user: R.identity(member),
    gamePlayed: getGameName2(member)
}));


 */
const sendWarning = async (member) => member.user.guild.channels.cache.find(channel => channel.name === "general")
    .send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);

const checkIfPlayingGame = (member) => member.presence?.activities.find(activity => activity.type.toString() === 'PLAYING');

const checkIfPlayingForbiddenGame = (bannedGames, member) => bannedGames.includes(member?.presence?.activities
    .find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase());
const curriedCheckIfPlayingForbiddenGame = R.curry(checkIfPlayingForbiddenGame)(BannedGames);

const checkIfMemberIsOnline = async (guild) => await guild.members.fetch({withPresences: true});
const getOnlineMembers = R.pipe(R.map(checkIfMemberIsOnline));
const getGuilds = (client) => client.guilds.cache.map(guild => client.guilds.cache.get(guild.id));

const t = (arr) => [...arr.values()];
const concatGuildsOnlineMember = R.pipe(R.map(t), R.flatten);

const timeOutWarning = (warned) => setTimeout(() => checkWarnedMember(warned), INTERVAL_CHECK_BAN)

const checkOnlineUserPlayedGame2 = R.pipe(
    getGuilds,
    getOnlineMembers,
    R.bind(Promise.all, Promise),
    R.andThen(R.pipe(concatGuildsOnlineMember,
                    R.filter(checkIfPlayingGame),
                    R.filter(curriedCheckIfPlayingForbiddenGame),
                    R.map(constructObjectMemberGamePlayed),
                    R.forEach(sendWarning)
            )));

const finish = R.pipe(checkOnlineUserPlayedGame2, R.andThen(timeOutWarning))
const checkOnlineUsersPlayedGame = async (client) => await finish(client);


//----------------------------------------------------------------------------------------------------------------------

const announceUserNotBannable = (member) => member.guild.channels.cache.find(channel => channel.name === "general")
    .send(`${member.user} cannot be banned unfortunately`);
const announceUserBan = (member) => member.guild.channels.cache.find(channel => channel.name === "general")
    .send(`${member.user} has been banned`);

//const banUser = R.pipe(R.invoker(0, 'ban'), R.andThen(announceUserBan));
const f = R.invoker(1, "disableCommunicationUntil");
const muteUser = (member) => {
    const m = Date.now() + 60 * 1000;
    f(m, member);
    announceUserBan(member);
}
const banWarnedMember = R.pipe(R.forEach(R.ifElse(
    R.prop('bannable'),
    muteUser,
    announceUserNotBannable
)));

//----------------------------------------------------------------------------------------------------------------------

const checkIfStillPlayingGame = R.pipe(R.prop('user'), checkIfPlayingGame);
/*
const getGameName = (member) => member.user.presence?.activities
    .find(activity => activity.type.toString() === 'PLAYING').name.toLowerCase();

 */
const checkIfPLayingSameBannedGame = (member) => R.equals(getGameName(R.prop('user', member)), R.prop('gamePlayed', member));
//const checkIfPLayingSameBannedGame = R.pipe(R.prop('user'), curriedCheckIfPlayingForbiddenGame);
//const checkIfPLayingSameBannedGame = R.pipe(fn);
const checkWarnedMember = R.pipe(
    R.filter(checkIfStillPlayingGame),
    R.filter(checkIfPLayingSameBannedGame),
    R.map(R.prop('user')),
    banWarnedMember);

//----------------------------------------------------------------------------------------------------------------------


module.exports = {checkPlayedGameAtInterval};