
const BannedGames = [
    "fortnite",
    ""
]


const checkPlayedGameAtInterval = (client) => {
    setInterval(() => checkOnlineUsersPlayedGame(client), 30 * 60 * 1000);
}

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

                    general.send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`)

                    //guild.channels.cache.get(generalId).send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`)
                    //client.channels.cache.get("").send(`${member.user} you are playing a forbidden game, stop if you don't want to get ban`);
                    warned.push(member);
                }
            }

        })
    }
    setTimeout(() => checkWarnedMember(warned), 5 * 60 * 1000);

}

const checkWarnedMember = (warnedMember) => {
    const banList = [];
    warnedMember.forEach(member => {
        const game = member.presence.activities.find(activity => activity.type === 'PLAYING');
        if (game) {
            if (game.name.toLowerCase() === 'fallout') banList.push(member);
        }
    })
    banWarnedMember(banList);
}

const banWarnedMember = (banList) => {
    banList.forEach(member => {
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

module.exports = {checkPlayedGameAtInterval}