const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class AlbumsHandler {
  constructor(albumService, songService, validator) {
    this._albumService = albumService;
    this._songService = songService;
    this._validator = validator;

    autoBind(this);
  }

  async getAlbumsHandler(h) {
    const album = await this._albumService.getAlbums();

    return successResponse(h, {
      responseData: album,
    });
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._albumService.getAlbumById(id);
    const albumId = album.id;
    const songs = await this._songService.getSongsByAlbumId(albumId);

    return successResponse(h, {
      responseData: {
        album: {
          ...album,
          songs,
        },
      },
    });
  }

  async postAlbumHandler({ payload }, h) {
    this._validator.validateAlbumPayload(payload);

    const albumId = await this._albumService.createAlbum(payload);

    return successResponse(h, {
      responseMessage: 'Successfully added album',
      responseData: { albumId },
      responseCode: 201,
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._albumService.updateAlbumById(id, { name, year });

    return successResponse(h, {
      responseMessage: 'Successfully updated album',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumService.deleteAlbumById(id);

    return successResponse(h, {
      responseMessage: 'Successfully deleted album',
    });
  }
}

module.exports = AlbumsHandler;
