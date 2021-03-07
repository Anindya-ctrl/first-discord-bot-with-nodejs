module.exports = client => {
    const channelId = '806214832692527194';

    const updateMemberCount = guild => {
        const channel = guild.channels.cache.get(channelId);

        channel.setName(`Member-count: ${guild.memberCount.toLocaleString()}`);
    };

    client.on('guildMemberAdd', member => updateMemberCount(member.guild));
    client.on('guildMemberRemove', member => updateMemberCount(member.guild));

    const guild = client.guilds.cache.get('788685492903870504');
    updateMemberCount(guild);
};

// For whatever reason, the bot can't update the member count when someone joins the server. Seems like this section needs some modification.