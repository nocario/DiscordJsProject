const R = require('ramda');

const muteUser = async (user) => await user.disableCommunicationUntil(Date.now() + (2 * 60 * 1000))
const checkIfBannable = R.pipe(
    R.ifElse(
        R.prop('bannable'),
        muteUser,
        R.always(false)
    )
)
const fetchUser = async (reaction, user) => await reaction.message.guild.members.fetch(user.id);
const muteLooser = R.pipe(fetchUser, R.andThen(checkIfBannable));


module.exports = {muteLooser};