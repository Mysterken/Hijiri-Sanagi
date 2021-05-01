const { prefix } = require('../../config.json');
const Separator = '|';

module.exports = {

	name: 'pick',
	description: `I'll help you pick between multiple choice!`,
	aliases: ['choose'],
	usage: `**[ ${prefix}pick <string> ${Separator} <string> ]**`,
    arguments: "`string`: A choice",
	require: ['message', 'litteralStr'],
    
	execute(argsArray) {

		const message = argsArray[0];
		const litteralStr = argsArray[1];

        const choices = litteralStr.split(Separator);
        for (let c of choices) choices[choices.indexOf(c)] = c.trim();
        while (choices.indexOf('') != -1) choices.splice(choices.indexOf(''), 1);
        const Random = Math.floor(Math.random() * (choices.length));

        if (choices.length < 2) return message.reply(`Sorry but you need to give me at least 2 choices to pick from`);
        return message.channel.send(` Hmmm... I pick: **${choices[Random]}**`);

    }
}