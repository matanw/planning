import React, { useState } from 'react';
import { Trash2, Settings } from 'lucide-react';

interface DataManagementProps {
  onClearAllData: () => void;
  onConfigureSupabase: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onClearAllData }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // Load existing credentials
  React.useEffect(() => {
    setSupabaseUrl(localStorage.getItem('supabase_config_url') || '');
    setSupabaseKey(localStorage.getItem('supabase_config_key') || '');
  }, []);

  const handleClearData = () => {
    if (window.confirm('⚠️ This will delete ALL tasks from localStorage. This cannot be undone. Are you absolutely sure?')) {
      onClearAllData();
      setShowConfirm(false);
    }
  };

  const handleConfigureSupabase = () => {
    localStorage.setItem('supabase_config_url', supabaseUrl);
    localStorage.setItem('supabase_config_key', supabaseKey);
    setShowSupabaseConfig(false);
    alert('✅ Supabase credentials saved!\n\nPlease refresh the page to switch to cloud storage.');
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setShowSupabaseConfig(true)}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        title="Configure Supabase"
      >
        <Settings className="w-4 h-4 mr-1" />
        Settings
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
        title="Clear all data from localStorage"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Clear localStorage
      </button>

      {/* Clear Data Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Danger Zone</h3>
              <p className="text-gray-600 mb-4">
                This will permanently delete ALL tasks from localStorage. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearData}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete All Data
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Configuration Modal */}
      {showSupabaseConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Configure Supabase</h3>
                <button
                  onClick={() => setShowSupabaseConfig(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Get these from your Supabase project: <br />
                Settings → API → Project URL & anon key
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGc..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleConfigureSupabase}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSupabaseConfig(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;

