const XLSX = require('xlsx');

class ExcelParser {
  async parseUsers(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map(row => ({
      nom: row.nom || row.Nom || row.name || row.Name,
      email: row.email || row.Email || row.mail || row.Mail,
      role: this.validateRole(row.role || row.Role)
    })).filter(user => user.nom && user.email);
  }
  
  validateRole(role) {
    const validRoles = ['apprenant', 'formateur'];
    if (role && validRoles.includes(role.toLowerCase())) {
      return role.toLowerCase();
    }
    return 'apprenant';
  }
}

module.exports = new ExcelParser();