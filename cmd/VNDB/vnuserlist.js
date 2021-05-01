const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'vnuserlist',
	description: `Fetch a user public visual novel list from VNDB.`,
	aliases: ['vnul', 'vnuserlistid', 'vnulid'],
	usage: `**[ ${prefix}vnuserlist <username> ]**\n`+
            `**[ ${prefix}vnuserlistid <id> ]**`,
    arguments: "`username`: The username of the user.\n"+
                "`id`: The id of the user.\n",
	require: ['message', 'args', 'commandName'],
    
	execute(argsArray) {

		const message = argsArray[0];
        const args = argsArray[1];
        const commandName = argsArray[2];

        const { VNDB } = message.client;
        var userlist = [];
        var searchID;
        var user;
        var p = 1;

        if (['vnuserlistid', 'vnulid'].includes(commandName)) {
            if (!args[0]) return message.reply(`You need to input the id of the user!`);
            searchID = args[0];
        } else if (!args[0]) return message.reply(`You need to specify a username!`)

        for (let a in args) args[a] = args[a].toLowerCase();

        function requestUserlist() {
            
            VNDB.prependOnceListener("data", data => {

                data = data.slice(0, -1); // Remove empty char at the end of each response
                if (data.slice(0, data.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                data = JSON.parse(data.substring(data.indexOf('{')));

                for (let v of data.items) userlist.push(v);

                if (data.more) return requestUserlist() // Recursively request for the next page
                else return sendUserlist()
            })

            return VNDB.write(`get ulist basic,labels (uid = ${user.id}) {"results":25,"page":${p++}}\u0004`);
        }

        function sendUserlist() {

            let vnArr = []
            const fieldAmount = 10;
            var fetchName = [];
            const pageLength = Math.ceil(userlist.length/fieldAmount);
            let playing = finished = stalled = dropped = 0;

            for (let v of userlist) {
                fetchName.push(v.vn);
                for (let l of v.labels) {
                    if (l.id === 1) playing++;
                    else if (l.id === 2) finished++;
                    else if (l.id === 3) stalled++;
                    else if (l.id === 4) dropped++;
                }
            }

            let desc = `Total Visual Novel [**${userlist.length}**]\n - Playing [**${playing}**]\n - Finished [**${finished}**]\n - Stalled [**${stalled}**]\n - Dropped [**${dropped}**]`

            while (userlist.length) vnArr.push(userlist.splice(0, fieldAmount));

            new Promise((resolve, reject) => {

                let fetchedVN = [];
                p = 1;

                function requestVN() {

                    VNDB.prependOnceListener("data", data => {

                        data = data.slice(0, -1); // Remove empty char at the end of each response
                        if (data.slice(0, data.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
                        data = JSON.parse(data.substring(data.indexOf('{')));
        
                        for (let v of data.items) fetchedVN.push(v);
        
                        if (data.more) return requestVN() // Recursively request for the next page
                        else return resolve(fetchedVN)
                    })
                    VNDB.write(`get vn basic (id = ${JSON.stringify(fetchName)}) {"results":25,"page":${p++}})\u0004`);
                }
                if (fetchName.length) requestVN();
                else return reject(console.error(`Error fetching ${args[0]} visual novel list.`))
            }).then(fetchedVN => {

                var vnIndex = 0;

                let userlistEmbed = new Discord.MessageEmbed()
                    .setColor(botColor)
                    .setTitle(`${user.username}'s Visual Novel List`)
                    .setDescription(desc)

                function labels(arr) {
                    let str = '';
                    for (let l of arr) str += "`"+l.label+'`, '
                    return str.slice(0, -2)
                }

                function noteCalc(note) { return note ? note / 10 : '-'}

                for (let v in vnArr[vnIndex]) userlistEmbed.addField(fetchedVN[vnIndex*10+parseInt(v)].title, `${labels(vnArr[vnIndex][v].labels)} | **${noteCalc(vnArr[vnIndex][v].vote)}**`);

                if (!vnArr[1]) return message.channel.send(userlistEmbed);
                else userlistEmbed.setFooter(`1/${pageLength}`);

                return message.channel.send(userlistEmbed).then(msg => {
                        
                    msg.react('◀️').then(() => {
                        msg.react('▶️').then(() => {
                            
                            const filter = (reaction, user) => {
                                if (user.bot) return;
                                else if (reaction.emoji.name === '◀️') { vnIndex--; return true }
                                else if (reaction.emoji.name === '▶️'){ vnIndex++; return true }
                            }
    
                            const react = msg.createReactionCollector(filter, { time: 60000 });
    
                            react.on('collect', () => {
    
                                if (vnIndex < 0) vnIndex = vnArr.length-1;
                                else if (vnIndex > vnArr.length-1) vnIndex = 0;
                                
                                if (vnIndex === 0) userlistEmbed.setDescription(desc);
                                else userlistEmbed.setDescription('');
    
                                userlistEmbed.spliceFields(0, 10);
                                for (let v in vnArr[vnIndex]) userlistEmbed.addField(fetchedVN[vnIndex*10+parseInt(v)].title, `${labels(vnArr[vnIndex][v].labels)} | **${noteCalc(vnArr[vnIndex][v].vote)}**`);
                                userlistEmbed.setFooter(`${vnIndex+1}/${pageLength}`);
    
                                msg.edit(userlistEmbed);
                                
                            })
                        })
                    })
                })
            }).catch(() => { return message.reply("I couldn't fetch this user's visual novel list!\nThey probably don't have any.") })
        }

        VNDB.once("data", data => {

            data = data.slice(0, -1); // Remove empty char at the end of each response
            if (data.slice(0, data.indexOf('{')-1) === 'error') return message.reply(`There's been an error with the information fetched from VNDB.`);
            data = JSON.parse(data.substring(data.indexOf('{')));

            if (data.num != 1) return message.reply(`No user were found.`);

            user = data.items[0];

            return requestUserlist()
        })

        if (!searchID) VNDB.write(`get user basic (username = "${args[0]}")\u0004`);
        else VNDB.write(`get user basic (id = ${searchID})\u0004`);
	}
}