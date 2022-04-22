const {checkPlayedGameAtInterval, BannedGames} = require("../Ban.js");

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready!! Logged in as ${client.user.tag}`);
        checkPlayedGameAtInterval(client, BannedGames);
    },
};

/*
const checkPlayedGameAtInterval = (client) => {
    setInterval(() => checkOnlineUsersPlayedGame(client), 30 * 60 * 1000);
}

const checkOnlineUsersPlayedGame = async (client) => {
    const guild = client.guilds.cache.get(guildId);
    const members = await guild.members.fetch({withPresences: true});
    const onlineMembers = members.filter(member => member.presence?.status === 'online');

    const warned = [];
    const v = onlineMembers.forEach(member => {
        const game = member.presence.activities.find(activity => activity.type.toString() === 'PLAYING');
        if (game) {
            if (game.name.toLowerCase() === 'fallout') {
                client.channels.cache.get("963428264272080977").send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);
                warned.push(member);
            }
        }
    })

    setTimeout(() => checkWarnedMember(warned, client), 5 * 60 * 1000);
}

const checkWarnedMember = (warnedMember, client) => {
    const banList = [];
    warnedMember.forEach(member => {
        const game = member.presence.activities.find(activity => activity.type === 'PLAYING');
        if (game) {
            if (game.name.toLowerCase() === 'fallout') banList.push(member);
        }
    })
    banWarnedMember(banList, client);
}

const banWarnedMember = (banList, client) => {
    banList.forEach(member => {
        if (member.bannable) {
            member.ban()
        }
        else client.channels.cache.get("963428264272080977").send(`${member.user} cannot be banned, unfortunately`);
        }
    )
}

 */