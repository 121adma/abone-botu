const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-ayarlar')
        .setDescription('Sunucu ayar verilerini gösterir'),
    async execute(interaction, client, croxydb) {
        const aboneRolId = croxydb.get(`aboneRol_${interaction.guild.id}`);
        const yetkiliRolId = croxydb.get(`yetkiliRol_${interaction.guild.id}`);
        const logKanalId = croxydb.get(`logKanal_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Sunucu Ayarları')
            .addFields(
                { name: 'Abone Rolü', value: aboneRolId ? `<@&${aboneRolId}>` : 'Ayarlanmamış' },
                { name: 'Yetkili Rolü', value: yetkiliRolId ? `<@&${yetkiliRolId}>` : 'Ayarlanmamış' },
                { name: 'Log Kanalı', value: logKanalId ? `<#${logKanalId}>` : 'Ayarlanmamış' }
            );

        await interaction.reply({ embeds: [embed] });
    },
};