const errorMiddleware = (err, req, res, next) => {
  console.error('Erreur:', err);
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Donnée en double',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(500).json({ 
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorMiddleware;