const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postHandlerPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    return successResponse(h, {
      responseMessage: 'Your request is being processed',
      responseCode: 201,
    });
  }
}

module.exports = ExportsHandler;
