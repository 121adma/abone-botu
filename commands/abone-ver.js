const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-ver')
        .setDescription('Kullanıcıya abone rolü verir')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Abone rolü verilecek kullanıcı')
                .setRequired(true)),
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
        const member = await interaction.guild.members.fetch(user.id);
        const aboneRol = interaction.guild.roles.cache.get(aboneRolId);

        
        if (aboneRol.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'Bu rol benden üstte, bu rolü veremem!', ephemeral: true });
        }

        
        if (member.roles.cache.has(aboneRolId)) {
            return interaction.reply({ content: 'Bu kullanıcı zaten abone rolüne sahip!', ephemeral: true });
        }

        
        try {
            await member.roles.add(aboneRol);
        } catch (error) {
            console.error('Rol verme hatası:', error);
            return interaction.reply({ content: 'Rol verirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
        }

        
        const aboneRoluVermeSayisi = croxydb.get(`aboneRoluVermeSayisi_${interaction.guild.id}_${interaction.user.id}`) || 0;
        croxydb.set(`aboneRoluVermeSayisi_${interaction.guild.id}_${interaction.user.id}`, aboneRoluVermeSayisi + 1);
        croxydb.set(`sonRolVermeTarihi_${interaction.guild.id}_${interaction.user.id}`, Date.now());

       
        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Abone Rolü Verildi')
            .setDescription(`${user} kullanıcısına abone rolü verildi.`)
            .addFields(
                { name: 'Abone Rolü Veren', value: `${interaction.user}`, inline: true }
            
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        
        const logChannelId = croxydb.get(`logKanal_${interaction.guild.id}`);
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#36393f')
                    .setTitle('Abone Rolü Verildi')
                    .setDescription(`${interaction.user} tarafından ${user} kullanıcısına abone rolü verildi.`)
                    .addFields(
                        { name: 'Abone Rolü Veren', value: `${interaction.user}`, inline: true },
                        { name: 'Abone Rolü Verilen', value: `${user}`, inline: true },
                        { name: 'Toplam Verdiği Abone Rolü', value: `${aboneRoluVermeSayisi + 1}`, inline: true }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};