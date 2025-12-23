import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, joinTournament } from '../services/api';
import './TournamentDetails.css';

function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinData, setJoinData] = useState({ teamName: '', players: [] });
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await getTournament(id);
      setTournament(response.data.data);
    } catch (err) {
      setError('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to join tournaments');
      navigate('/login');
      return;
    }

    try {
      await joinTournament(id, joinData);
      setShowJoinModal(false);
      fetchTournament();
      alert('Successfully joined tournament!');
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join tournament');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) return <div className="loading">Loading tournament...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tournament) return <div className="error">Tournament not found</div>;

  return (
    <div className="tournament-details-page">
      <button className="btn-back" onClick={() => navigate('/tournaments')}>
        ← Back to Tournaments
      </button>

      {/* Tournament Header */}
      <div className="tournament-header-section">
        <div className="tournament-title-section">
          <h1>{tournament.name}</h1>
          <div className="tournament-meta">
            <span className={`status-badge ${tournament.status}`}>
              {tournament.status.replace('_', ' ')}
            </span>
            <span className="sport-badge">{tournament.sport}</span>
            <span className="type-badge">{tournament.type}</span>
          </div>
        </div>


        {tournament.status === 'open' && localStorage.getItem('token') && (
          <button 
            className="btn-join-tournament"
            onClick={() => setShowJoinModal(true)}
          >
            Join Tournament
          </button>
        )}
      </div>

      <div className="tournament-details-grid">
        {/* Left Column */}
        <div className="tournament-main-info">
          {/* Description */}
          <div className="info-section">
            <h2>About</h2>
            <p>{tournament.description}</p>
          </div>

          {/* Details */}
          <div className="info-section">
            <h2>Tournament Details</h2>
            <div className="details-list">
              <div className="detail-item">
                <span className="detail-label">Venue:</span>
                <span className="detail-value">{tournament.turf?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  {tournament.turf?.location?.address}, {tournament.turf?.location?.city}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Start Date:</span>
                <span className="detail-value">{formatDate(tournament.startDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">End Date:</span>
                <span className="detail-value">{formatDate(tournament.endDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registration Deadline:</span>
                <span className="detail-value">{formatDate(tournament.registrationDeadline)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Max Teams:</span>
                <span className="detail-value">{tournament.maxTeams}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Players per Team:</span>
                <span className="detail-value">
                  {tournament.minPlayersPerTeam} - {tournament.maxPlayersPerTeam}
                </span>
              </div>
              {tournament.entryFee > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Entry Fee:</span>
                  <span className="detail-value">₹{tournament.entryFee}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rules */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div className="info-section">
              <h2>Rules & Regulations</h2>
              <ul className="rules-list">
                {tournament.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="tournament-side-info">
          {/* Prize Pool */}
          {tournament.prizePool && (
            <div className="info-section prize-section">
              <h2>Prize Pool</h2>
              <div className="prizes-list">
                <div className="prize-item first">
                  <span className="prize-medal">🥇</span>
                  <div className="prize-details">
                    <span className="prize-position">1st Place</span>
                    <span className="prize-amount">₹{tournament.prizePool.first}</span>
                  </div>
                </div>
                <div className="prize-item second">
                  <span className="prize-medal">🥈</span>
                  <div className="prize-details">
                    <span className="prize-position">2nd Place</span>
                    <span className="prize-amount">₹{tournament.prizePool.second}</span>
                  </div>
                </div>
                {tournament.prizePool.third && (
                  <div className="prize-item third">
                    <span className="prize-medal">🥉</span>
                    <div className="prize-details">
                      <span className="prize-position">3rd Place</span>
                      <span className="prize-amount">₹{tournament.prizePool.third}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="info-section participants-section">
            <h2>
              Participants ({tournament.participants?.length || 0}/{tournament.maxTeams})
            </h2>
            {tournament.participants && tournament.participants.length > 0 ? (
              <div className="participants-list">
                {tournament.participants.map((participant, index) => (
                  <div key={index} className="participant-item">
                    <span className="team-number">{index + 1}</span>
                    <div className="team-info">
                      <span className="team-name">{participant.team?.name}</span>
                      <span className="team-captain">
                        Captain: {participant.team?.captain?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-participants">No teams registered yet. Be the first!</p>
            )}
          </div>

          {/* Organizer */}
          <div className="info-section organizer-section">
            <h2>Organized By</h2>
            <div className="organizer-info">
              <span className="organizer-name">{tournament.creator?.name}</span>
              <span className="organizer-email">{tournament.creator?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join Tournament</h2>
            {joinError && <div className="error-message">{joinError}</div>}
            
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={joinData.teamName}
                  onChange={(e) => setJoinData({ ...joinData, teamName: e.target.value })}
                  required
                  placeholder="Enter your team name"
                />
              </div>

              <div className="form-info">
                <p>You'll be registered as the team captain.</p>
                <p>You can add players later from your dashboard.</p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Join Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentDetails;