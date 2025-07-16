'use client';

import { useState, useRef } from 'react';

interface Setting {
  id: string;
  input: string;
  output: string;
  groupType: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([
    { id: '1', input: '/data/input', output: '/data/output', groupType: 'Data Processing' },
    { id: '2', input: '/logs/raw', output: '/logs/processed', groupType: 'Log Processing' },
    { id: '3', input: '/temp/uploads', output: '/temp/processed', groupType: 'File Upload' },
  ]);

  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [newSetting, setNewSetting] = useState({
    input: '',
    output: '',
    groupType: ''
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);

  const handleAddSetting = () => {
    if (newSetting.input && newSetting.output && newSetting.groupType) {
      const newId = (settings.length + 1).toString();
      setSettings([...settings, { ...newSetting, id: newId }]);
      setNewSetting({ input: '', output: '', groupType: '' });
      setShowFileExplorer(false);
    }
  };

  const handleDeleteSetting = (id: string) => {
    setSettings(settings.filter(setting => setting.id !== id));
  };

  const handleDirectorySelect = (type: 'input' | 'output') => {
    const input = type === 'input' ? inputRef.current : outputRef.current;
    if (input) {
      input.click();
    }
  };

  const handleDirectoryChange = (type: 'input' | 'output', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Get the directory path from the first file
      const path = files[0].webkitRelativePath.split('/')[0];
      setNewSetting({ ...newSetting, [type]: path });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure system preferences and input/output settings</p>
        </div>
        <button 
          onClick={() => setShowFileExplorer(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Setting
        </button>
      </div>

      {/* Input/Output Settings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Input/Output Settings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Input Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {setting.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{setting.input}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{setting.output}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {setting.groupType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteSetting(setting.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden file inputs for directory selection */}
      <input
        ref={inputRef}
        type="file"
        {...({ webkitdirectory: "", directory: "" } as any)}
        style={{ display: 'none' }}
        onChange={(e) => handleDirectoryChange('input', e)}
      />
      <input
        ref={outputRef}
        type="file"
        {...({ webkitdirectory: "", directory: "" } as any)}
        style={{ display: 'none' }}
        onChange={(e) => handleDirectoryChange('output', e)}
      />

      {/* File Explorer Modal */}
      {showFileExplorer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Setting</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Path
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newSetting.input}
                    onChange={(e) => setNewSetting({...newSetting, input: e.target.value})}
                    placeholder="Select input folder"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                  <button
                    onClick={() => handleDirectorySelect('input')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 transition-colors"
                  >
                    Browse
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click Browse to select a folder</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Path
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newSetting.output}
                    onChange={(e) => setNewSetting({...newSetting, output: e.target.value})}
                    placeholder="Select output folder"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                  <button
                    onClick={() => handleDirectorySelect('output')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 transition-colors"
                  >
                    Browse
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click Browse to select a folder</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type
                </label>
                <select
                  value={newSetting.groupType}
                  onChange={(e) => setNewSetting({...newSetting, groupType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select group type</option>
                  <option value="Data Processing">Data Processing</option>
                  <option value="Log Processing">Log Processing</option>
                  <option value="File Upload">File Upload</option>
                  <option value="Backup">Backup</option>
                  <option value="Export">Export</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFileExplorer(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSetting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Setting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Auto Backup</h3>
                  <p className="text-sm text-gray-500">Automatically backup data daily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Debug Mode</h3>
                  <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 