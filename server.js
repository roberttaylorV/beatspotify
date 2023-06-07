const express = require('express');
const app = express();
const port = 3000;
const SpotifyWebApi = require('spotify-web-api-node');

app.use(express.static('public'));
const scopes = ['user-read-currently-playing', 'playlist-read-private', 'user-modify-playback-state'];

// Create an instance of the SpotifyWebApi
const spotifyApi = new SpotifyWebApi({
  clientId: '9a1ea0d3040b46e49ba14e5f02e56a7d',
  clientSecret: 'e71e0643926645aca35659a97cee0b94',
  redirectUri: 'http://localhost:3000/callback',
  scope: scopes,
});

// Set the template engine and views directory
app.set('view engine', 'ejs');
app.set('views', './views');

// Define a route for the callback
app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  if (authorizationCode) {
    try {
      const authorizationCodeGrantResponse = await spotifyApi.authorizationCodeGrant(authorizationCode);
      const { access_token, refresh_token } = authorizationCodeGrantResponse.body;

      // Set the access token and refresh token on the Spotify Web API instance
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      // Get the user's profile data
      const { body: { display_name } } = await spotifyApi.getMe();

      // Get the user's public playlists
      const { body: { items: playlists } } = await spotifyApi.getUserPlaylists();

      // Render the success page with the user's display name and playlists
      res.render('success', { displayName: display_name, playlists });
    } catch (error) {
      console.error('Failed to exchange authorization code:', error);
      res.redirect('/error');
    }
  } else {
    res.redirect('/error');
  }
});

app.get('/success', (req, res) => {
  const displayName = req.query.displayName;
  const playlists = req.query.playlists;
  res.render('success', { displayName, playlists });
});

app.get('/error', (req, res) => {
  res.send('Authorization failed!');
});

app.get('/playlist/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId;

  try {
    const { body: { items: tracks } } = await spotifyApi.getPlaylistTracks(playlistId);

    if (tracks.length > 0) {
      const randomTrackIndex = Math.floor(Math.random() * tracks.length);
      const randomTrack = tracks[randomTrackIndex].track;
      await spotifyApi.play({ uris: [randomTrack.uri] });

      res.json(randomTrack);
    } else {
      res.status(404).send('The selected playlist is empty.');
    }
  } catch (error) {
    console.error('Failed to fetch playlist tracks:', error);
    res.status(500).send('Failed to fetch playlist tracks.');
  }
});

app.get('/current-track', async (req, res) => {
  try {
    const { body: { item: track } } = await spotifyApi.getMyCurrentPlayingTrack();
    res.json(track);
  } catch (error) {
    console.error('Failed to fetch current track:', error);
    res.status(500).send('Failed to fetch current track.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
