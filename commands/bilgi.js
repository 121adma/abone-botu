const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bilgi')
        .setDescription('Kullanıcının veya kendinizin bilgilerini gösterir')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Bilgisi gösterilecek kullanıcı ')
                .setRequired(false)),
    async execute(interaction, client, croxydb) {
        const user = interaction.options.getUser('kullanici') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const yetkiliRolId = croxydb.get(`yetkiliRol_${interaction.guild.id}`);
        const aboneRolId = croxydb.get(`aboneRol_${interaction.guild.id}`);

        let yetkiliMi = 'Hayır';
        let aboneMi = 'Hayır';
        let aboneRoluVermeSayisi = 0;
        let sonRolVermeTarihi = 'Henüz rol vermemiş';

        if (yetkiliRolId && member.roles.cache.has(yetkiliRolId)) {
            yetkiliMi = 'Evet';
            aboneRoluVermeSayisi = croxydb.get(`aboneRoluVermeSayisi_${interaction.guild.id}_${user.id}`) || 0;
            const sonRolVermeTarihiTimestamp = croxydb.get(`sonRolVermeTarihi_${interaction.guild.id}_${user.id}`);
            if (sonRolVermeTarihiTimestamp) {
                sonRolVermeTarihi = new Date(sonRolVermeTarihiTimestamp).toLocaleString();
            }
        }

        if (aboneRolId && member.roles.cache.has(aboneRolId)) {
            aboneMi = 'Evet';
        }

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle(`Kullanıcı Bilgisi: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Kullanıcı ID', value: user.id, inline: true },
                { name: 'Yetkili mi?', value: yetkiliMi, inline: true },
                { name: 'Abone mi?', value: aboneMi, inline: true }
            );

        if (yetkiliMi === 'Evet') {
            embed.addFields(
                { name: 'Verdiği Abone Rolü Sayısı', value: aboneRoluVermeSayisi.toString(), inline: true },
                { name: 'Son Rol Verme Tarihi', value: sonRolVermeTarihi, inline: true }
            );
        }

        embed.addFields(
            { name: 'Hesap Oluşturma Tarihi', value: user.createdAt.toLocaleDateString(), inline: true },
            { name: 'Sunucuya Katılma Tarihi', value: member.joinedAt.toLocaleDateString(), inline: true }
        );

        await interaction.reply({ embeds: [embed] });
    },
};