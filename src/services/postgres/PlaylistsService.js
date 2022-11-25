const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModelPlaylist = require('../../utils/model/mapDBToModelPlaylist');
const mapDBToModelSong = require('../../utils/model/mapDBToModelSong');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, createdAt],
    };

    const playlist = await this._pool.query(query);

    if (!playlist.rows[0].id) {
      throw new InvariantError('Failed to add playlist');
    }

    return playlist.rows[0].id;
  }

  async getPlaylistsByOwner(owner) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON u.id = p.owner WHERE p.owner = $1',
      values: [owner],
    };
    const playlist = await this._pool.query(query);

    if (!playlist.rowCount) {
      const playlistColaborator = await this.getPlaylistsByCollaborator(owner);

      return playlistColaborator.rows.map(mapDBToModelPlaylist);
    }

    return playlist.rows.map(mapDBToModelPlaylist);
  }

  async getPlaylistsByCollaborator(userId) {
    const query = {
      text: 'select p.*, u.* from playlists p left join collaborations c on c.playlist_id = p.id left join users u on u.id  = p."owner" where c.user_id  = $1',
      values: [userId],
    };
    const playlist = await this._pool.query(query);

    return playlist;
  }

  async getPlaylistsById(id) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id],
    };
    const playlist = await this._pool.query(query);

    if (!playlist.rowCount) {
      throw new NotFoundError('playlist not found');
    }

    return playlist.rows.map(mapDBToModelPlaylist)[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async addSongOnPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const playlistSong = await this._pool.query(query);

    if (!playlistSong.rows[0].id) {
      throw new InvariantError('Failed to add song on playlist');
    }
  }

  async getSongsOnPlaylistByPlaylistId(id) {
    const query = {
      text: 'SELECT s.id , s.title, s.performer FROM playlist_songs ps LEFT JOIN songs s ON s.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [id],
    };
    const playlist = await this._pool.query(query);

    return playlist.rows.map(mapDBToModelSong);
  }

  async deleteSongOnPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const playlistSongs = await this._pool.query(query);

    if (!playlistSongs.rowCount) {
      throw new InvariantError('Failed to delete son on playlist, song id or playlist id not found');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const playlist = await this._pool.query(query);

    if (!playlist.rowCount) {
      throw new NotFoundError('playlist not found');
    }

    const ownerPlaylist = playlist.rows[0].owner;

    if (ownerPlaylist !== owner) {
      throw new AuthorizationError('you are not entitled to access this resource');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    const activity = await this._pool.query(query);

    if (!activity.rows[0].id) {
      throw new InvariantError('Failed to add activty');
    }
  }

  async getActivitiesInPlaylist(id) {
    const query = {
      text: 'SELECT u.username, s.title, ac.action, ac.time FROM playlist_song_activities ac LEFT JOIN users u ON u.id = ac.user_id LEFT JOIN songs s ON s.id = ac.song_id WHERE ac.playlist_id = $1',
      values: [id],
    };

    const activity = await this._pool.query(query);

    return activity.rows;
  }
}

module.exports = PlaylistsService;
