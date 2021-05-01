const { prefix } = require('../../config.json');

module.exports = {

    name: 'snipe',
	description: `Start a game where the goal is to react to the message the fastest possible.\nThe message start appearing as :no_entry: but turns in a ✅ after a random amount of time between 5 to 15 seconds, try to react the fastest possible.\nThe game automatically end after 25 seconds.`,
    aliases: ["sp"],
	usage: `**[ ${prefix}snipe ]** then react with ✅`,
    require: ['message'],
    
    execute(argsArray) {

        const message = argsArray[0];

        const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;
        const { hijiriDB } = message.client;
		const serverDB = hijiriDB.db().collection("server");

        function checkLB(lb) {
            switch (lb.length) {
                case 1:
                    return ':first_place: ';
                case 2:
                    return ':second_place: ';
                case 3:
                    return ':third_place: ';
            }
        }

        async function snipe() {

            let res;
            if (message.channel.type !== 'dm') res = await serverDB.findOne({ serverID: message.guild.id})

            message.channel.send(':no_entry:').then(msg => {
                msg.react('✅').then(() => {
    
                    const react = msg.createReactionCollector(filter, { time: 25000 });
                    let snipeable = false;
                    let LB = [];
                    let arr = [];
                    let start;
    
                    setTimeout(() => {
                        msg.edit(":white_check_mark:");
                        snipeable = true;
                        start = Date.now();
                    }, Math.floor(Math.random() * (10000 + 1)) + 5000)
    
                    react.on('collect', r => {
    
                        let lastUser;
                        
                        // Check if the user who reacted already did
                        r.users.cache.forEach(user => { 
                            if (!arr.includes(user.id) && user.id !== msg.author.id) {
                                lastUser = user;
                                arr.push(user.id);
                            }
                        });
    
                        if (!lastUser) return;
    
                        if (snipeable) {
    
                            let time = Date.now() - start;
    
                            // Assign new record to the database if not in DM
                            if (res) { 
                                if ((time < res.snipeLB.time && !LB[1]) || (res.snipeLB.time === null && !LB[1])) {
                                    message.channel.send(`🏆 New record! 🏆`);
                                    res.snipeLB.time = time;
                                    res.snipeLB.UID = lastUser.id;
                                    serverDB.updateOne({ serverID: message.guild.id }, 
                                        { $set: { snipeLB: res.snipeLB } }, (err) => {if (err) return console.error(err)})
                                }
                            }
                            
                            LB.push(lastUser.id);
                            message.channel.send(`${checkLB(LB)}**${lastUser.username}** Time taken: ${time} ms.`);
                            
                        } else { message.channel.send(`**${lastUser.username}** lost!`) }
                    });
                    react.on('end', () => { return message.channel.send(`End of the game.`) })
                })
            }) 
        }
        return snipe()
    }
}