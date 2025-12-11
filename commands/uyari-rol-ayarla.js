const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uyari-rol-ayarla')
        .setDescription('Otomatik deprem bildirimlerinde ping atılacak rolü ayarlar.')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Ping atılacak rol (Kaldırmak için boş bırakın).')
                .setRequired(false)
        ),
    
    async execute(interaction, client, croxydb) {
        // Yetki kontrolü
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısınız.', ephemeral: true });
        }

        const role = interaction.options.getRole('rol');
        const guildId = interaction.guild.id;

        if (role) {
            croxydb.set(`depremUyariRol_${guildId}`, role.id);

            await interaction.reply({ content: `🔔 Deprem uyarısı rolü başarılı bir şekilde **${role}** olarak ayarlandı. Bildirimlerde bu role ping atılacaktır.`, ephemeral: true });
        } else {
            // Ayarı kaldırma
            if (croxydb.has(`depremUyariRol_${guildId}`)) {
                croxydb.delete(`depremUyariRol_${guildId}`);
                await interaction.reply({ content: '🔕 Deprem uyarı rolü ayarı kaldırıldı. Artık bildirimlerde ping atılmayacak.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Zaten ayarlanmış bir uyarı rolü bulunmamaktadır.', ephemeral: true });
            }
        }
    },
};