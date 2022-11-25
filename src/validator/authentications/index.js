const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const valdationResult = PostAuthenticationPayloadSchema.validate(payload);

    if (valdationResult.error) {
      throw new InvariantError(valdationResult.error.message);
    }
  },

  validatePutAuthenticationPayload: (payload) => {
    const valdationResult = PutAuthenticationPayloadSchema.validate(payload);

    if (valdationResult.error) {
      throw new InvariantError(valdationResult.error.message);
    }
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const valdationResult = DeleteAuthenticationPayloadSchema.validate(payload);

    if (valdationResult.error) {
      throw new InvariantError(valdationResult.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;
