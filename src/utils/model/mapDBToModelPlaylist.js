const mapDBToModelPlaylist = ({
  id,
  name,
  username,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  username,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = mapDBToModelPlaylist;
