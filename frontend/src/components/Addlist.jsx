// frontend/src/components/AddList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

const AddList = ({ onAdd, onRefresh }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    subCompetences: [{ name: '', validated: false }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const validSubCompetences = formData.subCompetences.filter(sub => sub.name.trim());
    if (validSubCompetences.length === 0) {
      newErrors.subCompetences = 'At least one sub-competence is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'subName') {
      const updatedSubs = [...formData.subCompetences];
      updatedSubs[index].name = value;
      setFormData({ ...formData, subCompetences: updatedSubs });
    } else if (name === 'validated') {
      const updatedSubs = [...formData.subCompetences];
      updatedSubs[index].validated = checked;
      setFormData({ ...formData, subCompetences: updatedSubs });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const addSubCompetence = () => {
    setFormData({
      ...formData,
      subCompetences: [...formData.subCompetences, { name: '', validated: false }],
    });
  };

  const removeSubCompetence = (index) => {
    if (formData.subCompetences.length > 1) {
      const updatedSubs = formData.subCompetences.filter((_, i) => i !== index);
      setFormData({ ...formData, subCompetences: updatedSubs });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty sub-competences
      const cleanedData = {
        ...formData,
        subCompetences: formData.subCompetences.filter(sub => sub.name.trim())
      };
      
      const res = await axios.post('http://localhost:5000/competences', cleanedData);
      
      // Call both callbacks if they exist
      if (onAdd) {
        onAdd(res.data);
      }
      if (onRefresh) {
        onRefresh();
      }
      
      setFormData({ code: '', name: '', subCompetences: [{ name: '', validated: false }] });
      setErrors({});
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.error || 'Something went wrong' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Plus className="w-6 h-6" />
            Add New Competence
          </h2>
          <p className="text-blue-100 mt-2">Define a new competence with its sub-competences</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Competence Code *
              </label>
              <input
                name="code"
                placeholder="e.g., C1, TECH-001"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.code && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.code}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Competence Name *
              </label>
              <input
                name="name"
                placeholder="e.g., Web Development"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          {/* Sub-Competences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Sub-Competences *
              </label>
              <button
                type="button"
                onClick={addSubCompetence}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Sub-Competence
              </button>
            </div>

            {errors.subCompetences && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.subCompetences}
              </p>
            )}

            <div className="space-y-3">
              {formData.subCompetences.map((sub, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <input
                      name="subName"
                      placeholder="Sub-competence name"
                      value={sub.name}
                      onChange={(e) => handleChange(e, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="validated"
                      checked={sub.validated}
                      onChange={(e) => handleChange(e, index)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Validated</span>
                    {sub.validated && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </label>

                  {formData.subCompetences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubCompetence(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                'Save Competence'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddList;