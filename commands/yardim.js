const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardim')
        .setDescription('Komut listesini gösterir'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Yetkili Komutları')
            .setDescription('Aşağıda kullanılabilir komutların listesi bulunmaktadır:')
            .addFields(
                { name: '/abone-rol-ayarla', value: 'Abone rolünü ayarlar' },
                { name: '/abone-yetkili-rol-ayarla', value: 'Yetkili rolünü ayarlar' },
                { name: '/abone-log-ayarla', value: 'Sistem mesaj kanalını ayarlar' },
                { name: '/abone-ver', value: 'Kullanıcıya abone rolü verir' },
                { name: '/abone-al', value: 'Kullanıcının abone rolünü alır' },
                { name: '/abone-veri-sifirla', value: 'Sunucunuzdaki tüm verileri siler' },
                { name: '/abone-ayarlar', value: 'Sunucu ayar verilerini gösterir' },
                { name: '/bilgi', value: 'Yetkilinin rol sayısını gösterir' }
            );

        await interaction.reply({ embeds: [embed] });
    },
};
