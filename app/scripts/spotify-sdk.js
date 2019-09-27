window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQBdjj4L-o-_FKEBtffMLfi9aNpGmAEx8ttgwCcc3mKL1P6N-fP816r4nlLJ3O1DRM0Iq4zJ6L3toKxAfg9Bh2Z8SkkDFXsdvTGLYlvWmwhs6-vuemy2yuxKm6BpgdeEuc0uzVqu-mQiB-nRvf_FVhma6xNiETOLr_AQHQ';
    const player = new Spotify.Player({
      name: 'Shamify',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
  };