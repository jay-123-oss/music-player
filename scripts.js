const audio = document.getElementById('mainAudio');
        let currentPlaylist = [], currentIndex = 0, recentlyPlayed = [];
        let historyStack = [{ type: 'home', query: 'Trending' }], historyPos = 0;
        let allArtistsVisible = false;

        const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#eccc68', '#70a1ff'];
        const artists = [
  {
    name: "Arijit Singh",
    img: "https://i.scdn.co/image/ab6761610000e5ebf6d6a4fcd7c4b0b4e4f8b1e9"
  },
  {
    name: "Sidhu Moose Wala",
    img: "https://i.scdn.co/image/ab6761610000e5eb4e8c8c9b8e6c5f6d7a2b1c9d"
  },
  {
    name: "Diljit Dosanjh",
    img: "https://i.scdn.co/image/ab6761610000e5ebd8b3a1f7c9e6b4a2f5e9d1c8"
  },
  {
    name: "Taylor Swift",
    img: "https://i.scdn.co/image/ab6761610000e5ebe672b8d2f4e9c3b7a6d1f9e"
  },
  {
    name: "The Weeknd",
    img: "https://i.scdn.co/image/ab6761610000e5eb0f3c6a2b9d7e8c4f1a5b6d9"
  },
  {
    name: "Atif Aslam",
    img: "https://i.scdn.co/image/ab6761610000e5ebc8f7a2e9d4b6a5f3c1b8d9e"
  },
  {
    name: "Badshah",
    img: "https://i.scdn.co/image/ab6761610000e5eb5c8f6e9b4d2a7c1f3b8e9d"
  },
  {
    name: "Shreya Ghoshal",
    img: "https://i.scdn.co/image/ab6761610000e5eb9d4c2a7f8b6e5c1d3a9e8f"
  },
  {
    name: "Eminem",
    img: "https://i.scdn.co/image/ab6761610000e5eb1a9f3d7c6e8b2a4c5d9f8e"
  },
  {
    name: "KK",
    img: "https://i.scdn.co/image/ab6761610000e5eb7c6a9d5f8e3b1a2c4d9e8f"
  }
];

        function init() {
            renderArtists();
            const cats = ["Bollywood", "Punjabi", "Haryanvi", "Pop", "Hip-Hop", "Rock", "Classical", "Ghazal", "Devotional", "Jazz", "Indie", "K-Pop", "Telugu", "Tamil", "Marathi", "Bhojpuri", "Lo-fi", "Chill", "Romantic", "Sad", "Instrumental"];
            document.getElementById('categoryRow').innerHTML = cats.map(c => `<div class="chip" onclick="showProfile('${c}', '', 'Category')">${c}</div>`).join('');
            const tags = ["Trending", "Party", "Workout", "Study", "Sleep", "Motivation", "90s Hits", "80s Gold", "New", "Viral", "Top 50", "Wedding", "Retro", "Monsoon", "Midnight", "Travel", "Dance", "Healing", "Focus", "Gaming"];
            document.getElementById('tagRow').innerHTML = tags.map(t => `<div class="chip" onclick="showProfile('${t}', '', 'Mood Tag')">${t}</div>`).join('');
            updateNavButtons();
            loadInitialHome();
            loadLatest();
        }

        function updateNavButtons() {
            document.getElementById('backBtn').classList.toggle('disabled', historyPos <= 0);
            document.getElementById('fwdBtn').classList.toggle('disabled', historyPos >= historyStack.length - 1);
        }

        function renderArtists() {
            const list = allArtistsVisible ? artists : artists.slice(0, 8);
            document.getElementById('artistRow').innerHTML = list.map((a, i) => `
            <div class="artist-circle" style="--clr:${colors[i % 6]}" onclick="showProfile('${a.name}', '${a.img}', 'Artist')">
                <div class="artist-initial">${a.name[0]}</div>
                <img src="${a.img}">
                <div style="font-size:12px; font-weight:600">${a.name}</div>
            </div>
        `).join('');
        }

        function toggleArtists() { allArtistsVisible = !allArtistsVisible; renderArtists(); }

        async function loadInitialHome() {
            const queries = ['Latest', 'Punjabi Hits', 'Hindi Hits', 'English Pop'];
            let combined = [];
            for (let q of queries) {
                const res = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://saavn.sumit.co/api/search/songs?query=' + q + '&limit=20')}`);
                const json = await res.json();
                combined = [...combined, ...json.data.results];
            }
            currentPlaylist = combined;
            renderGrid();
        }

        function goHome() {
            if (historyStack[historyPos].type !== 'home') {
                historyStack = historyStack.slice(0, historyPos + 1);
                historyStack.push({ type: 'home', query: 'Trending' });
                historyPos++;
            }
            document.getElementById('profileBanner').style.display = 'none';
            document.getElementById('homeSections').style.display = 'block';
            loadInitialHome();
            updateNavButtons();
        }

        function navHistory(dir) {
            if (dir === -1 && historyPos > 0) {
                historyPos--;
                handleHistoryState(historyStack[historyPos]);
            } else if (dir === 1 && historyPos < historyStack.length - 1) {
                historyPos++;
                handleHistoryState(historyStack[historyPos]);
            }
            updateNavButtons();
        }

        function handleHistoryState(state) {
            if (state.type === 'home') goHome();
            else if (state.type === 'profile') showProfile(state.name, state.img, state.pType, false);
            else searchMusic(state.query, false, false);
        }

        async function showProfile(name, img, type, addToHistory = true) {
            if (addToHistory) {
                historyStack = historyStack.slice(0, historyPos + 1);
                historyStack.push({ type: 'profile', name, img, pType: type });
                historyPos++;
            }
            document.getElementById('profileBanner').style.display = 'flex';
            document.getElementById('profileName').innerText = name;
            document.getElementById('profileType').innerText = type;
            document.getElementById('homeSections').style.display = 'none';
            if (img) document.getElementById('profileImg').src = img;
            searchMusic(name, true, false);
            updateNavButtons();
        }

        async function searchMusic(q, isProfile = false, addToHistory = true) {
            if (addToHistory) {
                historyStack = historyStack.slice(0, historyPos + 1);
                historyStack.push({ type: 'search', query: q });
                historyPos++;
            }
            document.getElementById('gridTitle').innerText = isProfile ? "Top Tracks" : "Results: " + q;
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://saavn.sumit.co/api/search/songs?query=' + q + '&limit=40')}`);
            const json = await res.json();
            currentPlaylist = json.data.results;
            if (isProfile && currentPlaylist[0]) document.getElementById('profileImg').src = currentPlaylist[0].image[2].url;
            renderGrid();
            updateNavButtons();
            document.getElementById('mainScroll').scrollTop = 0;
        }

        function renderGrid() {
            document.getElementById('mainGrid').innerHTML = currentPlaylist.map((s, idx) => `
            <div class="song-card" onclick="playSong(${idx})">
                <img src="${s.image[2].url}">
                <div style="font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div>
                <div style="font-size:11px; color:var(--text-dim)">${s.artists.primary[0].name}</div>
            </div>
        `).join('');
        }

        async function loadLatest() {
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://saavn.sumit.co/api/search/songs?query=new&limit=12')}`);
            const data = await res.json();
            document.getElementById('latestSongs').innerHTML = data.data.results.map(s => `
            <div class="mini-card" onclick="playSongInstant('${s.name.replace(/'/g, "")}', '${s.artists.primary[0].name}', '${s.image[1].url}', '${s.downloadUrl[4].url}')">
                <img src="${s.image[0].url}">
                <div style="font-size:12px; font-weight:600">${s.name}</div>
            </div>
        `).join('');
        }

        function playSong(idx) {
            currentIndex = idx;
            const s = currentPlaylist[idx];
            playSongInstant(s.name, s.artists.primary[0].name, s.image[2].url, s.downloadUrl[4].url);
        }

        function playSongInstant(name, art, img, url) {
            document.getElementById('curTitle').innerText = name;
            document.getElementById('curArtist').innerText = art;
            document.getElementById('curImg').src = img;
            audio.src = url;
            audio.play();
            document.getElementById('playIcon').className = 'fas fa-pause';
            addToRecent(name, art, img, url);
        }

        function addToRecent(name, art, img, url) {
            if (!recentlyPlayed.find(s => s.url === url)) {
                recentlyPlayed.unshift({ name, art, img, url });
                document.getElementById('recentList').innerHTML = recentlyPlayed.slice(0, 10).map(s => `
                <div class="mini-card" onclick="playSongInstant('${s.name}', '${s.art}', '${s.img}', '${s.url}')">
                    <img src="${s.img}">
                    <div style="font-size:11px; font-weight:600">${s.name}</div>
                </div>
            `).join('');
            }
        }

        function togglePlay() {
            if (audio.paused) { audio.play(); document.getElementById('playIcon').className = 'fas fa-pause'; }
            else { audio.pause(); document.getElementById('playIcon').className = 'fas fa-play'; }
        }

        function skipTime(val) { audio.currentTime += val; }
        function nextSong() { if (currentIndex < currentPlaylist.length - 1) playSong(++currentIndex); }
        function prevSong() { if (currentIndex > 0) playSong(--currentIndex); }

        audio.onended = () => nextSong();
        audio.ontimeupdate = () => {
            const p = (audio.currentTime / audio.duration) * 100;
            document.getElementById('pFill').style.width = p + '%';
            document.getElementById('cTime').innerText = formatTime(audio.currentTime);
            if (audio.duration) document.getElementById('dTime').innerText = formatTime(audio.duration);
        };

        function seek(e) {
            const rect = document.querySelector('.p-bar').getBoundingClientRect();
            audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        }

        function formatTime(s) {
            const m = Math.floor(s / 60); const r = Math.floor(s % 60);
            return `${m}:${r < 10 ? '0' + r : r}`;
        }

        window.onload = init;