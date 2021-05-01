const { prefix, botColor } = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');

module.exports = {

	name: 'summary',
	description: 'A report of currently available lessons and reviews for the user.',
	aliases: ['sum','report'],
    path: ['summary'],
	usage: `**[ ${prefix}wanikani summary ]**`,
	
    execute(message, args, data) {

		const summary = data[0];

		const { hijiriDB } = message.client;
		subjectsDB = hijiriDB.db().collection("subjects");

		let lessons = []
		for (let l of summary.data.lessons[0].subject_ids) if (l) lessons.push(l);
		lessons.sort((a, b) => a-b);

		let reviews = [];
		for (let r of summary.data.reviews[0].subject_ids) if (r) reviews.push(r);
		reviews.sort((a, b) => a-b);

		function subjectFetch (ID) { return subjectsDB.findOne({ id: ID}) }

		let lessonsPromise = []
		for (let l in lessons) lessonsPromise.push(subjectFetch(lessons[l]));

		let reviewsPromise = []
		for (let r in reviews) reviewsPromise.push(subjectFetch(reviews[r]));

		return Promise.all(lessonsPromise.concat(reviewsPromise)).then(arr => {

			lessons = arr.splice(0, lessons.length)
			let lessonsChar = [];
			let reviewsChar = [];

			for (let l of lessons) lessonsChar.push(l.data.characters);
			for (let r of arr) reviewsChar.push(r.data.characters)

			let lessonsField = lessonsChar.length?("`" + lessonsChar.join("` `")) + "`" : 'None';
			let reviewsField = reviewsChar.length?("`" + reviewsChar.join("` `")) + "`" : 'None';

			let summaryEmbed = new Discord.MessageEmbed()
				.setColor(botColor)
				.setTitle(`📚 Summary`)
				.addFields(
				{ name: `Lessons [${lessons.length}]`, value: lessonsField },
				{ name: `Reviews [${reviews.length}]`, value: reviewsField }
				)
				.attachFiles(['data/img/Wanikani_transparent_logo.png'])
				.setThumbnail('attachment://Wanikani_transparent_logo.png');

			return message.channel.send(summaryEmbed);
		})
		.catch(err => {
			console.error(err);
			message.reply("There has been an error while fetching subjects from the database. Try again later.")
		})

		
	}
}