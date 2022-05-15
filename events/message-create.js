const { banUwU } = require('../ban-uwu');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		await banUwU(message);
	},
};
