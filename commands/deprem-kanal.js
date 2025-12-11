const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deprem-kanal')
        .setDescription('Deprem bildirimlerinin gönderileceği kanalı ayarlar veya kaldırır.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Bildirimlerin gönderileceği metin kanalı (Kaldırmak için boş bırakın).')
                .setRequired(false)
        ),
    
    async execute(interaction, client, croxydb) {
        // Yetki kontrolü
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısınız.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('kanal');
        const guildId = interaction.guild.id;

        if (channel) {
            if (channel.type !== 0) { // 0 = Metin Kanalı
                return interaction.reply({ content: 'Lütfen bir **metin kanalı** seçin.', ephemeral: true });
            }

            croxydb.set(`depremKanal_${guildId}`, channel.id);

            await interaction.reply({ content: `✅ Deprem bildirim kanalı başarılı bir şekilde **${channel}** olarak ayarlandı.`, ephemeral: true });
        } else {
            // Ayarı kaldırma
            if (croxydb.has(`depremKanal_${guildId}`)) {
                croxydb.delete(`depremKanal_${guildId}`);
                await interaction.reply({ content: '❌ Deprem bildirim kanalı ayarı kaldırıldı. Artık bildirim gönderilmeyecek.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Zaten ayarlanmış bir deprem bildirim kanalı bulunmamaktadır.', ephemeral: true });
            }
        }
    },
};