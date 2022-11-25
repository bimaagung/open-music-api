const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const ErrorNotFound = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaborator(playlistId, userId) {
    const id = `collaboration-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const collaboration = await this._pool.query(query);

    if (!collaboration.rows[0].id) {
      throw new InvariantError('Failed add collaborator');
    }

    return collaboration.rows[0].id;
  }

  async deleteCollaborator(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const collaboration = await this._pool.query(query);

    if (!collaboration.rowCount) {
      throw new ErrorNotFound('Collaborator not found');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const collaborator = await this._pool.query(query);

    if (!collaborator.rowCount) {
      throw new InvariantError('Collaboration failed to verify');
    }
  }
}

module.exports = CollaborationsService;
