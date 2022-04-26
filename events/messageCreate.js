const R = require("ramda");

const isBiggus = R.pipe(R.test(/^Biggus$/));
module.exports = {
    name: 'messageCreate',
    execute(msg) {
        if (isBiggus(msg.content)) {
            msg.reply("https://www.youtube.com/watch?v=yzgS61zgPEg");
        }
        //msg.delete();
        //setTimeout(() => msg.delete(), 5000);
    },
};