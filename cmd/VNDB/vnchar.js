const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'vnchar',
	description: `Fetch information on a visual novel character from VNDB.`,
    aliases: ['vnc', 'vncharid', 'vncid'],
	usage: `**[ ${prefix}vnchar <name> ]**\n`+
            `**[ ${prefix}vncharid <id> ]**`,
    arguments: "`name`: The name of the character."+
                "`id`: The id of the character.",
	require: ['message', 'litteralStr', 'args', 'commandName', 'serverDB'],
    
	execute(argsArray) {

		const message = argsArray[0];
		const litteralStr = argsArray[1].trim();
		const args = argsArray[2];
        const commandName = argsArray[3];
        const serverDB = argsArray[4];

        const { VNDB } = message.client;
        var p = 1;
        var searchID;

        var sexLv;
        var violenceLv;

        if (['vncharid', 'vncid'].includes(commandName)) {
            if (!args[0]) return message.reply(`You need to input the id of the character!`);
            searchID = args[0];
        } else if (!litteralStr) return message.reply(`You need to specify the character's name!`)

        return new Promise((resolve, reject) => {

            if (message.channel.type === 'dm' || message.channel.nsfw) sexLv = violenceLv = 2; 
            else {
                serverDB.findOne({ serverID: message.guild.id }, (err, res) => {

                    if (err) {
                        console.error(err);
                        return message.reply("Couldn't connect to the database. Try later.");
                    } else if (!res) return reject("Couldn't find the server in the database.")

                    sexLv = res.vndbSexLV;
                    violenceLv = res.vndbViolenceLV;
                    return resolve();
                })
            }
        }).then(() => {
            
            // Change string to unicode emoji
            function charGender(g) { return g === 'm' ? '♂' : g === 'f' ? '♀' : g === 'b' ? '⚥' : '❓'} 
		
            VNDB.once('data', data => {

                // Remove empty char at the end of each response
                data = data.slice(0, -1); 
                if (data.slice(0, data.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                data = JSON.parse(data.substring(data.indexOf('{')));

                function sendMatch() {

                    var matchIndex = 0;
                    let matchArr = [];

                    // Change this to tweak the number of match displayed by page, max 25
                    const fieldAmount = 10; 
                    const pageLength = Math.ceil(matchedChar.length/fieldAmount);

                    let charEmbed = new Discord.MessageEmbed()
                        .setColor(botColor)
                        .setTitle(`Found ${matchedChar.length} match!`)
                    
                    while (matchedChar.length) matchArr.push(matchedChar.splice(0, fieldAmount));
                    
                    for (let c of matchArr[matchIndex]) charEmbed.addField (c.name, `${charGender(c.gender)} **|** \`${c.id}\` ${c.original?'**|**'+c.original:''}`);

                    if (!matchArr[1]) return message.channel.send(charEmbed);
                    else charEmbed.setFooter(`1/${pageLength}`);

                    return message.channel.send(charEmbed).then(msg => {
                            
                        msg.react('◀️').then(() => {
                            msg.react('▶️').then(() => {
                                
                                const filter = (reaction, user) => {
                                    if (user.bot) return;
                                    else if (reaction.emoji.name === '◀️') { matchIndex--; return true }
                                    else if (reaction.emoji.name === '▶️'){ matchIndex++; return true }
                                }
        
                                const react = msg.createReactionCollector(filter, { time: 60000 });
        
                                react.on('collect', () => {
        
                                    if (matchIndex < 0) matchIndex = matchArr.length-1;
                                    else if (matchIndex > matchArr.length-1) matchIndex = 0;
        
                                    charEmbed.spliceFields(0, 10);
                                    for (let c of matchArr[matchIndex]) charEmbed.addField(c.name, `${charGender(c.gender)} **|** ${c.original?c.original+'**|**':''} \`${c.id}\``);
                                    charEmbed.setFooter(`${matchIndex+1}/${pageLength}`)
        
                                    msg.edit(charEmbed)
                                    
                                })
                            })
                        })
                    })
                }
                
                function requestChar() {

                    VNDB.prependOnceListener('data', charMatch => {

                        // Remove empty char at the end of each response
                        charMatch = charMatch.slice(0, -1); 
                        if (charMatch.slice(0, charMatch.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                        charMatch = JSON.parse(charMatch.substring(charMatch.indexOf('{')));

                        for (let c of charMatch.items) matchedChar.push(c);

                        // Recursively request for the next page
                        if (charMatch.more) return requestChar() 
                        else return sendMatch()
                    })
                    
                    return VNDB.write(`get character basic (search ~ "${litteralStr}") {"results":25,"page":${p++}}\u0004`);
                } 

                if (!data.num) return message.channel.send(`I found no match for *${litteralStr}*`);
                else if (data.num > 1) {

                    var matchedChar = [];

                    for (let c of data.items) matchedChar.push(c);

                    if (data.more) return requestChar()
                    else return sendMatch()
                    
                }

                VNDB.prependOnceListener('data', data => {

                    data = data.slice(0, -1);
                    if (data.slice(0, data.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                    data = JSON.parse(data.substring(data.indexOf('{')));

                    let char = data.items[0]
                    let charIMG = char.image

                    function shorten(txt) { // Cleverly cut the description based on last paragraph or punctuation
                        
                        const maxLength = 650; // Max embed limit is 2048, here this value cut the character description length.

                        if (!txt) return `There's no description.`;
                        //if (txt.indexOf('\n\n[') != -1) txt = txt.slice(0, txt.indexOf('\n\n[')); // Cut everything after first hyperlink
                        while (txt.match(/(\n){2}\[.+\]\]/)) txt = txt.replace(txt.match(/(\n){2}\[.+\]\]/)[0], ''); // Regex to delete string in nested hyperlinks markdown
                        while (txt.match(/(\n){2}\[.+\]/)) txt = txt.replace(txt.match(/(\n){2}\[.+\]/)[0], '');
                        while (txt.match(/\[.+?]/)) txt = txt.replace(txt.match(/\[.+?]/)[0], '');

                        if (txt.length > maxLength) {
                            
                            let cut = '\n\n'; // Change this to cut by another set of strings '.' <= this cut by last period
                            txt = txt.slice(0, maxLength-txt.length-6);
                            
                            if (txt.lastIndexOf(cut) != -1) txt = txt.slice(0, txt.lastIndexOf(cut));
                            else {
                                let arr = [];
                                for (let p of ['.', '?', '!']) arr.push(txt.lastIndexOf(p));
                                txt = txt.slice(0, arr.sort((a, b) => b - a)[0]+1);
                            }

                            txt = txt + ' **[...]**';
                        }
                        return txt;
                    }

                    function birthdayCheck(bd) {

                        let month = {
                            1:'January', 2:'February', 3:'March', 4:'April', 5:'May', 6:'June',
                            7:'July', 8:'August', 9:'September', 10:'October', 11:'November', 12:'December'
                        }

                        if (!bd[0]) return 'Unknown';
                        else if (!bd[1]) return month[bd[0]];
                        return `${bd[0]} ${month[bd[1]]}`
                    }

                    if (char.image_flagging.violence_avg > violenceLv || char.image_flagging.sexual_avg > sexLv) charIMG = ''; // Replace by NSFW warning todo

                    let charEmbed = new Discord.MessageEmbed()
                        .setColor(botColor)
                        .setTitle(char.name)
                        .setURL(`https://vndb.org/c${char.id}`)
                        .setDescription(shorten(char.description) || 'No description available')
                        .setImage(charIMG)
                        .setFooter(`Character id: ${char.id}`)

                    if (char.original) charEmbed.addField('Original name', char.original, true);
                    if (char.aliases) charEmbed.addField('aliases', `\`${char.aliases.split('\n').join("` `")}\``, true);
                    
                    charEmbed.addField('Gender | Blood type', `${charGender(char.gender)} **|** ${char.bloodt?char.bloodt.toUpperCase():'❓'}`, true);
                    if (char.height || char.weight || char.bust || char.waist || char.hip) charEmbed.addField('Measurement', `Height: ${char.height ?? '? '}cm\nWeight: ${char.weight ?? '? '}kg\nBust-Waist-Hips: ${char.bust||'?'}-${char.waist||'?'}-${char.hip||'?'}cm`, true);
                    if (char.birthday) charEmbed.addField('Birthday', birthdayCheck(char.birthday), true);

                    return message.channel.send(charEmbed)
                })

                searchID = data.items[0].id; // Change id to the only item found's id

                return VNDB.write(`get character basic,details,meas, (id = ${searchID})\u0004`);
            })
            if (!searchID) VNDB.write(`get character basic (search ~ "${litteralStr}") {"results":25,"page":${p++}}\u0004`);
            else VNDB.write(`get character basic (id = ${searchID})\u0004`);
        }).catch(rejected => message.reply(rejected))
	}
}