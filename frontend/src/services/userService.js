import api from './api';

class UserService {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  }
  
  async importUsers(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  async updateUser(userId, data) {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  }
}

const userService = new UserService();
export default userService;