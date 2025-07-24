import { BaseApiService } from './authService';

// Script-related interfaces
export interface UploadScriptRequest {
  file: File;
  description: string;
  name: string;
}

export interface UploadScriptResponse {
  success: boolean;
  message: string;
  scriptId?: string;
  data?: any;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

// Script service for all script-related operations
export class ScriptService extends BaseApiService {
  
  // Upload a new script
  async uploadScript(scriptData: UploadScriptRequest): Promise<UploadScriptResponse> {
    try {
      // Get current user for createdBy field
      const createdBy = this.getCurrentUsername();

      const formData = new FormData();
      formData.append('file', scriptData.file);
      formData.append('description', scriptData.description);
      formData.append('createdBy', createdBy);
      formData.append('name', scriptData.name);
      
      const headers = this.getHeaders(false); 
      console.log('Making request to:', `${this.baseUrl}/api/script/upload`);
      console.log('Request headers:', headers);
      console.log('Auth token:', this.getAuthToken());
      
      const response = await fetch(`${this.baseUrl}/api/script/upload`, {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        // Try to get the error message from response
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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

  // Get all scripts
  async getScripts(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/script/get-all`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching scripts:', error);
      return {
        status: 'error',
        data: []
      };
    }
  }

  // Delete a script
  async deleteScript(scriptId: string): Promise<UploadScriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/script/delete/${scriptId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Result", response);
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

  // Edit a script
  async editScript(scriptId: string, scriptData: { name?: string; description?: string; groupType?: string }): Promise<UploadScriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/script/edit/${scriptId}`, {
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

  // Run a script
  async runScript(scriptId: string): Promise<UploadScriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/script/${scriptId}/run`, {
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

  // Get available scripts for dropdown (simplified script list)
  async getScriptDropdownData(): Promise<{success: boolean, data?: any, message?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/api/script/dropdown`, {
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
          data: result.data || []
        };
      } else {
        return {
          success: false,
          message: 'Failed to fetch available scripts'
        };
      }
    } catch (error) {
      console.error('Error fetching available scripts:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch available scripts'
      };
    }
  }
}

export const scriptService = new ScriptService();
