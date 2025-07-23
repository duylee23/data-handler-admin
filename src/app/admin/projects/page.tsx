'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../../lib/apiService';

interface Project {
  id: number;
  name: string;
  createdDate: string;
  createdBy: string;
  groups: string[];
  description?: string;
}


export default function ProjectsPage() {
  // const [state, setState] = useState<type>(initial_value)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [error,setError] = useState<string>('')

 // Load users from API
 useEffect(() => {
  loadProjects();
}, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError('')
      const res = await apiService.getProjects();
      console.log( 'RES', res)
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }
  //mock data
  // const [projects, setProjects] = useState<Project[]>([
  //   {
  //     id: 1,
  //     name: 'TS',
  //     createdDate: '2024-01-15',
  //     createdBy: 'John Doe',
  //     groups: ['3D_OD', '2D_OD'],
  //     description: 'Comprehensive data analytics and visualization platform'
  //   },
  //   {
  //     id: 2,
  //     name: '42 DOT',
  //     createdDate: '2024-01-10',
  //     createdBy: 'Jane Smith',
  //     groups: ['2D_OD', '3D_TLD'],
  //     description: 'Complete user authentication and management solution'
  //   },
  //   {
  //     id: 3,
  //     name: 'HUYNDAI',
  //     createdDate: '2024-01-08',
  //     createdBy: 'Bob Johnson',
  //     groups: ['2D_OD'],
  //     description: 'Automated file processing and conversion utilities'
  //   },
  //   {
  //     id: 4,
  //     name: 'INFINIQ',
  //     createdDate: '2024-01-05',
  //     createdBy: 'Alice Brown',
  //     groups: ['2D_OD'],
  //     description: 'Automated backup and disaster recovery system'
  //   },
  // ]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    groups: [] as string[],
  });

  const [editProject, setEditProject] = useState<Project | null>(null);

  const availableGroups = [
    '2D_OD',
    '2D_TLD', 
    '3D_TLD',
    '3D_OD',
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      const project: Project = {
        id: Math.max(...projects.map(p => p.id)) + 1,
        name: newProject.name,
        description: newProject.description,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Current User', // In real app, get from auth context
        groups: newProject.groups,
      };
      setProjects([...projects, project]);
      setNewProject({ name: '', description: '', groups: [] });
      setIsModalOpen(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = () => {
    if (editProject) {
      setProjects(projects.map(p => 
        p.id === editProject.id ? editProject : p
      ));
      setEditProject(null);
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProjects(projects.filter(p => p.id !== id));
    setIsDeleting(null);
  };

  const handleGroupToggle = (group: string, isEdit = false) => {
    if (isEdit && editProject) {
      const updatedGroups = editProject.groups.includes(group)
        ? editProject.groups.filter(g => g !== group)
        : [...editProject.groups, group];
      setEditProject({ ...editProject, groups: updatedGroups });
    } else {
      const updatedGroups = newProject.groups.includes(group)
        ? newProject.groups.filter(g => g !== group)
        : [...newProject.groups, group];
      setNewProject({ ...newProject, groups: updatedGroups });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all projects</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Groups
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No projects found. Add your first project to get started.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500">{project.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(project.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {project.groups.length > 0 ? (
                          project.groups.map((group, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {group}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No groups</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(project)}
                          disabled={isDeleting === project.id}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          disabled={isDeleting === project.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {isDeleting === project.id && (
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isDeleting === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Project</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groups
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableGroups.map((group) => (
                    <label key={group} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProject.groups.includes(group)}
                        onChange={() => handleGroupToggle(group)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{group}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={!newProject.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Project</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editProject.description || ''}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groups
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableGroups.map((group) => (
                    <label key={group} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProject.groups.includes(group)}
                        onChange={() => handleGroupToggle(group, true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{group}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                disabled={!editProject.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 