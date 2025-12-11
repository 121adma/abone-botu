const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-rol-ayarla')
        .setDescription('Abone rolünü ayarlar')
        .addRoleOption(option => option.setName('rol').setDescription('Ayarlanacak abone rolü').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client, croxydb) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }

        const role = interaction.options.getRole('rol');
        
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'Bu rol benden üstte, bu rolü ayarlayamam!', ephemeral: true });
        }

        croxydb.set(`aboneRol_${interaction.guild.id}`, role.id);

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Abone Rolü Ayarlandı')
            .setDescription(`Abone rolü ${role} olarak ayarlandı.`);

        await interaction.reply({ embeds: [embed] });

        
        const logChannelId = croxydb.get(`logKanal_${interaction.guild.id}`);
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#36393f')
                    .setTitle('Abone Rolü Güncellendi')
                    .setDescription(`${interaction.user} tarafından abone rolü ${role} olarak ayarlandı.`);
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};