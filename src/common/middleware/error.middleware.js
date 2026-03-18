const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Handle Prisma specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Unique constraint violation';
    errorCode = 'CONFLICT';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error_code: errorCode,
  });
};

module.exports = { errorMiddleware };
