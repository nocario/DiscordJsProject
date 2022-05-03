const {MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const R = require('ramda');

const createQuiz = async (robot, message)  => {

	let quiz_name;
	let author_name;
	let results = [];

	const embed = new MessageEmbed() // on peut également definir le temps de reponse
		.setTitle('✨Quiz Generator✨')
		.setColor('YELLOW')
		.setFooter({text : 'To stop, use the command -stop.'})
		.setDescription(
			'Welcome to the !c command. To create your quiz you need to send ' +
            'the text in a multiline format following the next pattern: ' +'\n'+
            '\n' + 'Question?' +
            '\n' + 'Correct answer' +
            '\n' + 'Incorrect answers, separated by commas (3 max)' +'\n'+
            '\n' + 'Example:' +
            '\n' + 'Which language is out of place?'  +
            '\n' + 'HTML' +
            '\n' + 'Java, C++, JavaScript'
		);

	message.channel.send({embeds: [embed]});

	const filter = message => !message.author.bot;
	const collector = await message.channel.createMessageCollector( {filter});

	for await (const msg of collector) {
		if (msg.content === '-stop') {
			message.reply('To finalize, please send -stop + the name for your quiz:');
			collector.stop();
		}
		if (msg.content.includes('-stop')) {
			let line = R.map(R.trim, R.split(' ', msg.content));

			let result = R.pipe(
				R.drop(1),
				R.join(' '));

			quiz_name = result(line);
			author_name = msg.author;

			collector.stop();
		}
		else {
			const lines = R.map(R.trim, R.split('\n', msg.content));
			const result = R.map(
				R.assoc('incorrect_answers', R.split(',', R.last(lines))),
				R.zipObj(['question', 'correct_answer', 'incorrect_answers']));

			results.push(result(lines));

			message.reply(`Question n°${results.length} added. Write another one or stop with -stop.`);
		}
	}

	const quiz = R.zipObj(['quiz_name', 'author', 'results'], [quiz_name, [author_name], results]);


	fs.writeFile('quiz.json', JSON.stringify([quiz],null,2),
		function(err, result) {
			if(err) console.log('error', err);
		});
};

module.exports = {createQuiz};
