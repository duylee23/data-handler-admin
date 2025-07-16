'use client';

import React, { useState, useEffect } from 'react';
import { apiService, type UploadScriptRequest } from '../../lib/apiService';

interface ScriptConfig {
  id: number;
  name: string;
  description: string;
  groupType: string;
  destination: string;
  createdBy: string;
  updatedBy: string | null;
  createdTime: string;
  updatedTime: string | null;
}

interface NewScript {
  file: File | null;
  description: string;
  groupType: string;
  scriptName: string;
}

interface EditScript {
  id: number;
  name: string;
  description: string;
  groupType: string;
}

export default function ScriptsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scripts, setScripts] = useState<ScriptConfig[]>([]);
  const [newScript, setNewScript] = useState<NewScript>({
    file: null,
    scriptName: '',
    description: '',
    groupType: ''
  });
  const [editScript, setEditScript] = useState<EditScript>({
    id: 0,
    name: '',
    description: '',
    groupType: ''
  });

  const scriptGroups = [
    'Data Processing',
    'Analytics',
    'Backup & Maintenance',
    'Notifications',
    'Utilities',
    'Custom'
  ];

  // Function to get file type from destination path
  // const getFileType = (destination: string) => {
  //   const extension = destination.split('.').pop()?.toLowerCase();
  //   switch (extension) {
  //     case '2D': return '2D';
  //     case '3D': return '3D';
  //     case 'sh': return 'Shell';
  //     case 'rb': return 'Ruby';
  //     case 'php': return 'PHP';
  //     case 'go': return 'Go';
  //     case 'java': return 'Java';
  //     case 'ts': return 'TypeScript';
  //     default: return 'Unknown';
  //   }
  // };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch scripts from API
  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      const scriptsData = await apiService.getScripts();
      setScripts(scriptsData);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch scripts on component mount
  useEffect(() => {
    fetchScripts();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewScript(prev => ({ ...prev, file }));
    // Clear any previous messages when user selects a new file
    setUploadMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!newScript.file || !newScript.description || !newScript.groupType) {
      console.log(newScript);
      setUploadMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const uploadData: UploadScriptRequest = {
        file: newScript.file,
        description: newScript.description,
        groupType: newScript.groupType,
        scriptName : newScript.scriptName
      };

      console.log(uploadData);

      const result = await apiService.uploadScript(uploadData);

      if (result.success) {
        setUploadMessage({ type: 'success', text: result.message });
        // Reset form and close modal after a short delay to show success message
        setTimeout(() => {
          setNewScript({ file: null, description: '', groupType: '', scriptName: '' });
          setIsModalOpen(false);
          setUploadMessage(null);
          // Refresh the scripts list
          fetchScripts();
        }, 2000);
      } else {
        setUploadMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setUploadMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred while uploading the script' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalClose = () => {
    if (!isUploading) {
      setIsModalOpen(false);
      setNewScript({ file: null, description: '', groupType: '', scriptName: '' });
      setUploadMessage(null);
    }
  };

  const handleEditModalClose = () => {
    if (!isUpdating) {
      setIsEditModalOpen(false);
      setEditScript({ id: 0, name: '', description: '', groupType: '' });
      setEditMessage(null);
    }
  };

  const handleEdit = (script: ScriptConfig) => {
    setEditScript({
      id: script.id,
      name: script.name,
      description: script.description,
      groupType: 'Custom' // Default group since we don't have this info from API
    });
    setIsEditModalOpen(true);
    setEditMessage(null);
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!editScript.name || !editScript.description || !editScript.groupType) {
      setEditMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsUpdating(true);
    setEditMessage(null);

    try {
      const result = await apiService.editScript(editScript.id.toString(), {
        name: editScript.name,
        description: editScript.description,
        groupType: editScript.groupType
      });

      if (result.success) {
        setEditMessage({ type: 'success', text: result.message });
        // Reset form and close modal after a short delay to show success message
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditMessage(null);
          // Refresh the scripts list
          fetchScripts();
        }, 2000);
      } else {
        setEditMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setEditMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred while updating the script' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (scriptId: number) => {
    if (window.confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
      try {
        setIsDeleting(scriptId);
        const result = await apiService.deleteScript(scriptId.toString());
        if (result.success) {
          // Refresh the scripts list
          fetchScripts();
          // You could show a success toast here
        } else {
          alert('Failed to delete script: ' + result.message);
        }
      } catch (error) {
        alert('Error deleting script');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scripts</h1>
          <p className="text-gray-600 mt-2">Manage and monitor automated scripts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Script
        </button>
      </div>

      {/* Scripts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Script
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2 text-gray-600">Loading scripts...</span>
                    </div>
                  </td>
                </tr>
              ) : scripts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No scripts found. Add your first script to get started.
                  </td>
                </tr> 
              ) : (
                scripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{script.name}</div>
                        <div className="text-sm text-gray-500">{script.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Path: {script.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {script.groupType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {script.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(script.createdTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {script.updatedTime ? formatDate(script.updatedTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(script)}
                          disabled={isDeleting === script.id}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(script.id)}
                          disabled={isDeleting === script.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {isDeleting === script.id && (
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isDeleting === script.id ? 'Deleting...' : 'Delete'}
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

      {/* Add Script Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Add New Script</h3>
                <button 
                  onClick={handleModalClose}
                  disabled={isUploading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Upload Message */}
              {uploadMessage && (
                <div className={`p-3 rounded-md ${
                  uploadMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="text-sm">{uploadMessage.text}</p>
                </div>
              )}



              {/* File name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Script Name
                </label>
                <input
                  value={newScript.scriptName}
                  onChange={(e) => setNewScript(prev => ({ ...prev, scriptName: e.target.value }))}
                  placeholder="Enter script name..."
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>


              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Script File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".py,.js,.sh,.rb,.php,.go,.java,.ts"
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {newScript.file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {newScript.file.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newScript.description}
                  onChange={(e) => setNewScript(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a description for this script..."
                  rows={3}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group
                </label>
                <select
                  value={newScript.groupType}
                  onChange={(e) => setNewScript(prev => ({ ...prev, groupType: e.target.value }))}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">Select a group...</option>
                  {scriptGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                  {isUploading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isUploading ? 'Uploading...' : 'Add Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Script Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Edit Script</h3>
                <button 
                  onClick={handleEditModalClose}
                  disabled={isUpdating}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Edit Message */}
              {editMessage && (
                <div className={`p-3 rounded-md ${
                  editMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="text-sm">{editMessage.text}</p>
                </div>
              )}

              {/* Script Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Script Name
                </label>
                <input
                  type="text"
                  value={editScript.name}
                  onChange={(e) => setEditScript(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter script name..."
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editScript.description}
                  onChange={(e) => setEditScript(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a description for this script..."
                  rows={3}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group
                </label>
                <select
                  value={editScript.groupType}
                  onChange={(e) => setEditScript(prev => ({ ...prev, groupType: e.target.value }))}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">Select a group...</option>
                  {scriptGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleEditModalClose}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                  {isUpdating && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isUpdating ? 'Updating...' : 'Update Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}