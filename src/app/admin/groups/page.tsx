'use client';

import React, { useState } from 'react';
import {apiService} from '../../lib/apiService'
interface ScriptOrder {
  script: string;
  order: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  createdBy: string;
  project: string;
  scripts: ScriptOrder[];
}

export default function GroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group []>([]);


  // const loadGroups = async () => {
  //   try{
  //     setIsLoading(true);
  //     setError('');
  //     const result = await apiService.getGroups();
  //   }
  // }
  
  //mock data 
  // const [groups, setGroups] = useState<Group[]>([
  //   {
  //     id: 1,
  //     name: '2D_OD',
  //     description: '2D Object Detection group for image analysis',
  //     createdDate: '2024-01-15',
  //     createdBy: 'John Doe',
  //     project: 'TS',
  //     scripts: [
  //       { script: 'preprocess_images.py', order: 1 },
  //       { script: 'yolo_detection.py', order: 2 }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: '3D_OD',
  //     description: '3D Object Detection for point cloud processing',
  //     createdDate: '2024-01-12',
  //     createdBy: 'Jane Smith',
  //     project: '42 DOT',
  //     scripts: [
  //       { script: 'lidar_processor.py', order: 1 },
  //       { script: 'pointnet_detection.py', order: 2 }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     name: '2D_TLD',
  //     description: '2D Traffic Light Detection system',
  //     createdDate: '2024-01-10',
  //     createdBy: 'Bob Johnson',
  //     project: 'HUYNDAI',
  //     scripts: [
  //       { script: 'traffic_light_detector.py', order: 1 }
  //     ]
  //   },
  //   {
  //     id: 4,
  //     name: '3D_TLD',
  //     description: '3D Traffic Light Detection with depth analysis',
  //     createdDate: '2024-01-08',
  //     createdBy: 'Alice Brown',
  //     project: 'INFINIQ',
  //     scripts: [
  //       { script: 'depth_analysis.py', order: 1 },
  //       { script: '3d_traffic_detector.py', order: 2 }
  //     ]
  //   },
  // ]);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    project: '',
    scripts: [] as ScriptOrder[],
  });

  const [editGroup, setEditGroup] = useState<Group | null>(null);

  const availableProjects = [
    'TS',
    '42 DOT',
    'HUYNDAI',
    'INFINIQ'
  ];

  const availableScripts = [
    'yolo_detection.py',
    'pointnet_detection.py',
    'traffic_light_detector.py',
    '3d_traffic_detector.py',
    'preprocess_images.py',
    'lidar_processor.py',
    'depth_analysis.py',
    'data_augmentation.py',
    'model_trainer.py',
    'inference_engine.py'
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddGroup = () => {
    if (newGroup.name.trim() && newGroup.project) {
      const group: Group = {
        id: Math.max(...groups.map(g => g.id)) + 1,
        name: newGroup.name,
        description: newGroup.description,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Current User', // In real app, get from auth context
        project: newGroup.project,
        scripts: newGroup.scripts,
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', description: '', project: '', scripts: [] });
      setIsModalOpen(false);
    }
  };

  const handleEdit = (group: Group) => {
    setEditGroup(group);
    setIsEditModalOpen(true);
  };

  const handleUpdateGroup = () => {
    if (editGroup) {
      setGroups(groups.map(g => 
        g.id === editGroup.id ? editGroup : g
      ));
      setEditGroup(null);
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setGroups(groups.filter(g => g.id !== id));
    setIsDeleting(null);
  };

  const addScript = (isEdit = false) => {
    const scripts = isEdit && editGroup ? editGroup.scripts : newGroup.scripts;
    const maxOrder = scripts.length > 0 ? Math.max(...scripts.map(s => s.order)) : 0;
    const newScript = { script: '', order: maxOrder + 1 };

    if (isEdit && editGroup) {
      setEditGroup({ ...editGroup, scripts: [...editGroup.scripts, newScript] });
    } else {
      setNewGroup({ ...newGroup, scripts: [...newGroup.scripts, newScript] });
    }
  };

  const removeScript = (index: number, isEdit = false) => {
    if (isEdit && editGroup) {
      const updatedScripts = editGroup.scripts.filter((_, i) => i !== index);
      setEditGroup({ ...editGroup, scripts: updatedScripts });
    } else {
      const updatedScripts = newGroup.scripts.filter((_, i) => i !== index);
      setNewGroup({ ...newGroup, scripts: updatedScripts });
    }
  };

  const updateScript = (index: number, field: 'script' | 'order', value: string | number, isEdit = false) => {
    if (isEdit && editGroup) {
      const updatedScripts = [...editGroup.scripts];
      updatedScripts[index] = { ...updatedScripts[index], [field]: value };
      setEditGroup({ ...editGroup, scripts: updatedScripts });
    } else {
      const updatedScripts = [...newGroup.scripts];
      updatedScripts[index] = { ...updatedScripts[index], [field]: value };
      setNewGroup({ ...newGroup, scripts: updatedScripts });
    }
  };

  const ScriptOrderComponent = ({ scripts, isEdit = false }: { scripts: ScriptOrder[], isEdit?: boolean }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Scripts (in execution order)
        </label>
        <button
          type="button"
          onClick={() => addScript(isEdit)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Script
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto space-y-2">
        {scripts.map((scriptOrder, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
            <input
              type="number"
              min="1"
              value={scriptOrder.order}
              onChange={(e) => updateScript(index, 'order', parseInt(e.target.value) || 1, isEdit)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Order"
            />
            <select
              value={scriptOrder.script}
              onChange={(e) => updateScript(index, 'script', e.target.value, isEdit)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Select script...</option>
              {availableScripts.map((script) => (
                <option key={script} value={script}>{script}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeScript(index, isEdit)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {scripts.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No scripts added yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-2">Manage and organize groups with their associated scripts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Group
        </button>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Groups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scripts (Execution Order)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No groups found. Add your first group to get started.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        {group.description && (
                          <div className="text-sm text-gray-500">{group.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(group.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {group.project}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 max-w-xs">
                        {group.scripts.length > 0 ? (
                          group.scripts
                            .sort((a, b) => a.order - b.order)
                            .map((scriptOrder, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                                  {scriptOrder.order}
                                </span>
                                <span className="text-xs text-gray-700 truncate">
                                  {scriptOrder.script}
                                </span>
                              </div>
                            ))
                        ) : (
                          <span className="text-xs text-gray-400">No scripts</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(group)}
                          disabled={isDeleting === group.id}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(group.id)}
                          disabled={isDeleting === group.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {isDeleting === group.id && (
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isDeleting === group.id ? 'Deleting...' : 'Delete'}
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

      {/* Add Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Group</h3>
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
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter group name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter group description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  value={newGroup.project}
                  onChange={(e) => setNewGroup({ ...newGroup, project: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a project...</option>
                  {availableProjects.map((project) => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <ScriptOrderComponent scripts={newGroup.scripts} isEdit={false} />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                disabled={!newGroup.name.trim() || !newGroup.project}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && editGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Group</h3>
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
                  Group Name *
                </label>
                <input
                  type="text"
                  value={editGroup.name}
                  onChange={(e) => setEditGroup({ ...editGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter group name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editGroup.description || ''}
                  onChange={(e) => setEditGroup({ ...editGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter group description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  value={editGroup.project}
                  onChange={(e) => setEditGroup({ ...editGroup, project: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a project...</option>
                  {availableProjects.map((project) => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <ScriptOrderComponent scripts={editGroup.scripts} isEdit={true} />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroup}
                disabled={!editGroup.name.trim() || !editGroup.project}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 