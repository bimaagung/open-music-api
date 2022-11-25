const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class PlaylistsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationsHandler(request, h) {
    this._validator.validateCollaborationsPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._usersService.verifyUserId(userId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationsService.addCollaborator(playlistId, userId);

    return successResponse(h, {
      responseData: { collaborationId },
      responseCode: 201,
    });
  }

  async deleteCollaborationsHandler(request, h) {
    this._validator.validateCollaborationsPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaborator(playlistId, userId);

    return successResponse(h, {
      responseMessage: 'playlist successfully deleted',
    });
  }
}

module.exports = PlaylistsHandler;
