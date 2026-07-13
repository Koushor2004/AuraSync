const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    spotifyId: String,
    name: String,
    artists: String,
    albumArt: String,
    previewUrl: String,
    externalUrl: String,
  },
  { _id: false }
);

const playlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emotion: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    tracks: [trackSchema],
    savedToSpotify: {
      type: Boolean,
      default: false,
    },
    spotifyPlaylistId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
