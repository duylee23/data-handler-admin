import { BaseApiService } from './authService';



export interface AddGroupRequest {
    groupName: string,
    groupDescription : string,
    createdBy: string,
    scripts: any[]
}
// Group service for all group-related operations
export class GroupService extends BaseApiService {
  // Get all groups
  async getGroups(): Promise<{success: boolean, data?: any[], message?: string, count?: number}> {
    try {
      const response = await fetch(`${this.baseUrl}/api/group/list`, {
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
          message: 'Failed to fetch groups'
        };
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch groups'
      };
    }
  }

  async addGroup(groupData: AddGroupRequest): Promise<{success: boolean, data?: any[], message?: string}> {
        try {
            const response = await fetch(`${this.baseUrl}/api/group/add`, {
              method: 'POST',
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
              };
            } else {
              return {
                success: false,
                message: 'Failed to fetch groups'
              };
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            return {
              success: false,
              message: error instanceof Error ? error.message : 'Failed to fetch groups'
            };
        }
    }


  // Future group operations can be added here:
  // async editGroup(groupId: number, groupData: EditGroupRequest): Promise<GroupResponse>
  // async deleteGroup(groupId: number): Promise<GroupResponse>
}

export const groupService = new GroupService();
