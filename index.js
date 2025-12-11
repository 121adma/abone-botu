// Gerekli Modüller
const { Client, GatewayIntentBits, Collection } = require('discord.js');
// Hata giderildi: REST ve Routes doğrudan discord.js'den çekiliyor.
const { REST, Routes } = require('discord.js'); 
const fs = require('fs');
const fetch = require('node-fetch'); // API çağrıları için
// config.json'dan hem token hem de api_key çekiliyor
const { token, api_key } = require('./config.json'); 
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const croxydb = require('croxydb');

client.commands = new Collection();
const commands = [];

// Komutları Yükleme
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// REST Yapılandırması (v9 yerine v10 veya daha yenisi kullanılır, ancak Discord.js bunu otomatik halleder)
const rest = new REST({ version: '10' }).setToken(token);

// Bot Hazır Olduğunda
client.once('ready', async () => {
    console.log('Bot hazır!');

    try {
        console.log('Slash komutları yükleniyor...');
        
        // Slash Komutlarını Discord'a kaydetme
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        
        console.log('Slash komutları başarıyla yüklendi!');
    } catch (error) {
        console.error('Slash komutları yüklenirken bir hata oluştu:', error);
    }
});

// ⏰ DEPREM BİLDİRİM KONTROL MEKANİZMASI (Her 5 Dakikada Bir)
setInterval(async () => {
    // API'den sadece en son depremi limit=1 ile çekiyoruz
    const API_URL = `https://deprem.cc/api/?endpoint=recent&limit=1&api_key=${api_key}`; 

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // API'den veri gelmediyse veya durum başarısız ise dur
        if (!data || !data.data || data.data.length === 0 || data.status !== 'success') return;

        const lastEarthquake = data.data[0];
        
        // Büyüklüğü 3.0'dan küçük olan depremleri yok say
        if (parseFloat(lastEarthquake.buyukluk) < 3.0) return; 
        
        // Bu deprem daha önce bildirildi mi kontrol et
        const eqKey = `sonDeprem_${lastEarthquake.zaman}_${lastEarthquake.buyukluk}_${lastEarthquake.konum}`; 

        if (croxydb.get(eqKey)) {
            return; 
        }

        croxydb.set(eqKey, true); // Yeni depremi kaydet
        
        // Tüm sunuculara bildirim gönderme
        client.guilds.cache.forEach(guild => {
            const channelId = croxydb.get(`depremKanal_${guild.id}`);
            if (channelId) {
                const channel = guild.channels.cache.get(channelId);
                if (channel) {
                    
                    const roleId = croxydb.get(`depremUyariRol_${guild.id}`);
                    let content = roleId ? `<@&${roleId}>` : ''; // Ayarlanan role ping at
                    
                    const embed = {
                        color: 0x00ccff, 
                        title: '🚨 YENİ DEPREM BİLDİRİMİ! 🚨',
                        description: `**${lastEarthquake.konum}** bölgesinde **M ${lastEarthquake.buyukluk}** büyüklüğünde deprem oldu!`, 
                        fields: [
                            { name: 'Büyüklük', value: `M ${lastEarthquake.buyukluk}`, inline: true },
                            { name: 'Derinlik', value: `${lastEarthquake.derinlik} km`, inline: true },
                            { name: 'Saat', value: `${lastEarthquake.zaman}`, inline: false },
                        ],
                        timestamp: new Date(),
                    };
                    
                    channel.send({ content: content, embeds: [embed] }).catch(console.error);
                }
            }
        });

    } catch (error) {
        console.error('Otomatik Deprem Kontrol Hatası:', error);
    }
}, 300000); // 5 dakika

// Komut Etkileşimlerini Yönetme
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client, croxydb);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Komut yürütülürken bir hata oluştu!', ephemeral: true });
    }
});

client.login(token);