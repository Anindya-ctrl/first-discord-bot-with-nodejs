const redis = require('./redis');
const command = require('./command');
const messageCounter = require('./message-counter');

const getRole = guild => {
    return guild.roles.cache.find(role => role.name === 'Muted');
}

const insertRole = member => {
    const role = getRole(member.guild);
    if(role) {
        member.roles.add(role);
        console.log(`Muted: ${member.id}`);
    }
}

const onJoin = async member => {
    const { id, guild } = member;
    const redisKeyPrefix = 'muted-';

    const redisClient = await redis();
    try {
        redisClient.get(`${redisKeyPrefix}${id}-${guild.id}`, (err, res) => {
            if(err) {
                console.log(`Redis GET error: ${err}`);
            } else if(res) {
                insertRole(member);
            } else {
                console.log('The user is not muted');
            }
        });
    } finally {
        redisClient.quit();
    }
}

module.exports = client => {
    const redisKeyPrefix = 'muted-';

    redis.expire(message => {
        if(message.startsWith(redisKeyPrefix)) {
            const split = message.split('-');
            // ['Muted', '<user_id>', '<guild_id>']

            const memberId = split[1];
            const guildId = split[2];
            const guild = client.guilds.cache.get(guildId);
            const member = guild.members.cache.get(memberId);
            const role = getRole(guild);
            
            member.roles.remove(role);
        }
    });

    client.on('guildMemberAdd', member => {
        onJoin(member);
    });

    command(client, 'simMute', message => {
        onJoin(message.member);
    });

    command(client, 'mute', async message => {
        const { member, channel, content, mentions, guild } = message;
        const syntax = '!mute <mention> <duration as a number> <duration_type: m, h, d or life>'

        if(!member.hasPermission('ADMINISTRATOR')) {
            channel.send('You don\'t have the permission to run this command!');
            return ;
        }

        // !mute <@> duration duration_type -> ['!mute', '<@>', 'duration', 'duration_type']
        const split = content.trim().split(' ');
        const duration = split[2];
        const durationType = split[3];

        const durations = {
            m: 60,
            h: 3600,
            d: 86400,
            life: -1,
        };

        const seconds = duration * durations[durationType];

        if(split.length !== 4) {
            channel.send(`<@${member.id}> please use the correct command syntax: *${syntax}*`);
            return ;
        }
        if(isNaN(duration)) {
            channel.send(`<@${member.id}> please provide a number for the duration!`);
            return ;
        }
        if(!durations[durationType]) {
            channel.send(`<@${member.id}> pleae provide a valid duration type! *Syntax:** ${syntax}`);
        }

        // insertRole(target);

        const target = mentions.users.first();
        const { id } = target;
        const targetMember = guild.members.cache.get(id);
        insertRole(targetMember);

        if(!target) {
            channel.send(`<@${member.id}> please tag an user!`);
        }

        const redisClient = await redis();
        try {
            const redisKey = `${redisKeyPrefix}${id}-${guild.id}`;

            if(seconds > 0) {
                redisClient.set(redisKey, 'true', 'EX', seconds);
            } else {
                redisClient.set(redisKey, 'true');
            }
        } finally {
            redisClient.quit();
        }

    });
};