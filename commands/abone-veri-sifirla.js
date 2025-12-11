const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-veri-sifirla')
        .setDescription('Sunucunuzdaki tüm abone verilerini siler')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client, croxydb) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }

       
        croxydb.delete(`aboneRol_${interaction.guild.id}`);
        croxydb.delete(`yetkiliRol_${interaction.guild.id}`);
        croxydb.delete(`logKanal_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Veriler Sıfırlandı')
            .setDescription('Bu sunucuya ait tüm abone verileri sıfırlandı.');

        await interaction.reply({ embeds: [embed] });

        
        const logChannelId = croxydb.get(`logKanal_${interaction.guild.id}`);
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#36393f')
                    .setTitle('Abone Verileri Sıfırlandı')
                    .setDescription(`${interaction.user} tarafından sunucunun tüm abone verileri sıfırlandı.`);
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};