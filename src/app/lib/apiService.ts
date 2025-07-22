interface UploadScriptRequest {
  file: File;
  description: string;
  groupType: string;
  scriptName: string
}

interface UploadScriptResponse {
  success: boolean;
  message: string;
  scriptId?: string;
  data?: any;
}

class ApiService {
  private baseUrl = '';
  // Get auth token from cookies
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Simple cookie parsing - in production use js-cookie library
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }

  // Get headers with authorization
  private getHeaders(includeContentType = true): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  //add a new script
  async uploadScript(scriptData: UploadScriptRequest): Promise<UploadScriptResponse> {
    try {
      const formData = new FormData();
      formData.append('file', scriptData.file);
      formData.append('description', scriptData.description);
      formData.append('groupType', scriptData.groupType);
      formData.append('scriptName', scriptData.scriptName);
      const headers = this.getHeaders(false); // Don't include Content-Type for FormData
      
      const response = await fetch(`${this.baseUrl}/script/upload`, {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Script uploaded successfully',
        scriptId: result.id,
        data: result
      };
    } catch (error) {
      console.error('Error uploading script:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload script'
      };
    }
  }

  async getScripts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/script/get-all`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching scripts:', error);
      return [];
    }
  }

  async deleteScript(scriptId: string): Promise<UploadScriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/script/delete/${scriptId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Ressult", response)
      return {
        success: true,
        message: 'Script deleted successfully',
        data: null
      };
    } catch (error) {
      console.error('Error deleting script:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete script'
      };
    }
  }

  async editScript(scriptId: string, scriptData: { name?: string; description?: string; groupType?: string }): Promise<UploadScriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/script/edit/${scriptId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(scriptData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Script updated successfully',
        data: result
      };
    } catch (error) {
      console.error('Error updating script:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update script'
      };
    }
  }

  async runScript(scriptId: string): Promise<UploadScriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/script/${scriptId}/run`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Script started successfully',
        data: result
      };
    } catch (error) {
      console.error('Error running script:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to run script'
      };
    }
  }

  // User Management APIs
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

  async addUser(userData: {username: string, password: string, email: string, role: string}): Promise<UploadScriptResponse> {
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

  async deleteUser(userId: number): Promise<UploadScriptResponse> {
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

export const apiService = new ApiService();
export type { UploadScriptRequest, UploadScriptResponse }; 