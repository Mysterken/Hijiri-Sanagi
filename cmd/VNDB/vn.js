const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');
const fs = require('fs');

module.exports = {

	name: 'vn',
	description: `Fetch information on a visual novel from VNDB.`,
    aliases: ['vnid'],
	usage: `**[ ${prefix}vn <title> ]**\n`+
            `**[ ${prefix}vnid <id> ]**`,
    arguments: "`title`: The title of the visual novel.\n"+
                "`id`: The id of the visual novel.",
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

        if (commandName === 'vnid') {
            if (!args[0]) return message.reply(`You need to input the id of the visual novel!`);
            searchID = args[0];
        } else if (!litteralStr) return message.reply(`You need to specify the title of the visual novel!`)

        // Promise needed because we need to wait to fetch the toleranceLV of the server
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
                    const pageLength = Math.ceil(matchedVN.length/fieldAmount);
    
                    let vnEmbed = new Discord.MessageEmbed()
                        .setColor(botColor)
                        .setTitle(`Found ${matchedVN.length} match!`)
                        .setDescription('Released | Rating | id');
       
                    while (matchedVN.length) matchArr.push(matchedVN.splice(0, fieldAmount));
                    
                    for (let v of matchArr[0]) vnEmbed.addField (v.title, `${v.released} **|** ${v.rating} **|** \`${v.id}\``);
    
                    if (!matchArr[1]) return message.channel.send(vnEmbed);
                    else vnEmbed.setFooter(`1/${pageLength}`);
    
                    return message.channel.send(vnEmbed).then(msg => {
                            
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
        
                                    vnEmbed.spliceFields(0, 10);
                                    for (let v of matchArr[matchIndex]) vnEmbed.addField (v.title, `${v.released} **|** ${v.rating} **|** \`${v.id}\``);
                                    vnEmbed.setFooter(`${matchIndex+1}/${pageLength}`)
        
                                    msg.edit(vnEmbed)
                                    
                                })
                            })
                        })
                    })
                }
                
                function requestVN() {
    
                    VNDB.prependOnceListener('data', vnMatch => {
    
                        vnMatch = vnMatch.slice(0, -1);
                        if (vnMatch.slice(0, vnMatch.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                        vnMatch = JSON.parse(vnMatch.substring(vnMatch.indexOf('{')));
    
                        for (let v of vnMatch.items) matchedVN.push(v);
    
                        if (vnMatch.more) return requestVN()
                        else return sendMatch()
                    })
    
                    return VNDB.write(`get vn basic,stats (search ~ "${litteralStr}") {"results":25,"page":${p++}}\u0004`);
                }
    
                for (let a in args) args[a] = args[a].toLowerCase();
    
                if (!data.num) return message.channel.send(`I found no match for *${litteralStr}*`);
                else if (data.num > 1) {
    
                    var matchedVN = [];
    
                    for (let v of data.items) matchedVN.push(v);
    
                    if (data.more) return requestVN()
                    else return sendMatch()
                }

                // Need to do it first because the request is different
                if (searchID && ['characters', 'c'].includes(args[1])) { 
    
                    var vn = data.items[0];
                    var char = [];
                    
                    function requestChar() {
        
                        VNDB.prependOnceListener('data', ch => {
        
                            ch = ch.slice(0, -1);
                            if (ch.slice(0, ch.indexOf('{')-1) == 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                            ch = JSON.parse(ch.substring(ch.indexOf('{')));
        
                            for (let i of ch.items) char.push(i);
        
                            if (ch.more) return requestChar()
    
                            let protag = [];
                            let mainChar = [];
                            let sideChar = [];
                            let appearChar = [];
    
                            for (let c of char) {
                                for (let v of c.vns) {
                                    if (v[0] == vn.id) {
                                        if (v[2] > 0) break; // Avoid spoilers
                                        else if (v[3] == 'main') protag.push(c);
                                        else if (v[3] == 'primary') mainChar.push(c);
                                        else if (v[3] == 'side') sideChar.push(c);
                                        else if (v[3] == 'appears') appearChar.push(c);
                                        break
                                    }
                                }
                            }
    
                            function charName(arr) {
                                let str = '';
                                function charGender(g) { return g=='m'?'♂':g=='f'?'♀':g=='b'?'⚥':'❓'} // Change string to unicode emoji
                                for (let c of arr) str += `${charGender(c.gender)} ${c.name} **|** \`${c.id}\`\n`;
                                return str
                            }
    
                            var charactersEmbed = new Discord.MessageEmbed()
                                .setColor(botColor)
                                .setTitle(vn.title);
    
                            if (!protag.length && !mainChar.length && !sideChar.length && !appearChar.length) charactersEmbed.setDescription('No character available.');
                            else charactersEmbed.setFooter(`Use [${prefix}vncharid <id>]`);
    
                            if (protag.length) charactersEmbed.addField('Protagonist', charName(protag));
                            if (mainChar.length) charactersEmbed.addField('Main characters', charName(mainChar));
                            if (sideChar.length) charactersEmbed.addField('Side characters', charName(sideChar));
                            if (appearChar.length) charactersEmbed.addField('Make an appearance', charName(appearChar));
    
                            return message.channel.send(charactersEmbed)
                        })
                        return VNDB.write(`get character basic,vns (vn = ${searchID}) {"results":25,"page":${p++}}\u0004`);
                    }
                    return requestChar()
                }
    
                VNDB.prependOnceListener('data', data => {
    
                    data = data.slice(0, -1);
                    if (data.slice(0, data.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                    data = JSON.parse(data.substring(data.indexOf('{')));
    
                    let vn = data.items[0];
                    let img = [];
                    let thumbnail = vn.image;
    
                    var index = 0;
    
                    for (let s of vn.screens) {
                        if (s.flagging.violence_avg <= violenceLv && s.flagging.sexual_avg <= sexLv) img.push(s.image);
                    }
                    
                    if (searchID && ['tags', 't'].includes(args[1])) {
    
                        const tags = JSON.parse(fs.readFileSync('./data/vndb-tags.json', 'utf8'));
                        if (!tags) return message.reply(`There has been an error while reading the database.`)
    
                        let contentTags = '';
                        let eroTags = '';
                        let technicalTags = '';
    
                        for (let t of vn.tags) {
    
                            if (t[2] > 0) continue; // Skip tag if there's spoiler
                            let tagObj = tags.find(tag => tag.id == t[0]);
    
                            if (tagObj) {
                                if (tagObj.cat === 'cont') contentTags += "`" + tagObj.name + "` ";
                                else if (tagObj.cat === 'ero') eroTags += "`" + tagObj.name + "` ";
                                else if (tagObj.cat === 'tech') technicalTags += "`" + tagObj.name + "` ";
                            }
                        }
                        
                        let tagsEmbed = new Discord.MessageEmbed()
                            .setColor(botColor)
                            .setTitle(vn.title)
    
                        if (!args[2] || ['content', 'c'].includes(args[2])) {
                            tagsEmbed.setDescription(contentTags || 'None');
                            tagsEmbed.setFooter('Content');
                        } else if (['sexual', 's'].includes(args[2])) {
                            tagsEmbed.setDescription(eroTags || 'None');
                            tagsEmbed.setFooter('Sexual Content');
                        } else if (['technical', 't'].includes(args[2])) {
                            tagsEmbed.setDescription(technicalTags || 'None');
                            tagsEmbed.setFooter('Technical');
                        } else return message.reply(`Sorry but *${args[2]}* isn't a valid tag category use either "content", "sexual" or "technical".`);
    
                        return message.channel.send(tagsEmbed);
    
                    } else if (searchID && ['screenshots', 's'].includes(args[1])) {
    
                        var screenshotsEmbed = new Discord.MessageEmbed()
                            .setColor(botColor)
                            .setTitle(vn.title)
                            
                        if (img.length) {
                            screenshotsEmbed.setImage(img[index]);
                            screenshotsEmbed.setFooter(`${index+1}/${img.length}`);
                        } else {
                            screenshotsEmbed.setDescription('No screenshots are available.');
                            return message.channel.send(screenshotsEmbed);
                        }
    
                        return message.channel.send(screenshotsEmbed).then(msg => {
                            
                            msg.react('◀️').then(() => {
                                msg.react('▶️').then(() => {
                                    
                                    const filter = (reaction, user) => {
                                        if (user.bot) return;
                                        else if (reaction.emoji.name === '◀️') { index--; return true }
                                        else if (reaction.emoji.name === '▶️'){ index++; return true }
                                    }
            
                                    const react = msg.createReactionCollector(filter, { time: 60000 });
            
                                    react.on('collect', () => {
            
                                        if (index < 0) index = img.length-1;
                                        else if (index > img.length-1) index = 0;
            
                                        screenshotsEmbed.setImage(img[index]);
                                        screenshotsEmbed.setFooter(`${index+1}/${img.length}`);
            
                                        msg.edit(screenshotsEmbed)
                                        
                                    })
                                })
                            })
                        })
                    }
                    
                    // Cleverly cut the description based on last paragraph or punctuation
                    function shorten(txt) { 
                        
                        // Max embed limit is 2048, here this value cut the character description length.
                        const maxLength = 650; 
    
                        if (!txt) return `There's no description.`;
                        //if (txt.indexOf('\n\n[') != -1) txt = txt.slice(0, txt.indexOf('\n\n[')); // <= Cut everything after first hyperlink
                        while (txt.match(/(\n){2}\[.+\]\]/)) txt = txt.replace(txt.match(/(\n){2}\[.+\]\]/)[0], ''); // Regex to delete string in nested hyperlinks markdown
                        while (txt.match(/(\n){2}\[.+\]/)) txt = txt.replace(txt.match(/(\n){2}\[.+\]/)[0], '');
                        while (txt.match(/\[.+?]/)) txt = txt.replace(txt.match(/\[.+?]/)[0], '');
    
                        if (txt.length > maxLength) {
                            
                            // Change this to cut by another set of strings
                            let cut = '\n\n'; 
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
        
                    function propertyCheck (property) {
    
                        let data = vn[property];
    
                        if (!data || !data[0]) return 'None';
                        else if (!Array.isArray(data)) data = data.split('\n');
                        return  "`" + data.join("` `") + "`";
                    }
        
                    function lengthCheck (length) {
                        if (!length) return 'None';
                        else if (length === 1) return 'Very short **(< 2 hours)**';
                        else if (length === 2) return 'Short **(2 - 10 hours)**';
                        else if (length === 3) return 'Medium **(10 - 30 hours)**';
                        else if (length === 4) return 'Long **(30 - 50 hours)**';
                        else return 'Very long **(> 50 hours)**';
                    }

                    let vnEmbed = new Discord.MessageEmbed()
                        .setColor(botColor)
                        .setTitle(vn.title)
                        .setURL(`https://vndb.org/v${vn.id}`)
                        .setDescription(shorten(vn.description))
                        .setThumbnail(thumbnail)
                        .setFooter(`Visual novel ID: ${vn.id}`)

                    if (vn.image_flagging.violence_avg > violenceLv || vn.image_flagging.sexual_avg > sexLv) {
                        vnEmbed.attachFiles(['data/img/NSFW.png']);
                        vnEmbed.setThumbnail('attachment://NSFW.png');
                    }

                    if (vn.original) vnEmbed.addField ('Original Title', vn.original, true);
    
                    vnEmbed.addFields(
                        { name: 'Released', value: vn.released || 'None', inline: true },
                        { name: 'Aliases', value: propertyCheck('aliases') },
                        { name: 'Original language', value: propertyCheck('orig_lang'), inline: true },
                        { name: 'Available languages', value: propertyCheck('languages'), inline: true },
                        { name: 'Platform', value: propertyCheck('platforms'), inline: true },
                        { name: `Stats (${vn.votecount} votes)`, value: `Rating: **${vn.rating}**`, inline: true },
                        { name: 'Length', value: lengthCheck(vn.length), inline: true },
                        { name: 'Tags | Screenshots | Characters', value: `\`${prefix}vnid ${vn.id} tags\` | \`${prefix}vnid ${vn.id} screenshots\`| \`${prefix}vnid ${vn.id} characters\``},
                    )
    
                    if (img.length) vnEmbed.setImage(img[0]);
    
                    return message.channel.send(vnEmbed);
                })
                searchID = data.items[0].id; // Change id to the only item found's id
    
                return VNDB.write(`get vn basic,details,tags,stats,screens (id = ${searchID})\u0004`);
            })
            if (!searchID) VNDB.write(`get vn basic,stats (search ~ "${litteralStr}") {"results":25,"page":${p++}}\u0004`);
            else VNDB.write(`get vn basic,stats (id = ${searchID})\u0004`);
        }).catch(rejected => message.reply(rejected))
	}
}