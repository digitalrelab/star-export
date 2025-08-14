import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { getPlatformConfig } from '../config/platforms';

const HistoryPage: React.FC = () => {
  const { jobs, clearCompleted } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Export History</h1>
            <div className="space-x-4">
              <button
                onClick={clearCompleted}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Completed
              </button>
              <Link
                to="/"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                New Export
              </Link>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                No exports yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start your first export to see the history here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Export
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const platform = getPlatformConfig(job.platform);
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {platform?.icon || '📄'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {platform?.displayName || job.platform} Export
                          </h3>
                          <p className="text-sm text-gray-600">
                            {job.createdAt.toLocaleDateString()} at{' '}
                            {job.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : job.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {job.status}
                        </div>
                        {job.status === 'running' && (
                          <div className="mt-2 text-sm text-gray-600">
                            {job.progress}% complete
                          </div>
                        )}
                        {job.status === 'completed' && job.downloadUrl && (
                          <a
                            href={job.downloadUrl}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                    {job.status === 'running' && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {job.error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{job.error}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;