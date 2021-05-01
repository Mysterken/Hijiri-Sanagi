const { prefix, botColor } = require('../../config.json');
const { Kana } = require('../../data/kanaDB.json')
const Discord = require('discord.js');

module.exports = {

	name: 'kana',
	description: 'Display a random Kana out of my database or search for one, an image of the Kana, it\'s romaji and a link to a Wikipedia page of it will then be displayed.',
	aliases: ['hiragana', 'hira', 'katakana', 'kata'],
	usage: `**[ ${prefix}kana <string> ]**`,
    arguments: "`string`: The romaji or the Kana form of the wanted Kana.",
	require: ['message', 'args', 'commandName'],

	execute(argsArray) {

		const message = argsArray[0];
        const args = argsArray[1];
        const commandName = argsArray[2];

        var vr = ["hiragana", "katakana"];
        let resolved = false;
        let key = 'k'+(Math.floor(Math.random() * 76)+1)

        if (['hiragana', 'hira'].includes(commandName)) vr = vr.splice(0, 1);
        else if (['katakana', 'kata'].includes(commandName)) vr = vr.splice(1, 1);

        // Random number to chose between hiragana and katakana
        let c = Math.floor(Math.random() * (vr.length));

        if (args[0]) {

            for (let i = 1; i < 77; i++) {
                
                if ((Kana['k'+i][vr[c]].romaji === args[0].toUpperCase() || Kana['k'+i][vr[c]].char === args[0]) && commandName != 'kana' ) resolved = true;
                else if (Kana['k'+i].hiragana.char === args[0]) {
                    resolved = true;
                    vr[c] = 'hiragana';
                } else if (Kana['k'+i].katakana.char === args[0]) {
                    resolved = true;
                    vr[c] = 'katakana';
                }

                // Exit loop and give key when resolved
                if (resolved) {
                    key = 'k'+i;
                    break
                }
            }
            if (!resolved && commandName === 'kana') return message.reply(`Sorry but i couldn't find *${args[0]}* in my database.\nIf you're giving me a romaji use \`${prefix}hiragana\` or \`${prefix}katakana\` instead.`);
            else if (!resolved) return message.reply(`Sorry but i couldn't find *${args[0]}* in my database, check if you wrote it correctly.`)
        }

        let kanaEmbed = new Discord.MessageEmbed()
			.setColor(botColor)
            .setTitle(`${Kana[key][vr[c]].char} | ${Kana[key][vr[c]].romaji}`)
            .setURL(`https://en.wikipedia.org/wiki/${Kana[key][vr[c]].char}`)
            .setImage(Kana[key][vr[c]].link)
            .setFooter(vr[c][0].toUpperCase() + vr[c].slice(1))

        return message.channel.send(kanaEmbed);
	}
}