const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/response');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler({ payload }, h) {
    this._validator.validateUserPayload(payload);

    const userId = await this._service.addUser(payload);

    return successResponse(h, {
      responseData: { userId },
      responseCode: 201,
    });
  }
}

module.exports = UsersHandler;
