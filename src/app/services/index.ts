// Export all services for easy importing
export { authService, BaseApiService, AuthService } from './authService';
export { scriptService, ScriptService } from './scriptService';
export { projectService, ProjectService } from './projectService';
export { groupService, GroupService } from './groupService';
export { userService, UserService } from './userService';

// Export all types
export type { 
  UploadScriptRequest, 
  UploadScriptResponse,
  ApiResponse
} from './scriptService';

export type {
  Project,
  AddProjectRequest,
  EditProjectRequest,
  AddProjectResponse,
  ProjectResponse
} from './projectService';

export type {
  AddUserRequest,
  UserResponse
} from './userService';

// Backwards compatibility - combined service class
import { scriptService } from './scriptService';
import { projectService } from './projectService';
import { groupService } from './groupService';
import { userService } from './userService';
import { authService } from './authService';

// Combined API service for backwards compatibility
export class ApiService {
  // Script methods
  uploadScript = scriptService.uploadScript.bind(scriptService);
  getScripts = scriptService.getScripts.bind(scriptService);
  deleteScript = scriptService.deleteScript.bind(scriptService);
  editScript = scriptService.editScript.bind(scriptService);
  runScript = scriptService.runScript.bind(scriptService);
  getScriptDropdownData = scriptService.getScriptDropdownData.bind(scriptService);

  // Project methods
  getProjects = projectService.getProjects.bind(projectService);
  addProject = projectService.addProject.bind(projectService);
  editProject = projectService.editProject.bind(projectService);
  deleteProject = projectService.deleteProject.bind(projectService);
  getProjectDropdown = projectService.getProjectDropdownData.bind(projectService);

  // Group methods
  getGroups = groupService.getGroups.bind(groupService);
  addGroups = groupService.addGroup.bind(groupService)
  // User methods
  getUsers = userService.getUsers.bind(userService);
  addUser = userService.addUser.bind(userService);
  deleteUser = userService.deleteUser.bind(userService);

  // Auth methods
  getCurrentUser = authService.getCurrentUser.bind(authService);
  getCurrentUsername = authService.getCurrentUsername.bind(authService);
}

// Export singleton instance for backwards compatibility
export const apiService = new ApiService(); 