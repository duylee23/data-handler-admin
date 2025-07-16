'use client';

import React, { useState, useEffect } from 'react';

interface RunningScript {
  id: number;
  scriptName: string;
  group: string;
  project: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Queued' | 'Paused';
  progress: number;
  startTime: string;
  estimatedCompletion: string;
  executionOrder?: number;
  logs: string[];
}

export default function ScriptTrackingPage() {
  const [runningScripts, setRunningScripts] = useState<RunningScript[]>([
    {
      id: 1,
      scriptName: 'preprocess_images.py',
      group: '2D_OD',
      project: 'TS',
      status: 'Running',
      progress: 65,
      startTime: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
      estimatedCompletion: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
      executionOrder: 1,
      logs: ['Starting image preprocessing...', 'Processing batch 1/10', 'Processing batch 4/10']
    },
    {
      id: 2,
      scriptName: 'yolo_detection.py',
      group: '2D_OD',
      project: 'TS',
      status: 'Queued',
      progress: 0,
      startTime: '',
      estimatedCompletion: '',
      executionOrder: 2,
      logs: ['Waiting for preprocess_images.py to complete...']
    },
    {
      id: 3,
      scriptName: 'lidar_processor.py',
      group: '3D_OD',
      project: '42 DOT',
      status: 'Running',
      progress: 30,
      startTime: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      estimatedCompletion: new Date(Date.now() + 1200000).toISOString(), // 20 minutes from now
      executionOrder: 1,
      logs: ['Initializing LIDAR data processor...', 'Loading point cloud data...', 'Processing frame 150/500']
    },
    {
      id: 4,
      scriptName: 'traffic_light_detector.py',
      group: '2D_TLD',
      project: 'HUYNDAI',
      status: 'Completed',
      progress: 100,
      startTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      estimatedCompletion: new Date(Date.now() - 300000).toISOString(), // completed 5 minutes ago
      executionOrder: 1,
      logs: ['Script completed successfully', 'Processed 1000 images', 'Detection accuracy: 97.5%']
    },
    {
      id: 5,
      scriptName: 'depth_analysis.py',
      group: '3D_TLD',
      project: 'INFINIQ',
      status: 'Failed',
      progress: 45,
      startTime: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      estimatedCompletion: '',
      executionOrder: 1,
      logs: ['Starting depth analysis...', 'Error: CUDA out of memory', 'Script failed at line 247']
    }
  ]);

  const [selectedScript, setSelectedScript] = useState<RunningScript | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRunningScripts(prevScripts => 
        prevScripts.map(script => {
          if (script.status === 'Running' && script.progress < 100) {
            const newProgress = Math.min(script.progress + Math.random() * 5, 100);
            const newStatus = newProgress >= 100 ? 'Completed' : 'Running';
            
            return {
              ...script,
              progress: Math.round(newProgress),
              status: newStatus as RunningScript['status'],
              estimatedCompletion: newStatus === 'Completed' 
                ? new Date().toISOString() 
                : script.estimatedCompletion
            };
          }
          return script;
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const start = new Date(dateString);
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const getEstimatedTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const estimated = new Date(dateString);
    const diffMs = estimated.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Completed';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `~${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    return `~${diffHours}h ${diffMins % 60}m`;
  };

  const stopScript = (id: number) => {
    setRunningScripts(prevScripts =>
      prevScripts.map(script =>
        script.id === id ? { ...script, status: 'Failed' as RunningScript['status'] } : script
      )
    );
  };

  const pauseScript = (id: number) => {
    setRunningScripts(prevScripts =>
      prevScripts.map(script =>
        script.id === id && script.status === 'Running' 
          ? { ...script, status: 'Paused' as RunningScript['status'] } 
          : script
      )
    );
  };

  const resumeScript = (id: number) => {
    setRunningScripts(prevScripts =>
      prevScripts.map(script =>
        script.id === id && script.status === 'Paused' 
          ? { ...script, status: 'Running' as RunningScript['status'] } 
          : script
      )
    );
  };

  const showLogs = (script: RunningScript) => {
    setSelectedScript(script);
    setIsLogsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Queued': return 'bg-yellow-100 text-yellow-800';
      case 'Paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-blue-500';
      case 'Completed': return 'bg-green-500';
      case 'Failed': return 'bg-red-500';
      case 'Paused': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  const runningCount = runningScripts.filter(s => s.status === 'Running').length;
  const queuedCount = runningScripts.filter(s => s.status === 'Queued').length;
  const completedCount = runningScripts.filter(s => s.status === 'Completed').length;
  const failedCount = runningScripts.filter(s => s.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Script Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor real-time script execution and progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Updates</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2-8a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-semibold text-blue-600">{runningCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Queued</p>
              <p className="text-2xl font-semibold text-yellow-600">{queuedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-semibold text-red-600">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Script Execution Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Script
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runningScripts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No scripts currently running.
                  </td>
                </tr>
              ) : (
                runningScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {script.executionOrder && (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full mr-3">
                            {script.executionOrder}
                          </span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{script.scriptName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {script.group}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {script.project}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(script.status)}`}>
                        {script.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(script.status)}`}
                          style={{ width: `${script.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{script.progress}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                      <div>Started: {getTimeAgo(script.startTime)}</div>
                      <div>ETA: {getEstimatedTime(script.estimatedCompletion)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs Modal */}
      {isLogsModalOpen && selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Script Logs - {selectedScript.scriptName}
              </h3>
              <button 
                onClick={() => setIsLogsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {selectedScript.logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{formatTime(new Date().toISOString())}]</span> {log}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 