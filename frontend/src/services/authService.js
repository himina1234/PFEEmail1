import api from './api';

class AuthService {
  async login(matricule, password) {
    const response = await api.post('/auth/login', { matricule, password });
    return response.data;
  }
}

const authService = new AuthService();
export default authService;