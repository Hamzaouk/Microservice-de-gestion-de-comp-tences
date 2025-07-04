import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Code,
  Save
} from 'lucide-react';

const Display = ({ refreshTrigger }) => {
  const [competences, setCompetences] = useState([]);
  const [filteredCompetences, setFilteredCompetences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  // Calculate the new global status based on majority rule
// const validatedCount = updatedSubCompetences.filter(sc => sc.validated).length;
// const totalCount = updatedSubCompetences.length;
// const globalStatus = validatedCount > totalCount / 2 ? 'validated' : 'not validated';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/competences');
      setCompetences(res.data);
      setFilteredCompetences(res.data);
    } catch (error) {
      console.error('Error fetching competences:', error);
      setError('Failed to fetch competences. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCompetence = async (id) => {
    if (!window.confirm('Are you sure you want to delete this competence? This action cannot be undone.')) return;
    
    try {
      setDeletingId(id);
      await axios.delete(`http://localhost:5000/competences/${id}`);
      // Instead of fetchData(), update state directly
      const updatedCompetences = competences.filter(c => c._id !== id);
      setCompetences(updatedCompetences);
      setFilteredCompetences(updatedCompetences);
    } catch (error) {
      console.error('Error deleting competence:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const updateSubCompetenceValidation = async (competenceId, subCompetenceIndex, validated) => {
    try {
      setUpdatingId(competenceId);
      
      // Find the competence
      const competence = competences.find(c => c._id === competenceId);
      if (!competence) return;

      // Update the sub-competence validation status
      const updatedSubCompetences = [...competence.subCompetences];
      updatedSubCompetences[subCompetenceIndex].validated = validated;

      // Calculate the new global status based on majority rule
      const validatedCount = updatedSubCompetences.filter(sc => sc.validated).length;
      const totalCount = updatedSubCompetences.length;
      const globalStatus = validatedCount > totalCount / 2 ? 'validated' : 'not validated';

      // Update the competence
      const updatedCompetence = {
        ...competence,
        subCompetences: updatedSubCompetences,
        globalStatus
      };

      await axios.put(`http://localhost:5000/competences/${competenceId}`, updatedCompetence);
      
      // Update state directly instead of fetching all data
      const updatedCompetences = competences.map(c => 
        c._id === competenceId ? updatedCompetence : c
      );
      setCompetences(updatedCompetences);
      
      // Also update filtered competences
      const updatedFilteredCompetences = filteredCompetences.map(c => 
        c._id === competenceId ? updatedCompetence : c
      );
      setFilteredCompetences(updatedFilteredCompetences);
      
    } catch (error) {
      console.error('Error updating sub-competence:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter competences based on search and status
  useEffect(() => {
    let filtered = competences;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subCompetences.some(sc => 
            sc.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.globalStatus === statusFilter);
    }

    setFilteredCompetences(filtered);
  }, [searchTerm, statusFilter, competences]);

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchData();
    }
  }, [refreshTrigger]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'not validated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-4 h-4" />;
      case 'not validated':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getValidationStats = () => {
    const total = competences.length;
    const validated = competences.filter(c => c.globalStatus === 'validated').length;
    const notValidated = competences.filter(c => c.globalStatus === 'not validated').length;
    
    return { total, validated, notValidated };
  };

  const getValidationProgress = (subCompetences) => {
    const validatedCount = subCompetences.filter(sc => sc.validated).length;
    const totalCount = subCompetences.length;
    const percentage = totalCount > 0 ? (validatedCount / totalCount) * 100 : 0;
    
    return {
      validatedCount,
      totalCount,
      percentage: Math.round(percentage),
      isMajority: validatedCount > totalCount / 2
    };
  };

  const stats = getValidationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading competences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with more top margin */}
      <div className="mb-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competence Management</h1>
        <p className="text-gray-600">Track and manage your competences and their validation status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Competences</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validated</p>
              <p className="text-3xl font-bold text-green-600">{stats.validated}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not Validated</p>
              <p className="text-3xl font-bold text-red-600">{stats.notValidated}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search competences, codes, or sub-competences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="validated">Validated</option>
              <option value="not validated">Not Validated</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredCompetences.length} of {competences.length} competences
        </p>
      </div>

      {/* Competence Grid */}
      {filteredCompetences.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No competences found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first competence'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCompetences.map((c) => {
            const progress = getValidationProgress(c.subCompetences);
            
            return (
              <div
                key={c._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Code className="w-4 h-4" />
                        {c.code}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(c.globalStatus)}`}>
                      {getStatusIcon(c.globalStatus)}
                      {c.globalStatus}
                    </div>
                  </div>

                  {/* Validation Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Validation Progress</span>
                      <span className="text-sm text-gray-600">
                        {progress.validatedCount}/{progress.totalCount} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress.isMajority ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {progress.isMajority ? 'Majority validated' : 'Majority not validated'}
                    </p>
                  </div>
                </div>

                {/* Sub-competences */}
                <div className="px-6 pb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sub-Competences</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {c.subCompetences.map((sc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 flex-1 mr-2">
                          {sc.name}
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sc.validated}
                            onChange={(e) => updateSubCompetenceValidation(c._id, i, e.target.checked)}
                            disabled={updatingId === c._id}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className={`text-xs font-medium ${
                            sc.validated ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {sc.validated ? 'Valid' : 'Invalid'}
                          </span>
                          {sc.validated ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteCompetence(c._id)}
                      disabled={deletingId === c._id || updatingId === c._id}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        deletingId === c._id || updatingId === c._id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {deletingId === c._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                    
                    {updatingId === c._id && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        <Save className="w-4 h-4" />
                        <span className="text-sm">Updating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Display;