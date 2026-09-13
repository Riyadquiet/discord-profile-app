require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const USER_ID = process.env.USER_ID;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/profile', async (req, res) => {
    try {
        const response = await axios.get(`https://discord.com/api/v10/users/${USER_ID}`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });

        const user = response.data;
        
        // 1. Get Avatar
        const avatarHash = user.avatar;
        const isAnimated = avatarHash && avatarHash.startsWith('a_');
        const extension = isAnimated ? 'gif' : 'png';
        const avatarUrl = avatarHash 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${extension}?size=256`
            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;

        // 2. Get Server Tag (Primary Guild)
        let serverTag = null;
        let serverTagIcon = null;

        // Check if the user has a primary guild and the bot can see it
        if (user.primary_guild && user.primary_guild.identity_guild_id) {
            serverTag = user.primary_guild.tag;
            const guildId = user.primary_guild.identity_guild_id;
            const badgeHash = user.primary_guild.badge;

            // If there is a badge icon, construct the URL
            if (badgeHash) {
                const isAnimatedBadge = badgeHash.startsWith('a_');
                const badgeExt = isAnimatedBadge ? 'gif' : 'png';
                serverTagIcon = `https://cdn.discordapp.com/guild-tag-badges/${guildId}/${badgeHash}.${badgeExt}`;
            }
        }

        res.json({
            success: true,
            username: user.username,
            displayName: user.global_name || user.username,
            avatarUrl: avatarUrl,
            serverTag: serverTag,
            serverTagIcon: serverTagIcon
        });

    } catch (error) {
        console.error("Bot Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: "Failed to fetch data." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running! Open: http://localhost:${PORT}`);
});