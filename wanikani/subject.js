const { prefix, botColor } = require('../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'subject',
	description: 'Display a Wanikani subject of choice.\nSearch by id, character or meaning.',
	aliases: ['s'],
    path: ['subjects'],
	usage: `**[ ${prefix}wanikani subject <id/character/meaning> ]**`,
    arguments: "`id`: The unique id of the subject.\n"+
                "`character`: The UTF-8 character of the subject.\n"+
                "`meaning`: The meaning of the subject.",

    execute(message, args, data) {

		var subject = data[0];

        const { hijiriDB } = message.client;
        const hijiriSubjects = hijiriDB.db().collection("subjects");
        const hijiriCharacters = hijiriDB.db().collection("characters");
        const hijiriMeanings = hijiriDB.db().collection("meanings");

        if (!args[0]) return message.reply(`You didn't specify the subject!`);

        async function searchSubject() {

            subject = args.join(' ');
            let reg = new RegExp(`^${subject}$`, 'i');
            let ID;
            // No idea why the regex don't match for sequence of jp char, see: "女子" for ex
        
            function subjectFetch(ID) { return hijiriSubjects.findOne({ id: ID}) }

            if (parseInt(args[0])) ID = parseInt(args[0]);

            if (!ID) ID = await hijiriCharacters.findOne({ character: { $regex: reg } });
            if (!ID) ID = await hijiriMeanings.findOne({ meaning: { $regex: reg } })

            if (!ID) return message.reply(`I couldn't find *${args.join(' ')}* in the Wanikani database.`);

            if (ID?.subjectID) {

                if (ID?.subjectID[1]) {

                    let desc = '';
                    for (let id of ID.subjectID) {
                        let subject = await subjectFetch(id)
                        desc += '`' + id + '` => **' + subject.data.characters + "**\n";
                    } 

                    let IDEmbed = new Discord.MessageEmbed()
                        .setColor(botColor)
                        .setTitle(`Subject id match found for: ${subject[0].toUpperCase() + subject.slice(1)}`)
                        .setDescription(desc);

                    return message.channel.send(IDEmbed)
                } else subject = await subjectFetch(ID[0]);
            } else subject = await subjectFetch(ID);

            if (!subject) return message.reply(`I couldn't find your search in the Wanikani database.`);

            let thumbnail = (s) => {
                for (let img of s.data.character_images) {
                    if (img.content_type === 'image/png') return img.url;
                }
            }

            let meaning = (s) => {
                let str = '';
                for (let m of s.data.meanings) str += '`' + m.meaning + '` ';
                return str.trim();
            }

            let markupRemoved = (str) => {

                let markup = ['<radical>', '</radical>', '<kanji>', '</kanji>', '<vocabulary>',
                '</vocabulary>', '<meaning>', '</meaning>', '<reading>', '</reading>',
                '<ja>', '</ja>'];
                let rmarkup = ['<a href="', '</a>'];

                for (let m of markup) while (str.search(m) != -1) str = str.replace(m, '`');
                for (let rm of rmarkup) while (str.search(rm) != -1) str = str.replace(rm, '');

                while (str.search('" target="_blank">') != -1) str = str.replace('" target="_blank">', ' ');

                return str;
            }

            let subjectEmbed = new Discord.MessageEmbed()
                .setColor(botColor)
                .setTitle(`${subject.object[0].toUpperCase() + subject.object.slice(1)} | ${subject.data.characters}`)
                .setURL(`${subject.data.document_url}`)
                .addFields(
                { name: 'Meanings', value: `${meaning(subject)}`, inline: true },
                //{ name: 'Level', value: `${subject.data.level}`, inline: true },
                { name: 'Mnemonic', value: `${markupRemoved(subject.data.meaning_mnemonic)}` }
                );

            if (subject.object === 'radical') subjectEmbed.setThumbnail(thumbnail(subject));
            else if (subject.object === 'kanji') {

                let onyomi=kunyomi=nanori='';
                for (let r of subject.data.readings) {
                    if (r.type === 'onyomi') onyomi += '`' + r.reading + '` ';
                    else if (r.type === 'kunyomi') kunyomi += '`' + r.reading + '` ';
                    else if (r.type === 'nanori') nanori += '`' + r.reading + '` ';
                }

                let reading = `**On’yomi:** ${onyomi || 'None'}\n**Kun’yomi:** ${kunyomi || 'None'}\n**Nanori:** ${nanori || 'None'}`
                subjectEmbed.addFields(
                    { name: 'Meaning hint', value: `${markupRemoved(subject.data.meaning_hint)}` },
                    { name: 'Readings', value: `${reading}` },
                    { name: 'Readings mnemonic', value: `${markupRemoved(subject.data.reading_mnemonic)}` },
                    { name: 'Readings hint', value: `${markupRemoved(subject.data.reading_hint)}` }
                );

            } else if (subject.object === 'vocabulary') {

                let reading = '';
                for (let r of subject.data.readings) reading += '`' + r.reading + '` ';

                subjectEmbed.addFields(
                    { name: 'Reading', value: `${reading}` },
                    { name: 'Readings mnemonic', value: `${markupRemoved(subject.data.reading_mnemonic)}` },
                    { name: 'Context sentence', value: `Use \`${prefix}wanikani s ${subject.id} s\`.` }
                );

                if (['sentence', 's'].includes(args[1])) {

                    let desc = '';

                    for (let s of subject.data.context_sentences) desc += '**'+s.ja+'**\n'+s.en+'\n\n';

                    let sentenceEmbed = new Discord.MessageEmbed()
                        .setColor(botColor)
                        .setTitle(`Context sentence | ${subject.data.characters}`)
                        .setURL(`${subject.data.document_url}`)
                        .setDescription(`${desc}`)
                        
                    return message.channel.send(sentenceEmbed);
                }
            }
            subjectEmbed.setFooter(`Subject id: ${subject.id}`);
            return message.channel.send(subjectEmbed);
        }
        return searchSubject()
	}
}