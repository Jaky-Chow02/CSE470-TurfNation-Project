import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTournament, getAllTurfs } from '../services/api';
import './CreateTournament.css';

function CreateTournament() {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    turf: '',
    sport: '',
    description: '',
    type: 'knockout',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeams: 8,
    minPlayersPerTeam: 5,
    maxPlayersPerTeam: 11,
    entryFee: 0,
    prizeFirst: 0,
    prizeSecond: 0,
    prizeThird: 0,
    rules: '',
    visibility: 'public'
  });

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      const response = await getAllTurfs();
      setTurfs(response.data.data);
    } catch (err) {
      console.error('Failed to load turfs');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert rules from string to array
      const rulesArray = formData.rules
        .split('\n')
        .filter(rule => rule.trim() !== '');

      const tournamentData = {
        name: formData.name,
        turf: formData.turf,
        sport: formData.sport,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline,
        maxTeams: parseInt(formData.maxTeams),
        minPlayersPerTeam: parseInt(formData.minPlayersPerTeam),
        maxPlayersPerTeam: parseInt(formData.maxPlayersPerTeam),
        entryFee: parseInt(formData.entryFee),
        prizePool: {
          first: parseInt(formData.prizeFirst),
          second: parseInt(formData.prizeSecond),
          third: parseInt(formData.prizeThird) || undefined
        },
        rules: rulesArray,
        visibility: formData.visibility
      };

      const response = await createTournament(tournamentData);
      alert('Tournament created successfully!');
      navigate(`/tournaments/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tournament-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/tournaments')}>
          ← Back to Tournaments
        </button>
        <h1>Create Tournament</h1>
        <p>Organize a tournament and bring players together!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="tournament-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Tournament Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Summer Football Championship 2024"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sport *</label>
              <select name="sport" value={formData.sport} onChange={handleChange} required>
                <option value="">Select Sport</option>
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
                <option value="Badminton">Badminton</option>
                <option value="Tennis">Tennis</option>
                <option value="Basketball">Basketball</option>
                <option value="Hockey">Hockey</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tournament Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="knockout">Knockout</option>
                <option value="league">League</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <select name="turf" value={formData.turf} onChange={handleChange} required>
              <option value="">Select Venue</option>
              {turfs.map((turf) => (
                <option key={turf._id} value={turf._id}>
                  {turf.name} - {turf.location.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe your tournament, format, and what makes it special..."
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="form-section">
          <h2>Schedule</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Registration Deadline *</label>
            <input
              type="date"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              max={formData.startDate}
              required
            />
          </div>
        </div>

        {/* Team Settings */}
        <div className="form-section">
          <h2>Team Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Maximum Teams *</label>
              <input
                type="number"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleChange}
                min="2"
                max="32"
                required
              />
            </div>

            <div className="form-group">
              <label>Min Players per Team *</label>
              <input
                type="number"
                name="minPlayersPerTeam"
                value={formData.minPlayersPerTeam}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Max Players per Team *</label>
              <input
                type="number"
                name="maxPlayersPerTeam"
                value={formData.maxPlayersPerTeam}
                onChange={handleChange}
                min={formData.minPlayersPerTeam}
                required
              />
            </div>
          </div>
        </div>

        {/* Prize & Entry */}
        <div className="form-section">
          <h2>Prize Pool & Entry Fee</h2>
          
          <div className="form-group">
            <label>Entry Fee (₹)</label>
            <input
              type="number"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleChange}
              min="0"
              placeholder="0 for free tournament"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>1st Prize (₹)</label>
              <input
                type="number"
                name="prizeFirst"
                value={formData.prizeFirst}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>2nd Prize (₹)</label>
              <input
                type="number"
                name="prizeSecond"
                value={formData.prizeSecond}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>3rd Prize (₹)</label>
              <input
                type="number"
                name="prizeThird"
                value={formData.prizeThird}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="form-section">
          <h2>Rules & Regulations</h2>
          
          <div className="form-group">
            <label>Tournament Rules</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="6"
              placeholder="Enter one rule per line. Example:&#10;Standard FIFA rules apply&#10;All players must have valid ID&#10;Fair play code enforced"
            />
            <small>Enter one rule per line</small>
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleChange}>
              <option value="public">Public - Anyone can see and join</option>
              <option value="private">Private - Invitation only</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/tournaments')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTournament;