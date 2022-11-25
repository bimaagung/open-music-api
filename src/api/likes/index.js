const LikesHanlder = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { likesService, albumService }) => {
    const likesHandler = new LikesHanlder(likesService, albumService);
    server.route(routes(likesHandler));
  },
};
