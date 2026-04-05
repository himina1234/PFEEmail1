const User = require('../models/User');
const { generateToken } = require('../config/jwt');

class AuthService {
  async login(matricule, password) {
    const user = await User.findOne({ matricule });
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }
    
    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }
    
    const token = generateToken(user._id, user.role);
    
    return {
      token,
      user: {
        id: user._id,
        nom: user.nom,
        matricule: user.matricule,
        email: user.email,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();