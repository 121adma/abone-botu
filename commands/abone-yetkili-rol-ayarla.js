const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abone-yetkili-rol-ayarla')
        .setDescription('Abone yetkili rolünü ayarlar')
        .addRoleOption(option => option.setName('rol').setDescription('Ayarlanacak yetkili rolü').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client, croxydb) {
       
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }

        const role = interaction.options.getRole('rol');
        
        
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'Bu rol benden üstte, bu rolü yetkili rolü olarak ayarlayamam!', ephemeral: true });
        }

        croxydb.set(`yetkiliRol_${interaction.guild.id}`, role.id);

        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setTitle('Abone Yetkili Rolü Ayarlandı')
            .setDescription(`Abone yetkili rolü ${role} olarak ayarlandı.`);

        await interaction.reply({ embeds: [embed] });

        
        const logChannelId = croxydb.get(`logKanal_${interaction.guild.id}`);
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#36393f')
                    .setTitle('Abone Yetkili Rolü Güncellendi')
                    .setDescription(`${interaction.user} tarafından abone yetkili rolü ${role} olarak ayarlandı.`);
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};