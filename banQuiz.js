const R = require('ramda');

const announceUserNotBannable = member => member.guild.channels.cache.find(channel => channel.name === 'general')
    .send(`${member} will not be banned despite loosing the quiz`);
const annonceUserBan = member => member.guild.channels.cache.find(channel => channel.name === 'general')
    .send(`${member} has been banned for having the lowest score on the quiz`);

const banUser = R.pipe(R.invoker(0, 'ban'), R.andThen(annonceUserBan));
const checkIfBannable = R.pipe(
    R.ifElse(
        R.prop('bannable'),
        R.always(true),
        announceUserNotBannable
    )
);
const diff = (a,b) => { return a[1] - b[1]; }
const getLowestScoringPlayer = R.pipe(R.toPairs, R.sort(diff), R.head, R.head);
const fetchPlayer = async (interaction, userId) => await interaction.guild.members.fetch(userId);

const fetchLowestScoringPlayer = R.pipe(fetchPlayer, R.andThen(checkIfBannable));
module.exports = {fetchLowestScoringPlayer};