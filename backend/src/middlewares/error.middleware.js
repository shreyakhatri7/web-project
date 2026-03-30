/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'A record with this unique field already exists.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
