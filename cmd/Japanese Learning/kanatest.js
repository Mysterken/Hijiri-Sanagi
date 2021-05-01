const { prefix, botColor } = require('../../config.json');
const { Kana } = require('../../data/kanaDB.json')
const Discord = require('discord.js');

module.exports = {

	name: 'kanatest',
	description: 'Start a game of KanaTest where the goal is to write the romaji of the displayed Kana.\n'+
                `You can play the Hiragana only or Katakana only variant with \`${prefix}hiraganatest\` or \`${prefix}katakanatest\`.\n`+
                'The game option\'s can be modified, type "def" instead of the argument to use the default value.\n'+
                'This game can be played in multiplayer.',
	aliases: ['knt', 'hiraganatest', 'ht', 'katakanatest', 'kt'],
	usage: `**[ ${prefix}kanatest <length> <difficulty> <attempt> ]**`,
	arguments: "`length`: The test length (default 15).\n"+
                "`difficulty`: The Kana displayed from the list (default 76).\n"+
                "`attempt`: The number of attempt a player is given. (default 3)",
	require: ['message', 'args', 'commandName'],

    execute(argsArray) {

        const message = argsArray[0];
        const args = argsArray[1];
        const commandName = argsArray[2];

        const filter = (m) => !m.author.bot;
        var playerArr = [];
        var player = {};
        var variants = ["katakana", "hiragana"];
        var timer = 15000;
        var index = 1;
        var answer;

        var a = [...args];
        var length = a.shift() ?? 'def';
        var difficulty = a.shift() ?? 'def';
        var attempt = a.shift() ?? 'def';

        let gameEmbed = new Discord.MessageEmbed()
			.setColor(botColor)

        function randomize(vr) { 

            let c = Math.floor(Math.random() * (vr.length));
            let key = 'k'+(Math.floor(Math.random() * difficulty)+1)

            gameEmbed.setTitle(Kana[key][vr[c]].char);
			gameEmbed.setImage(Kana[key][vr[c]].link);
			gameEmbed.setFooter(`${index}/${length}`);

            return Kana[key][vr[c]].romaji
        }

        function checkLB(place, user, answer) {
            switch (place) {
                case 1:
                    return message.channel.send(`:first_place: **${user.username}** | **${answer}** good answer`);
                case 2:
                    return message.channel.send(`:second_place: **${user.username}** | **${answer}** good answer`);
                case 3:
                    return message.channel.send(`:third_place: **${user.username}** | **${answer}** good answer`);
            }
        }
        
        if (!args[0]) {
            length = '15';
            difficulty = '76';
            attempt = '3';
        }

        length = length === 'def' ? 15 : parseInt(length) ? parseInt(length) : 'invalid';
        difficulty = difficulty === 'def' ? 76 : parseInt(difficulty) ? parseInt(difficulty) : 'invalid';
        attempt = attempt === 'def' ? 3 : parseInt(attempt) ? parseInt(attempt) : 'invalid';

        if (length === 'invalid' || length < 0) return message.reply(`*<length>* should be a positive number.`);
        else if (difficulty === 'invalid' || difficulty < 0 || difficulty > 76) return message.reply(`*<difficulty>* should be a positive number not greater than 76.`);
        else if (attempt === 'invalid' || attempt < 0) return message.reply(`*<attempt>* should be a positive number.`);

        if (['katakanatest', 'kt'].includes(commandName)) variant = variants.splice(1, 1);
        else if (['hiraganatest', 'ht'].includes(commandName)) variant = variants.splice(0, 1);
		
        answer = randomize(variants);
        
        return message.channel.send(gameEmbed).then(msg => {

            const Quizz = message.channel.createMessageCollector(filter, { time: timer });

            Quizz.on('collect', m => {

                m.content = m.content.toUpperCase();

                if (m.content === "STOP") return Quizz.stop()
                
                if (!playerArr.includes(m.author)) {
                    playerArr.push(m.author)
                    player[m.author.id] = {
                        life: attempt,
                        goodAnswer: 0
                    }
                }

                // Correct answer given
                if (m.content === answer && player[m.author.id]['life'] > 0) { 

                    Quizz.resetTimer([{ time: timer }]);
                    player[m.author.id]['goodAnswer']++;
                    index++;

                    if (index-1 != length) {
                        answer = randomize(variants);
                        msg.edit(gameEmbed);
                    } else Quizz.stop();

                } else if (m.content !== answer && player[m.author.id]['life'] > 0) { 

                    player[m.author.id]['life']--;

                    message.channel.send(`Wrong answer! ${m.author.username}! | ${player[m.author.id]['life']} attempt(s) remaining.`)
                    .then(mes => { mes.delete({ timeout: 1000 }) });

                } else if (player[m.author.id]['life'] <= 0) {

                    message.channel.send(`You don't have any more attempt ${m.author.username}!`)
                    .then(mes => { mes.delete({ timeout: 1000 }) });
                }
                // Delete message only if not in DM
                if (message.channel.type != 'dm' && message.channel.permissionsFor(message.author).has('MANAGE_MESSAGES')) m.delete(); 
            })

            Quizz.on('end', () => {

                let x = 0;
                let lb = [];

                for (const [key, value] of Object.entries(player)) lb.push([key, value.goodAnswer]);
                lb.sort((a, b) => b[1] - a[1]);

                for (let p of lb) {
                    x++;
                    for (let u of playerArr) {
                        if (p[0] === u.id) {
                            checkLB(x, u, p[1]); // Assign place in the lb for the user
                            break
                        }
                    }
                }
                return message.channel.send(`End of the game.`);
            })
        })
	}
}