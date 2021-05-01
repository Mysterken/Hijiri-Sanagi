module.exports = {

	name: 'joinedGuild',
	description: `Action to perform whenever the bot join a new server.`,
    
	execute (client, guild) {

        const { hijiriDB } = client;
		const serverDB = hijiriDB.db().collection("server")

        return serverDB.findOne({ serverID: guild.id}, (err, res) => {

            if (err) return console.error(`Couldn't write to the database, serverID: ${guild.id}`);
            else if (!res) {
                serverDB.insertOne(
                    {
                    "serverID": guild.id,
                    "snipeLB": {
                        "time": null,
                        "UID": null
                    },
                    "vndbSexLV": 0,
                    "vndbViolenceLV": 0
                    });
                return console.log(`New server data written for ${guild.id}`)
            }
            return console.log(`Rejoined server ${guild.id}`)
        })
    }
}