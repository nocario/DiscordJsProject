const R = require('ramda')



const BannedGames = [
    "fortnite",
    ""
]
//const INTERVALL_CHECK_WARNING = 30 * 60 * 1000;
//const INTERVALL_CHECK_BAN = 5 * 60 * 1000;
const INTERVALL_CHECK_WARNING = 10 * 1000;
const INTERVALL_CHECK_BAN = 5 * 1000;
const checkPlayedGameAtInterval = (client, bannedGames) => setInterval(() => checkOnlineUsersPlayedGame(client), INTERVALL_CHECK_WARNING);

const checkOnlineUsersPlayedGame = async (client) => {
    const guilds = client.guilds.cache.map(guild => client.guilds.cache.get(guild.id));
    const warned = [];
    for (const guild of guilds) {
        const members = await guild.members.fetch({withPresences: true});
        const onlineMembers = members.filter(member => member.presence?.status === 'online');


        onlineMembers.forEach(member => {
            const general = guild.channels.cache.find(channel => channel.name === "general");
            const game = member.presence.activities.find(activity => activity.type.toString() === 'PLAYING');

            if (game) {

                if (game.name.toLowerCase() === 'fallout') {

                    general.send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);

                    //guild.channels.cache.get(generalId).send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`)
                    //client.channels.cache.get("").send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);
                    warned.push({"user": member, "gamePlayed":game.name.toLowerCase()});
                }
            }

        })
    }
    setTimeout(() => checkWarnedMember(warned), INTERVALL_CHECK_BAN);

}

const checkWarnedMember = (warnedMember) => {
    const banList = [];
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



//const banUser = R.juxt([R.invoker(0, 'ban'), R.andThen(annonceUserBan)]);

//disableCommunicationUntil(Date.now() + (1 * 60 * 1000), 'i can mute you')
const f = R.invoker(1, "disableCommunicationUntil");


const userNotBannable = (member) => member.guild.channels.cache.find(channel => channel.name === "general")
                                .send(`${member.user} cannot be banned unfortunately`);

const annonceUserBan = (member) => {
    member.guild.channels.cache.find(channel => channel.name === "general")
        .send(`${member.user} has been banned`)
}
const banUser = R.pipe(R.invoker(0, 'ban'), R.andThen(annonceUserBan));
const muteUser = R.pipe(f(Date.now() + (1 * 60 * 1000)), R.andThen(annonceUserBan));
const checkAndBan = R.pipe(
    R.ifElse(
        R.prop("bannable"),
        muteUser,  //j'utilise mute pour pas avoir à me unban a chaque fois
        userNotBannable
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

module.exports = {checkPlayedGameAtInterval, BannedGames}