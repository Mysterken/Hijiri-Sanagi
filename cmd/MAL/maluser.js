const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {

    name: 'maluser',
    description: `Display a user's MAL abridged stats.`,
    aliases: ['mu'],
    usage: `**[ ${prefix}maluser <username> ]**`,
    arguments: "`username`: The username of the MAL user.",
    require: ['message', 'args'],
    
    execute(argsArray) {

        const message = argsArray[0];
        const args = argsArray[1];

        const username = args[0];

        if (!username) return message.reply(`You need to specify a username!`);

        let apiEndpoint =
                new fetch.Request(`https://api.jikan.moe/v3/user/${username}/profile`, {
                method: 'GET'
            });
            fetch(apiEndpoint)
            .then(response => response.json())
            .then((data) => {

                // Catch error response
                if (data.status) {
                    if (data.status === 404) return message.reply(`Sorry the user couldn't be found in the MAL database.`);
                    else return message.reply(`There has been an error with the response from the API. Try again later.`);
                }

                function stats(obj, isAnime) {
                    return `⚬ ${isAnime ? 'Watching:         ' : 'Reading:            '}\`${isAnime ? obj.watching : obj.reading}\`\n`+
                            `⚬ Completed:       \`${obj.completed}\`\n`+
                            `⚬ On-Hold:           \`${obj.on_hold}\`\n`+
                            `⚬ Dropped:           \`${obj.dropped}\`\n`+
                            `⚬ Plan to ${isAnime ? 'Watch:  ' : 'Read:     '}\`${isAnime ? obj.plan_to_watch : obj.plan_to_read}\`\n`+
                            `⚬ Total Entries:     \`${obj.total_entries}\`\n`
                }

                let userEmbed = new Discord.MessageEmbed()
                    .setColor(botColor)
                    .setTitle(`${data.username} MAL stats`)
                    .setURL(data.url)
                    .setThumbnail(data.image_url)
                    .addFields( { name: `Anime stats`, value: stats(data.anime_stats, true), inline: true } )
                    .addFields( { name: `Manga stats`, value: stats(data.manga_stats, false), inline: true } )
                    .setFooter(`user id: ${data.user_id}`);

                return message.channel.send(userEmbed);
            }).catch(err => {
                console.error(err);
                return message.reply(`There has been an error with the response from the API. Try again later.`);
            })
    }
}