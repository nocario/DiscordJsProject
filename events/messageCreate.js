const R = require("ramda");

const checkUwU = R.pipe(R.prop('content'), R.toLower, R.includes('uwu'));
const muteUser = (member) => member.disableCommunicationUntil(Date.now() + 60 * 1000);
const banUser = R.invoker(0, 'ban');
const banUserIfBannable = R.ifElse(
    R.prop('bannable'),
    muteUser,
    R.always(false)
);
const getUser = async (msg) => await msg.guild.members.fetch(msg.author.id);
const f = R.pipe(getUser, R.andThen(R.pipe(banUserIfBannable)));
const muteUwU = R.pipe(
    R.ifElse(
        checkUwU,
        f,
        R.always(false)
    )
);
module.exports = {
    name: 'messageCreate',
    async execute(msg) {
        await muteUwU(msg);
    },
};