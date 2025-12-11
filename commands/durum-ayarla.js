const { SlashCommandBuilder } = require('@discordjs/builders');
// Gerekli ayarları config.json'dan çekiyoruz
// owner_id yerine yetkili_rol_id çekiliyor
const { yetkili_rol_id } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('durum-ayarla')
        .setDescription('Botun aktivitesini ve durumunu (sadece yetkili rol) ayarlar.')
        .addStringOption(option =>
            option.setName('metin')
                .setDescription('Botun oynuyor/izliyor kısmında görünecek metin.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tip')
                .setDescription('Aktivite tipi (Örn: WATCHING, PLAYING, LISTENING, STREAMING)')
                .setRequired(true)
                .addChoices(
                    { name: 'İzliyor (Watching)', value: 'WATCHING' },
                    { name: 'Oynuyor (Playing)', value: 'PLAYING' },
                    { name: 'Dinliyor (Listening)', value: 'LISTENING' },
                    { name: 'Yayın Yapıyor (Streaming)', value: 'STREAMING' },
                )),
    
    async execute(interaction, client, croxydb) {
        
        // 🛑 ROL YETKİ KONTROLÜ
        const member = interaction.member;

        // Kullanıcının belirtilen role sahip olup olmadığını kontrol et
        if (!member || !member.roles.cache.has(yetkili_rol_id)) {
            return interaction.reply({ 
                content: `🚫 Bu komutu kullanmak için sunucuda <@&${yetkili_rol_id}> rolüne sahip olmalısınız.`, 
                ephemeral: true 
            });
        }
        
        await interaction.deferReply({ ephemeral: true });

        const metin = interaction.options.getString('metin');
        const tipString = interaction.options.getString('tip');

        let type = 3; // Varsayılan: Watching (İzliyor)

        // String olarak gelen tipi sayısal koda çevirme
        switch (tipString) {
            case 'PLAYING':
                type = 0;
                break;
            case 'STREAMING':
                type = 1;
                break;
            case 'LISTENING':
                type = 2;
                break;
            case 'WATCHING':
                type = 3;
                break;
            default:
                type = 3;
        }

        try {
            client.user.setPresence({
                activities: [{ 
                    name: metin,
                    type: type,
                }],
                status: 'online', 
            });

            await interaction.editReply(`✅ Botun durumu başarıyla güncellendi: **${tipString}** ${metin}`);

        } catch (error) {
            console.error('Durum ayarlama hatası:', error);
            await interaction.editReply('❌ Botun durumunu ayarlarken bir hata oluştu.');
        }
    },
};