import React, { useState, useCallback } from 'react';
import AddList from './components/Addlist';
import Display from './components/Display';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add some top padding and center the AddList */}
      <div className="pt-12 pb-16">
        <div className="flex justify-center">
          <AddList onRefresh={handleRefresh} />
        </div>
      </div>
      
      {/* Add margin-top for spacing */}
      <div className="mt-16">
        <Display refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}

export default App;