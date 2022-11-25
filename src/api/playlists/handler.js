const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsservice = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    return successResponse(h, {
      responseData: { playlistId },
      responseCode: 201,
    });
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylistsByOwner(credentialId);

    return successResponse(h, {
      responseData: { playlists },
    });
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return successResponse(h, {
      responseMessage: 'playlist successfully deleted',
    });
  }

  async postSongOnPlaylistHandler(request, h) {
    this._validator.validatePostSongOnPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._songsservice.getSongById(songId);

    await this._playlistsService.addSongOnPlaylist(playlistId, songId);

    await this._playlistsService.addActivity(playlistId, songId, credentialId, 'add');

    return successResponse(h, {
      responseMessage: 'song successfully added to playlist',
      responseCode: 201,
    });
  }

  async getSongsOnPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistsById(playlistId);
    const songs = await this._playlistsService.getSongsOnPlaylistByPlaylistId(playlistId);

    return successResponse(h, {
      responseData: {
        playlist:
        {
          ...playlist,
          songs,
        },
      },
    });
  }

  async deleteSongOnPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsService.deleteSongOnPlaylistById(playlistId, songId);

    await this._playlistsService.addActivity(playlistId, songId, credentialId, 'delete');

    return successResponse(h, {
      responseMessage: 'the song was successfully removed from the playlist',
    });
  }

  async getActivitiesInPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistsById(playlistId);
    const activities = await this._playlistsService.getActivitiesInPlaylist(playlistId);

    return successResponse(h, {
      responseData: {
        playlistId: playlist.id,
        activities,
      },
    });
  }
}

module.exports = PlaylistsHandler;
