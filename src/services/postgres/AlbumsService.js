const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const mapDBToModelAlbum = require('../../utils/model/mapDBToModelAlbum');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async getAlbums() {
    const album = await this._pool.query('SELECT * FROM albums');
    return album.rows.map(mapDBToModelAlbum);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const album = await this._pool.query(query);

    if (!album.rowCount) {
      throw new NotFoundError('Album not found');
    }

    return album.rows.map(mapDBToModelAlbum)[0];
  }

  async createAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const album = await this._pool.query(query);

    if (!album.rows[0].id) {
      throw new InvariantError('Failed to create album');
    }

    return album.rows[0].id;
  }

  async updateAlbumById(id, { name, year }) {
    const updatedAt = new Date().toDateString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, "updatedAt" = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const album = await this._pool.query(query);

    if (!album.rowCount) {
      throw new NotFoundError('Failed to updated album, Id not found');
    }
  }

  async updateCoverAlbumById(id, coverUrl) {
    const updatedAt = new Date().toDateString();

    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1, "updatedAt" = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };

    const albumId = await this._pool.query(query);

    if (!albumId.rowCount) {
      throw new NotFoundError('cover failed to upload, Id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const album = await this._pool.query(query);

    if (!album.rowCount) {
      throw new NotFoundError('Failed to delete album, Id not found');
    }
  }
}

module.exports = AlbumsService;
