const User = require('../models/User');
const { generatePassword } = require('../utils/passwordGenerator');

class UserService {
  async createUsersFromExcel(usersData) {
    const createdUsers = [];
    const errors = [];

    for (const userData of usersData) {
      try {
        const password = generatePassword();
        const matricule = this.generateMatricule(userData.role);
        
        const user = new User({
          nom: userData.nom,
          email: userData.email,
          matricule,
          password,
          role: userData.role
        });
        
        await user.save();
        createdUsers.push({ 
          ...user.toObject(), 
          password // Inclure le mot de passe généré dans la réponse
        });
      } catch (error) {
        errors.push({ user: userData, error: error.message });
      }
    }
    
    return { createdUsers, errors };
  }

  generateMatricule(role) {
    const prefix = role === 'formateur' ? 'F' : 'A';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async getAllUsers(filters = {}) {
    return await User.find(filters).select('-password');
  }

  async getUserById(userId) {
    return await User.findById(userId).select('-password');
  }

  async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }
}

module.exports = new UserService();