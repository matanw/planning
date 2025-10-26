import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

interface DataManagementProps {
  onClearAllData: () => void;
  onConfigureSupabase: () => void;
}

const DataManagement: React.FC<DataManagementProps> = () => {
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(true); // Always show on first load if no credentials
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // Load existing credentials
  useEffect(() => {
    const url = localStorage.getItem('supabase_config_url');
    const key = localStorage.getItem('supabase_config_key');
    setSupabaseUrl(url || '');
    setSupabaseKey(key || '');
    
    // If credentials exist, hide the modal
    if (url && key) {
      setShowSupabaseConfig(false);
    }
  }, []);


  const handleConfigureSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Please enter both Supabase URL and Anon Key.');
      return;
    }
    localStorage.setItem('supabase_config_url', supabaseUrl);
    localStorage.setItem('supabase_config_key', supabaseKey);
    setShowSupabaseConfig(false);
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      {!(supabaseUrl && supabaseKey) && (
        <button
          onClick={() => setShowSupabaseConfig(true)}
          className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
          title="Configure Supabase Database"
        >
          <Settings className="w-4 h-4 mr-1" />
          Setup Database Required
        </button>
      )}

      {/* Supabase Configuration Modal */}
      {showSupabaseConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Database Setup Required</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This app requires a Supabase database. Get your credentials from:<br />
                <strong>Settings → API → Project URL & anon key</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Don't have a Supabase account?</strong><br />
                  Create one at <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a>
                </p>
              </div>
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                  >
                    Save & Continue
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

