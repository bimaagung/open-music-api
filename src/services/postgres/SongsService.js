const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const mapDBToModelSong = require('../../utils/model/mapDBToModelSong');
const ErrorNotFound = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongs({ title = '', performer = '' }) {
    const query = {
      text: `SELECT id, title, performer FROM songs 
        WHERE title ILIKE  $1 AND performer ILIKE  $2`,
      values: [`%${title}%`, `%${performer}%`],
    };

    const song = await this._pool.query(query);

    return song.rows;
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" =  $1',
      values: [albumId],
    };

    const song = await this._pool.query(query);

    return song.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const song = await this._pool.query(query);

    if (!song.rowCount) {
      throw new ErrorNotFound('Song not found');
    }

    return song.rows.map(mapDBToModelSong)[0];
  }

  async createSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt],
    };

    const song = await this._pool.query(query);

    if (!song.rows[0].id) {
      throw new InvariantError('Failed to create song');
    }

    return song.rows[0].id;
  }

  async updateSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const updatedAt = new Date().toDateString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6, "updatedAt" = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const song = await this._pool.query(query);

    if (!song.rowCount) {
      throw new ErrorNotFound('Failed to updated song, Id not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const song = await this._pool.query(query);

    if (!song.rowCount) {
      throw new ErrorNotFound('Failed to delete song, Id not found');
    }
  }
}

module.exports = SongsService;
