const R = require('ramda')
const {find, assoc, cond} = require("ramda");



const BannedGames = [
    "fortnite",
    "fallout"
]
//const INTERVALL_CHECK_WARNING = 30 * 60 * 1000;
//const INTERVALL_CHECK_BAN = 5 * 60 * 1000;
const INTERVALL_CHECK_WARNING = 5 * 1000;
const INTERVALL_CHECK_BAN = 2 * 1000;

const checkPlayedGameAtInterval = (client) => setInterval(() => checkOnlineUsersPlayedGame(client), INTERVALL_CHECK_WARNING);

//----------------------------------------------------------------------------------------------------------------------
const constructObjectMemberGamePlayed =  (member) => {
    return {'user': member, 'gamePlayed': member.presence?.activities
            .find(activity => activity.type === 'PLAYING').name.toLowerCase()}
}
const sendWarning = async (member) => member.user.guild.channels.cache.find(channel => channel.name === "general")
    .send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);

const checkIfPlayingGame = (member) => member.presence?.activities.find(activity => activity.type === 'PLAYING');
const checkIfPlayingForbiddenGame = (bannedGames, member) => bannedGames.includes(member?.presence?.activities
    .find(activity => activity.type === 'PLAYING').name.toLowerCase());
const curriedCheckIfPlayingForbiddenGame = R.curry(checkIfPlayingForbiddenGame)(BannedGames);

const timeOutWarning = (warned) => setTimeout(() => checkWarnedMember(warned), 2000)

const checkIfMemberIsOnline = async (guild) => await guild.members.fetch({withPresences: true});
const getOnlineMembers = R.pipe(R.map(checkIfMemberIsOnline));
const getGuilds = (client) => client.guilds.cache.map(guild => client.guilds.cache.get(guild.id));
const concatGuildsOnlineMember = (arrays) => {
    const newArr = [];
    for (const arr of arrays) newArr.push(...arr.values())
    return newArr;
}
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

const findIfPlaying = R.pipe(R.find(R.propEq('type', 'PLAYING')));
const checkIfStillPlayingBannedGame = (game, gamePlayed) => R.equals(R.toLower(R.prop('name', game)), gamePlayed);
const test = (element) => R.cond([
    [findIfPlaying(element.user.presence.activities),
        checkIfStillPlayingBannedGame(findIfPlaying(element.user.presence.activities), R.prop('gamePlayed', element))]
    ]
)

const f3 = R.pipe(R.filter(test));
const checkWarnedMember = (warned) => banWarnedMember(R.map(R.prop('user'), f3(warned)));
/*
const checkWarnedMember = (warnedMember) => {
    const banList = [];
    console.log(f3(warnedMember));
    warnedMember.forEach(element => {
        const member = element.user;
        const gamePlayed = element.gamePlayed;
        const game = member.presence.activities.find(activity => activity.type === 'PLAYING');
        if (game) {
            if (game.name.toLowerCase() === gamePlayed) banList.push(member);
        }
    })
    banWarnedMember(banList);
}

 */

//----------------------------------------------------------------------------------------------------------------------

const annonceUserNotBannable = (member) => member.guild.channels.cache.find(channel => channel.name === "general")
                                .send(`${member.user} cannot be banned unfortunately`);



const annonceUserBan = (member) => member.guild.channels.cache.find(channel => channel.name === "general")
        .send(`${member.user} has been banned`);

const banUser = R.pipe(R.invoker(0, 'ban'), R.andThen(annonceUserBan));
const f = R.invoker(1, "disableCommunicationUntil");
const muteUser = (member) => {
    const m = Date.now() + 1 * 60 * 1000;
    f(m, member);
    annonceUserBan(member);
}
const checkAndBan = R.pipe(
    R.ifElse(
        R.prop("bannable"),
        muteUser,  //j'utilise mute pour pas avoir à me unban a chaque fois
        annonceUserNotBannable
        ));

const banWarnedMember = R.pipe(R.forEach(checkAndBan));
/*
const banWarnedMember = (banList) => {
    banList.forEach(member => {
            checkAndBan(member);

            if (member.bannable) {
                member.ban();
            }
            else {
                const general = member.guild.channels.cache.find(channel => channel.name === "general");
                general.send(`${member.user} cannot be banned unfortunately`);
            }


        }
    )
}

 */

module.exports = {checkPlayedGameAtInterval, BannedGames};