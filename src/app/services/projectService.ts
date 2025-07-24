import { BaseApiService } from './authService';

// Project-related interfaces
export interface Project {
  id?: number;
  projectName: string;
  description: string;
  status: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  groupListName?: string;
}

export interface AddProjectRequest {
  name: string;
  description: string;
  status: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdBy?: string;
}

export interface EditProjectRequest {
  name?: string;
  description?: string;
  status?: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface AddProjectResponse {
  success: boolean;
  message: string;
  data?: any;
  projectId?: number;
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data?: any;
}

// export interface ProjectDropDownResponse{
//     success 
// }

// Project service for all project-related operations
export class ProjectService extends BaseApiService {

  // Get all projects
  async getProjects(): Promise<{success: boolean, data?: any[], message?: string, count?: number}> {
    try {
      const response = await fetch(`${this.baseUrl}/api/project/list`, {
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
          message: 'Failed to fetch projects'
        };
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch projects'
      };
    }
  }

  // Add a new project
  async addProject(projectData: AddProjectRequest): Promise<AddProjectResponse> {
    try {
      // Get current user for createdBy field
      const createdBy = this.getCurrentUsername();
      
      // Add createdBy to the project data
      const projectWithCreatedBy = {
        ...projectData,
        createdBy: createdBy
      };

      const response = await fetch(`${this.baseUrl}/api/project/add`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(projectWithCreatedBy),
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
      let message = 'Project added successfully';
      
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
        data: result,
        projectId: result.id
      };
    } catch (error) {
      console.error('Error adding project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add project'
      };
    }
  }

  // Edit a project
  async editProject(projectId: number, projectData: EditProjectRequest): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/project/edit/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData),
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
      let message = 'Project updated successfully';
      
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
      console.error('Error editing project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to edit project'
      };
    }
  }

  // Delete a project
  async deleteProject(projectId: number): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/project/delete/${projectId}`, {
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
        message: 'Project deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete project'
      };
    }
  }

  async getProjectDropdownData(): Promise<ProjectResponse> {
    try {
        const response = await fetch(`${this.baseUrl}/api/project/dropdown`, {
            method: 'GET',
            headers: this.getHeaders(),
        }) ;
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json()
        if(result.status === 'success') {
            return {
                success: true,
                message: result.message,
                data: result.data || []
            };
        } else {
            return {
                success: false,
                message: 'Failed to fetch dropdown projects'
            };
        }
    } catch (error) {
        console.error('Error fetching dropdown projects:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to fetch dropdown projects'
        };
    }
  }

  
}

export const projectService = new ProjectService();
