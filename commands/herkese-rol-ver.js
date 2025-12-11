const { SlashCommandBuilder } = require('@discordjs/builders');

const { PermissionsBitField } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()

        .setName('herkese-rol-ver')

        .setDescription('Sunucudaki mevcut tüm üyelere toplu olarak rol verir (Yönetici).')

        .addRoleOption(option =>

            option.setName('rol')

                .setDescription('Tüm üyelere verilecek hedef rol.')

                .setRequired(true)),

    

    async execute(interaction, client, croxydb) {

        

        // 🚨 KRİTİK ADIM: Komutun takılmaması için hemen erteleme yapıyoruz

        // Bu, 3 saniyelik zaman aşımını aşmamızı garanti eder.

        await interaction.deferReply({ ephemeral: true }).catch(console.error); 

        // Tüm kodu bir try/catch bloğuna alıyoruz

        try {

            

            // Yetki Kontrolü

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

                return interaction.editReply({ 

                    content: '🚫 Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısınız.', 

                });

            }

            const targetRole = interaction.options.getRole('rol');

            

            // Botun rolü kontrolü

            if (targetRole.position >= interaction.guild.members.me.roles.highest.position) {

                return interaction.editReply({ 

                    content: '❌ Hedef rol, botun rolünden daha yüksek veya eşittir. Lütfen botun rolünü daha yukarı taşıyın.', 

                });

            }

            // 1. 📢 BOT DURUMUNU GEÇİCİ OLARAK GÜNCELLE

            client.user.setPresence({

                activities: [{ 

                    name: `${interaction.guild.name} sunucusunda toplu rol dağıtımı yapılıyor...`, 

                    type: 3, 

                }],

                status: 'idle', 

            });

            // 2. ⏳ 2 DAKİKA SONRA DURUMU GERİ DÖNDÜRME ZAMANLAYICISI

            setTimeout(() => {

                client.user.setPresence({

                    activities: [{ 

                        name: 'Son Depremleri Kontrol Ediyor', 

                        type: 3, 

                    }],

                    status: 'dnd', 

                });

            }, 120000); // 2 dakika

            

            

            let successCount = 0;

            let failCount = 0;

            

            // Üyeleri API'den çekme

            // Bu kısım büyük sunucularda yavaşlayabilir, ancak deferReply'den sonra olduğu için takılmaya sebep olmamalı.

            const members = await interaction.guild.members.fetch();

            

            // Eğer üye sayısı 500'den fazlaysa, rol verme işleminin yavaşlaması normaldir.

            for (const member of members.values()) {

                

                if (member.user.bot || member.roles.cache.has(targetRole.id)) {

                    continue;

                }

                

                try {

                    // Rol verme işlemi

                    await member.roles.add(targetRole, 'Toplu rol ataması');

                    successCount++;

                } catch (error) {

                    failCount++;

                    console.error(`Üyeye rol verme hatası (${member.user.tag}): ${error.message}`);

                }

            }

            

            // Sonuç raporu

            let responseMessage = `✅ İşlem tamamlandı! Sunucudaki toplam üye sayısı: **${members.size}**\n\n`;

            

            responseMessage += `➕ **${successCount}** üyeye **${targetRole.name}** rolü verildi.\n` +

                               `➖ **${failCount}** üyeye rol verilemedi (Yetki veya Hata).\n\n` +

                               `🔔 Bot durumu, otomatik olarak 2 dakika sonra eski haline dönecektir.`;

            // Cevabı düzenle

            await interaction.editReply(responseMessage);

        } catch (error) {

            // Kritik hata durumunda yanıtı gönder

            console.error('Herkese Rol Ver Komutu Çalışma Hatası:', error);

            

            await interaction.editReply({

                content: `❌ Komut yürütülürken kritik bir hata oluştu: ${error.message}. Konsolu kontrol edin.`,

            });

            

            // Hata durumunda da botun durumunu hemen geri döndür

            client.user.setPresence({

                activities: [{ 

                    name: 'Son Depremleri Kontrol Ediyor', 

                    type: 3, 

                }],

                status: 'dnd', 

            });

        }

    },

};

