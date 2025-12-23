import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTournaments } from '../services/api';
import './Tournaments.css';

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ sport: '', status: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.sport) params.sport = filter.sport;
      if (filter.status) params.status = filter.status;
      
      const response = await getAllTournaments(params);
      setTournaments(response.data.data);
    } catch (err) {
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#757575',
      open: '#4caf50',
      registration_closed: '#ff9800',
      ongoing: '#2196f3',
      completed: '#9e9e9e',
      cancelled: '#f44336'
    };
    return colors[status] || '#757575';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const daysUntil = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return <div className="loading">Loading tournaments...</div>;

  return (
    <div className="tournaments-page">
      <div className="tournaments-header">
        <h1>Tournaments</h1>
        <button 
          className="btn-create-tournament"
          onClick={() => navigate('/tournaments/create')}
        >
          Create Tournament
        </button>
      </div>

      {/* Filters */}
      <div className="tournaments-filters">
        <select 
          value={filter.sport} 
          onChange={(e) => setFilter({ ...filter, sport: e.target.value })}
          className="filter-select"
        >
          <option value="">All Sports</option>
          <option value="Football">Football</option>
          <option value="Cricket">Cricket</option>
          <option value="Badminton">Badminton</option>
          <option value="Tennis">Tennis</option>
          <option value="Basketball">Basketball</option>
        </select>

        <select 
          value={filter.status} 
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="open">Open for Registration</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>

        <button 
          onClick={() => setFilter({ sport: '', status: '' })}
          className="btn-clear-filters"
        >
          Clear Filters
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tournaments Grid */}
      {tournaments.length === 0 ? (
        <div className="no-tournaments">
          <p>No tournaments found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="tournaments-grid">
          {tournaments.map((tournament) => (
            <div 
              key={tournament._id} 
              className="tournament-card"
              onClick={() => navigate(`/tournaments/${tournament._id}`)}
            >
              {/* Tournament Header */}
              <div className="tournament-card-header">
                <span 
                  className="tournament-status"
                  style={{ backgroundColor: getStatusColor(tournament.status) }}
                >
                  {tournament.status.replace('_', ' ')}
                </span>
                <span className="tournament-sport">{tournament.sport}</span>
              </div>

              {/* Tournament Content */}
              <div className="tournament-card-content">
                <h3>{tournament.name}</h3>
                <p className="tournament-description">{tournament.description}</p>

                <div className="tournament-info">
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span>{tournament.turf?.name || 'TBD'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span>{formatDate(tournament.startDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">👥</span>
                    <span>{tournament.participants?.length || 0} / {tournament.maxTeams} teams</span>
                  </div>
                  {tournament.entryFee > 0 && (
                    <div className="info-item">
                      <span className="info-icon">💰</span>
                      <span>Entry: ₹{tournament.entryFee}</span>
                    </div>
                  )}
                </div>

                {/* Prize Pool */}
                {tournament.prizePool && (
                  <div className="prize-pool">
                    <h4>Prize Pool</h4>
                    <div className="prizes">
                      <span className="prize">🥇 ₹{tournament.prizePool.first}</span>
                      <span className="prize">🥈 ₹{tournament.prizePool.second}</span>
                      {tournament.prizePool.third && (
                        <span className="prize">🥉 ₹{tournament.prizePool.third}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Registration Deadline */}
                {tournament.status === 'open' && (
                  <div className="registration-deadline">
                    <span className="deadline-label">Registration closes in:</span>
                    <span className="deadline-days">
                      {daysUntil(tournament.registrationDeadline)} days
                    </span>
                  </div>
                )}
              </div>

              {/* Tournament Footer */}
              <div className="tournament-card-footer">
                {tournament.status === 'open' ? (
                  <button className="btn-join">Join Tournament</button>
                ) : tournament.status === 'ongoing' ? (
                  <button className="btn-view" disabled>In Progress</button>
                ) : (
                  <button className="btn-view">View Details</button>
                )}
              </div>
            </div>
            
          ))}
        </div>
      )}
    </div>
  );
}

export default Tournaments;