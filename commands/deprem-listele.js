const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { api_key } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deprem-listele')
        .setDescription('En son gerçekleşen 50 depremi listeler.'), 
    
    async execute(interaction, client, croxydb) {
        await interaction.deferReply(); 

        // limit=50 ile 50 deprem çekiliyor
        const API_URL = `https://deprem.cc/api/?endpoint=recent&limit=50&api_key=${api_key}`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (!data || !data.data || data.data.length === 0 || data.status !== 'success') {
                return interaction.editReply(`Hata: Güncel deprem verisi alınamıyor veya API yanıtı geçersiz. Hata Kodu: ${data.code || 'Bilinmiyor'}`);
            }

            const earthquakes = data.data; 
            
            const fields1 = [];
            const fields2 = [];

            // Discord Embed sınırı nedeniyle 50 depremi 2 Embed'e bölme
            earthquakes.forEach((eq, index) => {
                const fieldData = {
                    name: `${index + 1}. ${eq.konum}`, 
                    value: `**Büyüklük:** M ${eq.buyukluk} | **Derinlik:** ${eq.derinlik} km\n**Saat:** ${eq.zaman}`, 
                    inline: false,
                };
                
                if (index < 25) {
                    fields1.push(fieldData);
                } else {
                    fields2.push(fieldData);
                }
            });

            const embed1 = {
                color: 0xffa500,
                title: '📋 SON 50 DEPREM LİSTESİ (1. Bölüm)',
                description: 'Türkiye ve çevresinde gerçekleşen son sismik olaylar:',
                fields: fields1,
                timestamp: new Date(),
                footer: {
                    text: 'Kaynak: Deprem.cc API',
                },
            };
            
            const embed2 = {
                color: 0xffa500,
                title: '📋 SON 50 DEPREM LİSTESİ (2. Bölüm)',
                fields: fields2,
                footer: {
                    text: 'Kaynak: Deprem.cc API',
                },
            };
            
            await interaction.editReply({ embeds: [embed1, embed2] });


        } catch (error) {
            console.error('Deprem listeleme komutu hatası:', error);
            await interaction.editReply('Deprem verileri çekilirken bir hata oluştu. Lütfen API anahtarınızı kontrol edin.');
        }
    },
};