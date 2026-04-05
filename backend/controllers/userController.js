const userService = require('../services/userService');
const excelParser = require('../utils/excelParser');

class UserController {
  async importUsers(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni' });
      }
      
      const usersData = await excelParser.parseUsers(req.file.buffer);
      
      if (usersData.length === 0) {
        return res.status(400).json({ message: 'Aucune donnée valide dans le fichier' });
      }
      
      const result = await userService.createUsersFromExcel(usersData);
      
      res.status(201).json({
        message: `${result.createdUsers.length} utilisateurs créés sur ${usersData.length}`,
        users: result.createdUsers.map(u => ({
          nom: u.nom,
          matricule: u.matricule,
          email: u.email,
          role: u.role,
          password: u.password
        })),
        errors: result.errors
      });
    } catch (error) {
      console.error('Erreur import:', error);
      res.status(500).json({ message: error.message });
    }
  }
  
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers({ role: { $ne: 'admin' } });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();