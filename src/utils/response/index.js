const successResponse = (h, {
  responseMessage, responseData,
  responseCode = 200, responseHeader = null,
  valueResponseHeader = null,
}) => {
  const response = {
    status: 'success',
  };

  if (responseMessage) {
    response.message = responseMessage;
  }

  if (responseData) {
    response.data = responseData;
  }

  if (responseHeader !== null) {
    return h.response(response).header(responseHeader, valueResponseHeader).code(responseCode);
  }
  return h.response(response).code(responseCode);
};

const failResponse = (h, error) => (
  h.response({
    status: 'fail',
    message: error.message,
  }).code(error.statusCode));

const errorResponse = (h) => (
  h.response({
    status: 'error',
    message: 'Terjadi kesalahan di sisi server',
  }).code(500));

module.exports = { successResponse, failResponse, errorResponse };
