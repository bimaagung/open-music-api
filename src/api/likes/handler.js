const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class LikesHandler {
  constructor(likesService, albumService) {
    this._likesService = likesService;
    this._albumService = albumService;

    autoBind(this);
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    let message = 'cancel like album';

    await this._albumService.getAlbumById(id);

    const unlike = await this._likesService.unlikeAlbumById(credentialId, id);

    if (!unlike) {
      await this._likesService.likeAlbumById(credentialId, id);
      message = 'like album';
    }

    return successResponse(h, {
      responseMessage: message,
      responseCode: 201,
    });
  }

  async getLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const like = await this._likesService.totalLikeAlbum(id);
    const totalLike = parseInt(like.data, 10);

    if (like.resource === 'db') {
      return successResponse(h, {
        responseData: { likes: totalLike },
        responseHeader: 'X-Data-Source',
        valueResponseHeader: like.resource,
      });
    }

    return successResponse(h, {
      responseData: { likes: totalLike },
      responseHeader: 'X-Data-Source',
      valueResponseHeader: like.resource,
    });
  }
}

module.exports = LikesHandler;
