// ==========================================
// 1. FETCH PROFILE FROM YOUR PRIVATE BOT
// ==========================================
async function fetchDiscordProfile() {
    try {
        const response = await fetch('/api/profile'); 
        const result = await response.json();

        if (result.success) {
            document.getElementById('display-name').textContent = result.displayName;
            document.getElementById('username').textContent = `@${result.username}`;
            document.getElementById('small-username').textContent = result.username;

            document.getElementById('avatar').src = result.avatarUrl;
            document.getElementById('small-avatar').src = result.avatarUrl;
            
            const tagContainer = document.getElementById('server-tag-container');
            const tagText = document.getElementById('server-tag-text');
            const tagIcon = document.getElementById('server-tag-icon');

            if (result.serverTag) {
                tagText.textContent = result.serverTag;
                tagContainer.classList.remove('hidden');
                if (result.serverTagIcon) {
                    tagIcon.src = result.serverTagIcon;
                    tagIcon.classList.remove('hidden');
                } else {
                    tagIcon.classList.add('hidden');
                }
            } else {
                tagContainer.classList.add('hidden');
            }
            console.log("✅ Profile loaded successfully!");
        } else {
            console.error("Bot Error:", result.error);
            document.getElementById('display-name').textContent = "Error Loading";
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

fetchDiscordProfile();

// ==========================================
// 2. ENTRY OVERLAY & AUDIO LOGIC
// ==========================================
const overlay = document.getElementById('entry-overlay');
const mainContent = document.getElementById('main-content');
const bgVideo = document.getElementById('bg-video');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');

overlay.addEventListener('click', () => {
    overlay.classList.add('hidden-overlay');
    bgVideo.classList.add('unblur');
    mainContent.style.opacity = '1';
    
    audio.volume = 0.5;
    audio.play().then(() => {
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }).catch(e => console.log("Audio play failed:", e));
});

// ==========================================
// 3. CUSTOM AUDIO PLAYER CONTROLS & SMOOTH SLIDER
// ==========================================
const seekSlider = document.getElementById('seek-slider');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
});

audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const duration = audio.duration;
    if (duration) {
        const progress = (current / duration) * 100;
        seekSlider.value = progress;

        // Update the slider background to show purple fill smoothly
        seekSlider.style.background = `linear-gradient(to right, #a855f7 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`;

        currentTimeEl.textContent = formatTime(current);
        durationEl.textContent = formatTime(duration);
    }
});

seekSlider.addEventListener('input', () => {
    const progress = seekSlider.value;
    seekSlider.style.background = `linear-gradient(to right, #a855f7 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`;

    const seekTime = (progress / 100) * audio.duration;
    audio.currentTime = seekTime;
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}