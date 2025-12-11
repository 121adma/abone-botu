const { SlashCommandBuilder } = require('@discordjs/builders');

const { PermissionsBitField } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()

        .setName('otorol')

        .setDescription('Yeni üyelere otomatik verilecek rolü ayarlar veya devre dışı bırakır (Yönetici).')

        .addRoleOption(option =>

            option.setName('rol')

                .setDescription('Ayarlanacak rol. Boş bırakılırsa ayar sıfırlanır.')

                .setRequired(false)),

    

    async execute(interaction, client, croxydb) {

        

        // Yetki Kontrolü

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            return interaction.reply({ 

                content: '🚫 Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısınız.', 

                ephemeral: true 

            });

        }

        const role = interaction.options.getRole('rol');

        const guildId = interaction.guild.id;

        const dbKey = `autorole_${guildId}`;

        

        if (role) {

            // ROL AYARLAMA İŞLEMİ

            // Botun rolünün, atanacak rolden daha yukarıda olduğundan emin olunmalı

            if (role.position >= interaction.guild.members.me.roles.highest.position) {

                return interaction.reply({ 

                    content: '❌ Ayarlamak istediğiniz rol, botun rolünden daha yüksek veya eşittir. Lütfen botun rolünü daha yukarı taşıyın.', 

                    ephemeral: true 

                });

            }

            

            croxydb.set(dbKey, role.id);

            await interaction.reply({ 

                content: `✅ Otomatik verilecek rol başarılı bir şekilde **${role}** olarak ayarlandı.`, 

                ephemeral: true 

            });

        } else {

            // ROL SIFIRLAMA İŞLEMİ

            if (croxydb.has(dbKey)) {

                croxydb.delete(dbKey);

                await interaction.reply({ 

                    content: '❌ Otomatik rol ayarı başarıyla **devre dışı bırakıldı**.', 

                    ephemeral: true 

                });

            } else {

                await interaction.reply({ 

                    content: 'Zaten ayarlanmış bir otomatik rol bulunmamaktadır.', 

                    ephemeral: true 

                });

            }

        }

    },

};

