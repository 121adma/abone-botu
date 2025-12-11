const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-log-ayarla')
        .setDescription('Sistem mesaj kanalını ayarlar')
        .addChannelOption(option => option.setName('kanal').setDescription('Ayarlanacak log kanalı').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client, croxydb) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('kanal');
        
        croxydb.set(`logKanal_${interaction.guild.id}`, channel.id);

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Log Kanalı Ayarlandı')
            .setDescription(`Log kanalı ${channel} olarak ayarlandı.`);

        await interaction.reply({ embeds: [embed] });
    },
};