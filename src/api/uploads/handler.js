const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class UploadsHandler {
  constructor(storageService, albumService, validator) {
    this._storageService = storageService;
    this._albumService = albumService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);
    const { id } = request.params;

    const fileLocation = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = fileLocation.Location;

    await this._albumService.updateCoverAlbumById(id, coverUrl);

    return successResponse(h, {
      responseMessage: 'Cover uploaded successfully',
      responseCode: 201,
    });
  }
}

module.exports = UploadsHandler;
