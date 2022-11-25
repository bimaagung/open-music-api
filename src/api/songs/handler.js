const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs({ title, performer });

    return successResponse(h, {
      responseData: { songs },
    });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    return successResponse(h, {
      responseData: { song },
    });
  }

  async postSongHandler({ payload }, h) {
    this._validator.validateSongPayload(payload);

    const songId = await this._service.createSong(payload);

    return successResponse(h, {
      responseMessage: 'Successfully added song',
      responseData: { songId },
      responseCode: 201,
    });
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    await this._service.updateSongById(id, {
      title, year, performer, genre, duration, albumId,
    });

    return successResponse(h, {
      responseMessage: 'Successfully updated song',
    });
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return successResponse(h, {
      responseMessage: 'Successfully deleted song',
    });
  }
}

module.exports = SongsHandler;
