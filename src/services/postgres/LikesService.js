const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbumById(user_id, album_id) {
    const id = `album_like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, user_id, album_id],
    };

    await this._cacheService.delete(`like:${album_id}`);

    await this._pool.query(query);
  }

  async unlikeAlbumById(user_id, album_id) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [user_id, album_id],
    };

    const like = await this._pool.query(query);

    await this._cacheService.delete(`like:${album_id}`);
    return like.rowCount;
  }

  async totalLikeAlbum(id) {
    try {
      const result = await this._cacheService.get(`like:${id}`);
      return { resource: 'cache', data: JSON.parse(result) };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(user_id) FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const like = await this._pool.query(query);

      if (!like.rowCount) {
        throw new InvariantError('failed get total like album, Id not found');
      }

      const result = like.rows[0].count;

      await this._cacheService.set(`like:${id}`, JSON.stringify(result));

      return { resource: 'db', data: result };
    }
  }
}

module.exports = LikesService;
