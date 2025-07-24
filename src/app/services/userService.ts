import { BaseApiService } from './authService';

// User-related interfaces
export interface AddUserRequest {
  username: string;
  password: string;
  email: string;
  role: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: any;
}

// User service for all user management operations
export class UserService extends BaseApiService {

  // Get all users
  async getUsers(): Promise<{success: boolean, data?: any[], message?: string, count?: number}> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/list`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          data: result.data,
          count: result.count
        };
      } else {
        return {
          success: false,
          message: 'Failed to fetch users'
        };
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  // Add a new user
  async addUser(userData: AddUserRequest): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/add`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          // Read response as text first
          const errorText = await response.text();
          try {
            // Try to parse as JSON
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text directly
            errorMessage = errorText || errorMessage;
          }
        } catch {
          // If can't read response, use default message
        }
        throw new Error(errorMessage);
      }

      // Read response as text first, then try to parse as JSON
      const textResult = await response.text();
      let result;
      let message = 'User added successfully';
      
      try {
        // Try to parse the text as JSON
        result = JSON.parse(textResult);
        message = result.message || message;
      } catch {
        // If it's not JSON, treat it as plain text message
        message = textResult || message;
        result = { message: textResult };
      }

      return {
        success: true,
        message: message,
        data: result
      };
    } catch (error) {
      console.error('Error adding user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add user'
      };
    }
  }

  // Delete a user
  async deleteUser(userId: number): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/delete/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          // Read response as text first
          const errorText = await response.text();
          try {
            // Try to parse as JSON
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text directly
            errorMessage = errorText || errorMessage;
          }
        } catch {
          // If can't read response, use default message
        }
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }
}

export const userService = new UserService(); 