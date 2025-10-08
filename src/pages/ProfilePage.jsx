import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingButton, ErrorMessage, LoadingSpinner } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { success, error: showError } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    preferences: {
      notifications: true,
      newsletter: false,
      marketingEmails: false
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
          country: user.address?.country || 'India'
        },
        preferences: {
          notifications: user.preferences?.notifications ?? true,
          newsletter: user.preferences?.newsletter ?? false,
          marketingEmails: user.preferences?.marketingEmails ?? false
        }
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!profileData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!profileData.email.trim()) {
        throw new Error('Email is required');
      }

      await updateProfile(profileData);
      setIsEditing(false);
      success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      showError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset to original user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
          country: user.address?.country || 'India'
        },
        preferences: {
          notifications: user.preferences?.notifications ?? true,
          newsletter: user.preferences?.newsletter ?? false,
          marketingEmails: user.preferences?.marketingEmails ?? false
        }
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar user={user} onLogout={logout} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information and preferences</p>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <LoadingButton
                      loading={loading}
                      onClick={handleSave}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Save Changes
                    </LoadingButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6">
                <ErrorMessage error={error} />
              </div>
            )}

            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                        isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                      }`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                        isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                      }`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                        isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                        isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <textarea
                      value={profileData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      disabled={!isEditing}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                        isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                      }`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                          isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={profileData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                          isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={profileData.address.pincode}
                        onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                          isEditing ? 'focus:ring-2 focus:ring-black focus:border-black' : 'bg-gray-50'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={profileData.preferences.notifications}
                      onChange={(e) => handleInputChange('preferences.notifications', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="notifications" className="ml-3 text-sm text-gray-700">
                      Enable notifications for order updates
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={profileData.preferences.newsletter}
                      onChange={(e) => handleInputChange('preferences.newsletter', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
                      Subscribe to newsletter for product updates
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="marketingEmails"
                      checked={profileData.preferences.marketingEmails}
                      onChange={(e) => handleInputChange('preferences.marketingEmails', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="marketingEmails" className="ml-3 text-sm text-gray-700">
                      Receive promotional emails and special offers
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => {/* TODO: Implement password change */}}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={() => {/* TODO: Implement account deletion */}}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}