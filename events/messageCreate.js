const {banUwU} = require('../banUwU');

module.exports = {
	name: 'messageCreate',
	async execute(msg) {
		await banUwU(msg);
	},
};