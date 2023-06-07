// Get the login button element
const loginButton = document.getElementById('login-button');

// Add a click event listener to the login button
loginButton.addEventListener('click', () => {
  // Replace 'YOUR_CLIENT_ID' with your actual Spotify Client ID
  const clientId = '9a1ea0d3040b46e49ba14e5f02e56a7d';
  const redirectUri = 'http://localhost:3000/callback';

  const scopes = ['user-read-currently-playing', 'playlist-read-private', 'user-modify-playback-state'];

  // Construct the authorization URL
  const authorizeUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&redirect_uri=' + encodeURIComponent(redirectUri);

  // Redirect the user to the authorization URL
  window.location.href = authorizeUrl;

});
function playRandomSong() {
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    fetch(`/play-random-song/${track.id}`)
      .then(response => {
        if (response.ok) {
          console.log(`Now playing: ${track.name}`);
        } else {
          console.error('Failed to play random song.');
        }
      })
      .catch(error => console.error('An error occurred:', error));
  }