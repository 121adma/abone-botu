const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch'); 
const { api_key } = require('../config.json'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deprem')
        .setDescription('En son gerçekleşen deprem bilgisini gösterir.'),
    
    async execute(interaction, client, croxydb) {
        await interaction.deferReply(); 

        const API_URL = `https://deprem.cc/api/?endpoint=recent&limit=1&api_key=${api_key}`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (!data || !data.data || data.data.length === 0 || data.status !== 'success') {
                return interaction.editReply(`Hata: Güncel deprem verisi alınamıyor veya API yanıtı geçersiz. Hata Kodu: ${data.code || 'Bilinmiyor'}`);
            }

            const lastEarthquake = data.data[0]; 

            const embed = {
                color: 0xcc0000, 
                title: '🌍 SON DEPREM BİLGİSİ',
                description: `**${lastEarthquake.konum}** bölgesinde yeni bir deprem tespit edildi.`,
                fields: [
                    {
                        name: 'Büyüklük (Magnitude)',
                        value: `**M ${lastEarthquake.buyukluk}**`, 
                        inline: true,
                    },
                    {
                        name: 'Derinlik',
                        value: `${lastEarthquake.derinlik} km`,
                        inline: true,
                    },
                    {
                        name: 'Tarih ve Saat',
                        value: `${lastEarthquake.zaman}`,
                        inline: false,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Kaynak: Deprem.cc API',
                },
            };

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Deprem komutu hatası:', error);
            await interaction.editReply('Deprem verileri çekilirken bir hata oluştu. Lütfen API anahtarınızı kontrol edin.');
        }
    },
};