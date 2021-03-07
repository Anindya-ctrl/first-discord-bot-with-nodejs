const mongo = require('./mongo');
const command = require('./command');
const welcomeSchema = require('./schemas/welcome-schema');
const { Mongoose } = require('mongoose');
const { MessageFlags } = require('discord.js');

module.exports = client => {
    // !setWelcome <message>
    const cache = {};  // guildId: [channelId, text]

    command(client, 'setWelcome', async message => {
        const { member, channel, content, guild } = message;

        if(!member.hasPermission('ADMINISTRATOR')) {
            channel.send(`<@${member.id}> you do not have the permission to run this command!`);
            return ;
        }

        let text = content;
        const words = text.split(' ');

        if(words.length < 2) {
            channel.send('Please provide a welcome message!');
            return ;
        }

        words.shift();
        text = words.join(' ');

        cache[guild.id] = [channel.id, text];

        await mongo().then(async mongoose => {
            try {
                await welcomeSchema.findOneAndUpdate({
                    _id: guild.id,
                }, {
                    _id: guild.id,
                    channelId: channel.id,
                    text,   
                }, {
                    upsert: true,
                });
            } finally {
                mongoose.connection.close();
            }
        });
    });

    const onJoin = async member => {
        const { guild } = member;
        let data = cache[guild.id];

        if(!data) {
            console.log('Fetching from database!');

            await mongo().then(async mongoose => {
                try {
                    const res = await welcomeSchema.findOne({ _id: guild.id });

                    cache[guild.id] = data = [res.channelId, res.text];
                } finally {
                    mongoose.connection.close();
                }
            });
        }

        const channelId = data[0];
        const text = data[1];

        const channel = guild.channels.cache.get(channelId);
        channel.send(text.replace(/<@>/g, `<@${member.id}>`));
    }

    command(client, 'simJoin', message => {
        const { channel, member } = message;
        if(member.hasPermission('ADMINISTRATOR')) {
            onJoin(message.member);
        } else {
            channel.send(`<@${member.id}> you do not have the permission to run this command!`);
        }
    });

    client.on('guildMemberAdd', member => {
        onJoin(member);
    });

}