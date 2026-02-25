import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import PremiumCard from '../ui/PremiumCard';
import PremiumButton from '../ui/PremiumButton';
import axiosInstance from '../axiosInstance';

const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState({
    username: '',
    email: '',
    dateJoined: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ email: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/user/profile/');
      setUser({
        username: response.data.username || 'User',
        email: response.data.email || 'user@neurostock.com',
        dateJoined: response.data.date_joined || new Date().toISOString(),
      });
      setEditData({ email: response.data.email || '' });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Usar datos de ejemplo si el endpoint no existe aún
      setUser({
        username: 'Usuario',
        email: 'user@neurostock.com',
        dateJoined: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      await axiosInstance.patch('/user/profile/', { email: editData.email });
      setUser({ ...user, email: editData.email });
      setEditing(false);
      setSuccess(t('profile.updateSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(t('profile.updateError'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#B8BFCC',
  };

  const avatarContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2E5A8F 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid rgba(46, 90, 143, 0.5)',
    boxShadow: '0 0 30px rgba(46, 90, 143, 0.3)',
  };

  const infoGridStyle = {
    display: 'grid',
    gap: '1.5rem',
  };

  const infoItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '0.75rem',
    background: 'rgba(46, 90, 143, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const infoContentStyle = {
    flex: 1,
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: '#8A92A5',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  };

  const valueStyle = {
    fontSize: '1.125rem',
    color: '#FFFFFF',
    fontWeight: '500',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'rgba(26, 29, 35, 0.8)',
    border: '1px solid rgba(46, 90, 143, 0.3)',
    borderRadius: '0.5rem',
    color: '#FFFFFF',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#B8BFCC' }}>
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t('profile.title')}</h1>
        <p style={subtitleStyle}>{t('profile.subtitle')}</p>
      </div>

      <PremiumCard borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
        <div style={avatarContainerStyle}>
          <div style={avatarStyle}>
            <User style={{ width: '3rem', height: '3rem', color: '#FFFFFF' }} />
          </div>
        </div>

        {success && (
          <div style={{
            background: 'rgba(39, 174, 96, 0.1)',
            border: '1px solid #27AE60',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            color: '#27AE60',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid #E74C3C',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            color: '#E74C3C',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <div style={infoGridStyle}>
          {/* Username */}
          <div style={infoItemStyle}>
            <div style={iconContainerStyle}>
              <User style={{ width: '1.5rem', height: '1.5rem', color: '#4A7AB7' }} />
            </div>
            <div style={infoContentStyle}>
              <div style={labelStyle}>{t('profile.username')}</div>
              <div style={valueStyle}>{user.username}</div>
            </div>
          </div>

          {/* Email */}
          <div style={infoItemStyle}>
            <div style={iconContainerStyle}>
              <Mail style={{ width: '1.5rem', height: '1.5rem', color: '#4A7AB7' }} />
            </div>
            <div style={infoContentStyle}>
              <div style={labelStyle}>{t('profile.email')}</div>
              {editing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{user.email}</div>
              )}
            </div>
          </div>

          {/* Date Joined */}
          <div style={infoItemStyle}>
            <div style={iconContainerStyle}>
              <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#4A7AB7' }} />
            </div>
            <div style={infoContentStyle}>
              <div style={labelStyle}>{t('profile.memberSince')}</div>
              <div style={valueStyle}>{formatDate(user.dateJoined)}</div>
            </div>
          </div>

          {/* Account Status */}
          <div style={infoItemStyle}>
            <div style={iconContainerStyle}>
              <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#27AE60' }} />
            </div>
            <div style={infoContentStyle}>
              <div style={labelStyle}>{t('profile.accountStatus')}</div>
              <div style={{ ...valueStyle, color: '#27AE60' }}>{t('profile.active')}</div>
            </div>
          </div>
        </div>

        <div style={actionsStyle}>
          {editing ? (
            <>
              <PremiumButton variant="primary" onClick={handleSave}>
                <Save style={{ width: '1rem', height: '1rem' }} />
                {t('common.save')}
              </PremiumButton>
              <PremiumButton variant="secondary" onClick={() => setEditing(false)}>
                <X style={{ width: '1rem', height: '1rem' }} />
                {t('common.cancel')}
              </PremiumButton>
            </>
          ) : (
            <PremiumButton variant="secondary" onClick={() => setEditing(true)}>
              <Edit2 style={{ width: '1rem', height: '1rem' }} />
              {t('profile.editProfile')}
            </PremiumButton>
          )}
        </div>
      </PremiumCard>
    </div>
  );
};

export default Profile;
