import React, { useState, useEffect } from 'react';
import axios from 'axios';

const platforms = ['facebook', 'twitter', 'linkedin', 'instagram'];

const FooterManager = () => {
  const [footer, setFooter] = useState({
    title: '',
    description: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
    companyLinks: [],
  });

  const [navbarParents, setNavbarParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [navRes, footerRes] = await Promise.all([
          axios.get('/api/navbar'),
          axios.get('/api/footer'),
        ]);

        setNavbarParents(navRes.data);

        if (footerRes.data) {
          setFooter({
            title: footerRes.data.title || '',
            description: footerRes.data.description || '',
            socialLinks: {
              facebook: footerRes.data.socialLinks?.facebook || '',
              twitter: footerRes.data.socialLinks?.twitter || '',
              linkedin: footerRes.data.socialLinks?.linkedin || '',
              instagram: footerRes.data.socialLinks?.instagram || '',
            },
            companyLinks: Array.isArray(footerRes.data.companyLinks)
              ? footerRes.data.companyLinks
              : [],
          });
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setFooter(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, url) => {
    setFooter(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: url,
      },
    }));
  };

  const toggleCompanyLink = (link) => {
    let updatedLinks = [...footer.companyLinks];
    const exists = updatedLinks.find(l => l._id === link._id);

    if (exists) {
      updatedLinks = updatedLinks.filter(l => l._id !== link._id);
    } else {
      if (updatedLinks.length >= 4) {
        alert('Max 4 company links allowed');
        return;
      }
      updatedLinks.push({ title: link.title, url: link.url, _id: link._id });
    }
    setFooter(prev => ({ ...prev, companyLinks: updatedLinks }));
  };

  const isSelected = (link) => footer.companyLinks.some(l => l._id === link._id);

  const saveFooter = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.post('/api/footer', footer);
      alert('Footer saved successfully');
    } catch {
      setError('Failed to save footer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Footer Manager</h2>

      <label>
        Title:<br />
        <input
          type="text"
          value={footer.title}
          onChange={e => handleChange('title', e.target.value)}
          style={{ width: '100%' }}
        />
      </label>

      <br /><br />

      <label>
        Description:<br />
        <textarea
          rows={3}
          value={footer.description}
          onChange={e => handleChange('description', e.target.value)}
          style={{ width: '100%' }}
        />
      </label>

      <br /><br />

      <h4>Social Links</h4>
      {platforms.map(platform => (
        <div key={platform} style={{ marginBottom: 8 }}>
          <label style={{ textTransform: 'capitalize' }}>
            {platform} URL:
            <input
              type="text"
              placeholder={`Enter ${platform} URL`}
              value={footer.socialLinks[platform]}
              onChange={e => handleSocialChange(platform, e.target.value)}
              style={{ width: '100%', marginTop: 4 }}
            />
          </label>
        </div>
      ))}

      <br />

      <h4>Company Links (Choose up to 4)</h4>
      <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {navbarParents.map(link => (
          <div key={link._id} style={{ marginBottom: 4 }}>
            <label>
              <input
                type="checkbox"
                checked={isSelected(link)}
                onChange={() => toggleCompanyLink(link)}
              />{' '}
              {link.title}
            </label>
          </div>
        ))}
      </div>

      <br />

      <button onClick={saveFooter} disabled={saving}>
        {saving ? 'Saving...' : 'Save Footer'}
      </button>

      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
};

export default FooterManager;
