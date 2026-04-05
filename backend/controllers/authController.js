const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { matricule, password } = req.body;
      const result = await authService.login(matricule, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();