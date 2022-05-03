const {MessageEmbed} = require('discord.js');
const data = require('../quiz.json');
const R = require('ramda');
const shuffle = require('shuffle-array');
const wait = require('node:timers/promises').setTimeout;


const launchQuiz = async (robot, message)   => {

	let dataSelected = data.find(el => el.quiz_name === 'antoine c:');

	let results = dataSelected['results'];
	let author = dataSelected['author'];

	for (let i = 0; i < results.length; i++) {

		let correctAnswer = results[i].correct_answer;
		let incorrectAnswers = results[i].incorrect_answers;

		let choices = shuffle(R.concat(incorrectAnswers, [correctAnswer]));

		console.log(choices);
		console.log(correctAnswer);


		// let result;
		let usersWithCorrectAnswer = [];
		let newEmbed = new MessageEmbed();

		const embed = new MessageEmbed()
			.setTitle('✨' + results[i].question + '✨')
			.setColor('YELLOW')
			.setDescription('\n' +
                '\n💛 ' + (choices[0]) + '\n' +
                '\n💚 ' + (choices[1]) + '\n' +
                '\n💙 ' + (choices[2]) + '\n' +
                '\n💜 ' + (choices[3]) + '\n'
			);

		let reactions = ['💛', '💚', '💙', '💜'];
		//let msgEmbed = await message.channel.send({embeds: [embed]});

		//reactions.forEach((reaction) => msgEmbed.react(reaction));

		//let answer = '';

		let index = R.indexOf(correctAnswer);
		let answer = R.nth(index);
		let result = R.map(index, answer);
		console.log(result);


		let t = R.pipe(
			R.map(R.nth(R.indexOf)),
			R.join(''));


		console.log(t(correctAnswer));


		if (correctAnswer === choices[0]) { // TODO : improve method
			answer = '💛';
		} else if (correctAnswer === choices[1]) {
			answer = '💚';
		} else if (correctAnswer === choices[2]) {
			answer = '💙';
		} else {
			answer = '💜';
		}

		/*
           const filter = (reaction, user) => {
               return (reaction.emoji.name === answer) && !user.bot;
           };

           const collector = msgEmbed.createReactionCollector({filter, time: 15000});


           collector.on('collect', (reaction, user) => {
               usersWithCorrectAnswer.push(user.username);
               console.log(usersWithCorrectAnswer);
           })



           collector.on('end', async () => {
               if (usersWithCorrectAnswer.length === 0) {
                   result = newEmbed
                       .setTitle("Time's Up! No one got it.... 🦉")
                       .setDescription('\n The correct answer was ' + correctAnswer)
                       .setColor('YELLOW');
               } else {
                   result = newEmbed
                       .setTitle("Great! Here's who got it first 🍒:")
                       .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                       .setFooter('\n The correct answer was ' + correctAnswer)
                       .setColor('YELLOW');
               }
               message.channel.send({embeds: [result]});
           }); */
		await wait(15000);
	}
};

module.exports = {launchQuiz};
