const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-al')
        .setDescription('Kullanıcının abone rolünü alır')
        .addUserOption(option => option.setName('kullanici').setDescription('Abone rolü alınacak kullanıcı').setRequired(true)),
    async execute(interaction, client, croxydb) {
        const yetkiliRolId = croxydb.get(`yetkiliRol_${interaction.guild.id}`);
        const aboneRolId = croxydb.get(`aboneRol_${interaction.guild.id}`);

        if (!yetkiliRolId || !aboneRolId) {
            let message = 'Bu komutu kullanmak için ';
            if (!yetkiliRolId && !aboneRolId) {
                message += 'yetkili rolü ve abone rolü ayarlanmalıdır.';
            } else if (!yetkiliRolId) {
                message += 'yetkili rolü ayarlanmalıdır.';
            } else {
                message += 'abone rolü ayarlanmalıdır.';
            }
            return interaction.reply({ content: message, ephemeral: true });
        }

        if (!interaction.member.roles.cache.has(yetkiliRolId)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!', ephemeral: true });
        }

        const user = interaction.options.getUser('kullanici');
        const aboneRol = interaction.guild.roles.cache.get(aboneRolId);
        const member = await interaction.guild.members.fetch(user.id);

        if (aboneRol.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'Bu rol benden üstte, bu rolü alamam!', ephemeral: true });
        }

        if (!member.roles.cache.has(aboneRolId)) {
            return interaction.reply({ content: 'Bu kullanıcıda zaten abone rolü yok!', ephemeral: true });
        }

        await member.roles.remove(aboneRol);

       
        const aboneRoluVermeSayisi = croxydb.get(`aboneRoluVermeSayisi_${interaction.guild.id}_${interaction.user.id}`) || 0;
        if (aboneRoluVermeSayisi > 0) {
            croxydb.set(`aboneRoluVermeSayisi_${interaction.guild.id}_${interaction.user.id}`, aboneRoluVermeSayisi - 1);
        }

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Abone Rolü Alındı')
            .setDescription(`${user} kullanıcısından abone rolü alındı.`);

        await interaction.reply({ embeds: [embed] });

        
        const logChannelId = croxydb.get(`logKanal_${interaction.guild.id}`);
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#36393f')
                    .setTitle('Abone Rolü Alındı')
                    .setDescription(`${interaction.user} tarafından ${user} kullanıcısından abone rolü alındı.`);
                await logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};