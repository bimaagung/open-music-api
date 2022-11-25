const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongOnPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().max(50).required(),
});

module.exports = { PostPlaylistPayloadSchema, PostSongOnPlaylistPayloadSchema };
