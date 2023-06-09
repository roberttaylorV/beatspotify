let currentAudio = null;
let volume = 0.35;
let player1Score = 0;
let currentTrack = null;
let guessStartTime = null;
let guessSubmitted = false;

function stopCurrentSong() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
    currentTrack = null;
  }
}

function playRandomSong(playlistId) {
  stopCurrentSong();

  fetch(`/playlist/${playlistId}`)
    .then(response => response.json())
    .then(track => {
      const audio = new Audio(track.preview_url);
      audio.volume = volume;
      currentAudio = audio;
      currentTrack = track;
      audio.play();

      // Update the progress bar
      const progressBarFill = document.querySelector('.progress-bar .fill');
      const updateProgressBar = setInterval(() => {
        if (audio.ended) {
          clearInterval(updateProgressBar);
          progressBarFill.style.width = '0%';
          stopCurrentSong();
        } else {
          const progress = (audio.currentTime / audio.duration) * 100;
          progressBarFill.style.width = `${progress}%`;
        }
      }, 100);

      // Clear the guess input field and result display
      const guessInput = document.getElementById('guessInput');
      const resultDisplay = document.getElementById('resultDisplay');
      guessInput.value = '';
      resultDisplay.textContent = '';

      if (!guessSubmitted) {
        // Listen for the guess submission
        const guessForm = document.getElementById('guessForm');
        guessForm.addEventListener('submit', (event) => {
          event.preventDefault();
          guessSubmitted = true;
          const userGuess = guessInput.value.trim().toLowerCase();
          const correctAnswer = currentTrack.name.toLowerCase();
          if (userGuess === correctAnswer) {
            resultDisplay.textContent = `Correct guess! Score: ${player1Score + 100}`;
            player1Score += 100;
          } else {
            resultDisplay.textContent = 'Incorrect guess!';
            player1Score = 0;
            guessStartTime = null;
          }

          // Update the score display on the page
          const player1ScoreDisplay = document.getElementById('player1Score');
          player1ScoreDisplay.textContent = player1Score;

          // Show the currently playing song after the guess
          const currentSong = document.getElementById('currentSong');
          currentSong.textContent = `Now playing: ${currentTrack.name}`;
          currentSong.style.display = 'block';
        });
      }

      // Set the guess start time when the user focuses on the input field
      guessInput.addEventListener('focus', () => {
        if (!guessSubmitted) {
          guessStartTime = new Date().getTime();
        }
      });
    })
    .catch(error => console.error('Failed to play random song:', error));
}

function updateVolume(value) {
  volume = value;
  if (currentAudio) {
    currentAudio.volume = volume;
  }
}