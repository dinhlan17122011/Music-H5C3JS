document.addEventListener("DOMContentLoaded", () => {
  const songList = document.getElementById("song-list");
  const audio = document.getElementById("audio");
  const cover = document.getElementById("cover");
  const title = document.getElementById("title");
  const artist = document.getElementById("artist");
  const playButton = document.getElementById("play");
  const progress = document.getElementById("progress");
  const volumeControl = document.getElementById("volume");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const currentTimeElement = document.getElementById("current-time");
  const totalTimeElement = document.getElementById("total-time");
  const fileInput = document.getElementById("file-input");
  const uploadButton = document.getElementById("upload");
  const videoTitleInput = document.getElementById("video-title");
  const searchVideoButton = document.getElementById("search-video");
  const videoSuggestions = document.getElementById("video-suggestions");

  let currentSongIndex = 0;
  let isPlaying = false;
  let songs = [];

  // Tải danh sách bài hát từ file JSON
  fetch("songs.json")
      .then(response => response.json())
      .then(data => {
          songs = data;
          loadSong(songs[currentSongIndex]);
          songs.forEach((song, index) => {
              const songItem = document.createElement("li");
              songItem.textContent = `${song.title} - ${song.artist}`;
              songItem.addEventListener("click", () => {
                  currentSongIndex = index;
                  loadSong(songs[currentSongIndex]);
                  playSong();
              });
              songList.appendChild(songItem);
          });

          // Nút Play/Pause
          playButton.addEventListener("click", () => {
              isPlaying ? pauseSong() : playSong();
          });

          // Nút Previous
          prevButton.addEventListener("click", () => {
              currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
              loadSong(songs[currentSongIndex]);
              playSong();
          });

          // Nút Next
          nextButton.addEventListener("click", () => {
              currentSongIndex = (currentSongIndex + 1) % songs.length;
              loadSong(songs[currentSongIndex]);
              playSong();
          });

          // Cập nhật tổng thời gian khi bài hát tải xong
          audio.addEventListener("loadedmetadata", () => {
              totalTimeElement.textContent = formatTime(audio.duration);
          });

          // Cập nhật thời gian hiện tại và thanh tiến độ khi phát
          audio.addEventListener("timeupdate", () => {
              currentTimeElement.textContent = formatTime(audio.currentTime);
              updateProgress();
          });

          // Điều chỉnh thời gian phát
          progress.addEventListener("input", setProgress);

          // Điều chỉnh âm lượng
          volumeControl.addEventListener("input", setVolume);
      })
      .catch(error => console.error("Lỗi khi tải danh sách bài hát:", error));

  // Hàm tải bài hát
  function loadSong(song) {
      audio.src = song.source;
      cover.src = song.cover;
      title.textContent = song.title;
      artist.textContent = song.artist;
      resetProgress();
  }

  // Hàm phát bài hát
  function playSong() {
      audio.play();
      isPlaying = true;
      playButton.textContent = "⏸️";
  }

  // Hàm dừng bài hát
  function pauseSong() {
      audio.pause();
      isPlaying = false;
      playButton.textContent = "▶️";
  }

  // Đặt lại thanh tiến độ
  function resetProgress() {
      progress.value = 0;
      currentTimeElement.textContent = "00:00";
      totalTimeElement.textContent = "00:00";
  }

  // Cập nhật thanh tiến độ
  function updateProgress() {
      progress.value = (audio.currentTime / audio.duration) * 100;
  }

  // Đặt thời gian phát từ thanh tiến độ
  function setProgress() {
      audio.currentTime = (progress.value / 100) * audio.duration;
  }

  // Đặt âm lượng
  function setVolume() {
      audio.volume = volumeControl.value;
  }

  // Định dạng thời gian
  function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
  }

  // Tải bài hát từ file
  uploadButton.addEventListener("click", () => {
      const file = fileInput.files[0];
      if (file) {
          const url = URL.createObjectURL(file);
          const newSong = {
              title: file.name,
              artist: "Người dùng",
              source: url,
              cover: "cover.jpg" // Bạn có thể thay đổi bằng ảnh khác nếu cần
          };
          songs.push(newSong);
          const songItem = document.createElement("li");
          songItem.textContent = `${newSong.title} - ${newSong.artist}`;
          songItem.addEventListener("click", () => {
              currentSongIndex = songs.length - 1;
              loadSong(newSong);
              playSong();
          });
          songList.appendChild(songItem);
      }
  });

  // Tìm kiếm video từ YouTube
  searchVideoButton.addEventListener("click", () => {
      const query = videoTitleInput.value;
      if (query) {
          fetchVideos(query);
      }
  });

  // Hàm tìm kiếm video trên YouTube
  function fetchVideos(query) {
      const apiKey = "AIzaSyBeL3VAnWpf78WHk7MDR5yNkHdsiloeluY"; // Thay YOUR_YOUTUBE_API_KEY bằng API key của bạn
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=5`;

      fetch(url)
          .then(response => response.json())
          .then(data => {
              videoSuggestions.innerHTML = "";
              data.items.forEach(item => {
                  const videoItem = document.createElement("div");
                  videoItem.innerHTML = `
                      <h4>${item.snippet.title}</h4>
                      <iframe width="250" height="140" src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
                  `;
                  videoSuggestions.appendChild(videoItem);
              });
          })
          .catch(error => console.error("Lỗi khi tìm kiếm video:", error));
  }
});
