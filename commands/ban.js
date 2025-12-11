const { SlashCommandBuilder } = require('@discordjs/builders');

const { PermissionsBitField } = require('discord.js');

// Yeni ve net ID'leri config.json'dan çekiyoruz

const { trigger_server_id, target_server_id } = require('../config.json'); 

module.exports = {

    data: new SlashCommandBuilder()

        .setName('ban')

        .setDescription('Belirtilen kullanıcıyı sunucudan yasaklar.')

        .addUserOption(option =>

            option.setName('kullanici')

                .setDescription('Yasaklanacak kullanıcı.')

                .setRequired(true))

        .addStringOption(option =>

            option.setName('sebep')

                .setDescription('Yasaklama sebebi.')

                .setRequired(false)),

    

    async execute(interaction, client, croxydb) {

        

        // Yetki ve Hiyerarşi Kontrolleri

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {

            return interaction.reply({ 

                content: '🚫 Bu komutu kullanmak için **Üyeleri Yasakla** yetkisine sahip olmalısınız.', 

                ephemeral: true 

            });

        }

        

        const targetUser = interaction.options.getUser('kullanici');

        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';

        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        

        // ... (Kendi kendini banlama ve hiyerarşi kontrolleri buraya eklenmeli) ...

        let secondaryBanSuccess = false;

        

        try {

            // Kullanıcıya DM gönder (Opsiyonel)

            await targetUser.send(`**${interaction.guild.name}** sunucusundan yasaklandınız.\n**Sebep:** ${reason}`).catch(() => {});

            

            // 2. ANA YASAKLAMA (Komutun kullanıldığı sunucu)

            await interaction.guild.members.ban(targetUser.id, { reason: reason });

            // 3. 🌐 KOŞULLU ÇAPRAZ BAN KONTROLÜ

            // Eğer komut, belirlediğimiz tetikleyici sunucuda kullanıldıysa

            if (interaction.guild.id === trigger_server_id) {

                

                const secondaryServer = client.guilds.cache.get(target_server_id);

                

                if (secondaryServer) {

                    const botMember = secondaryServer.members.me;

                    // Botun hedef sunucuda Ban yetkisi var mı?

                    if (botMember && botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {

                        try {

                            // İKİNCİ BAN GİRİŞİMİ

                            await secondaryServer.members.ban(targetUser.id, { 

                                reason: `Tetikleyici sunucudan (${interaction.guild.name}) yasaklandığı için otomatik yasaklama. Sebep: ${reason}` 

                            });

                            secondaryBanSuccess = true;

                        } catch (e) {

                            console.error(`İkincil sunucudan banlama hatası (${target_server_id}):`, e);

                        }

                    }

                }

            }

            // -------------------------------------------------------------

            

            // 4. BAŞARILI YANIT OLUŞTURMA

            const footerText = secondaryBanSuccess 

                ? 'Kullanıcı, tanımlı ikincil sunucudan da başarıyla yasaklandı.'

                : 'Yasaklama sadece bu sunucuda (lokal) gerçekleşti.';

            const embed = {

                color: 0xff0000,

                title: '❌ KULLANICI YASAKLANDI',

                description: `<@${targetUser.id}> sunucudan yasaklandı.`,

                fields: [

                    { name: 'Yetkili', value: `<@${interaction.user.id}>`, inline: true },

                    { name: 'Sebep', value: reason, inline: true },

                ],

                timestamp: new Date(),

                footer: { text: footerText }

            };

            

            await interaction.reply({ embeds: [embed] });

        } catch (error) {

            console.error('Yasaklama hatası:', error);

            await interaction.reply({ content: `Yasaklama işlemi sırasında bir hata oluştu: ${error.message}`, ephemeral: true });

        }

    },

};

