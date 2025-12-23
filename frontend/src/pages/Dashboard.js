import React, { useState, useEffect } from 'react';
import { getMyRewards } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await getMyRewards();
      setRewards(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!rewards) return <div className="error">No data available</div>;

  return (
    <div className="dashboard-page">
      <h1>My Dashboard</h1>

      <div className="dashboard-grid">
        {/* Level Card */}
        <div className="dashboard-card level-card">
          <h2>Your Level</h2>
          <div className="level-display">
            <div className="level-number">{rewards.level.current}</div>
            <div className="level-name">{rewards.level.name}</div>
          </div>
          <div className="level-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(rewards.points / (rewards.points + rewards.level.pointsToNextLevel)) * 100}%` }}
              />
            </div>
            <p>{rewards.points} / {rewards.points + rewards.level.pointsToNextLevel} points to next level</p>
          </div>
        </div>

        {/* Points Card */}
        <div className="dashboard-card points-card">
          <h2>Total Points</h2>
          <div className="points-display">{rewards.points}</div>
          <p>Keep playing to earn more!</p>
        </div>

        {/* Achievements Card */}
        <div className="dashboard-card achievements-card">
          <h2>Achievements</h2>
          <div className="achievement-stats">
            <div className="stat-item">
              <span className="stat-value">{rewards.achievements.totalBookings || 0}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{rewards.achievements.totalHoursPlayed || 0}</span>
              <span className="stat-label">Hours Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{rewards.achievements.uniqueSportsPlayed || 0}</span>
              <span className="stat-label">Sports Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{rewards.achievements.tournamentsParticipated || 0}</span>
              <span className="stat-label">Tournaments</span>
            </div>
          </div>
        </div>

        {/* Badges Card */}
        <div className="dashboard-card badges-card">
          <h2>Badges Earned ({rewards.badges?.length || 0})</h2>
          {rewards.badges && rewards.badges.length > 0 ? (
            <div className="badges-grid">
              {rewards.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <div className="badge-icon">🏆</div>
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                    <span className="badge-date">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No badges yet. Keep playing to earn badges!</p>
          )}
        </div>

        {/* Streak Card */}
        <div className="dashboard-card streak-card">
          <h2>Current Streak</h2>
          <div className="streak-display">
            <span className="streak-number">{rewards.streaks?.current || 0}</span>
            <span className="streak-text">days</span>
          </div>
          <p>Longest streak: {rewards.streaks?.longest || 0} days</p>
        </div>

        {/* Milestones Card */}
        <div className="dashboard-card milestones-card">
          <h2>Milestones</h2>
          {rewards.milestones && rewards.milestones.length > 0 ? (
            <div className="milestones-list">
              {rewards.milestones.map((milestone, index) => (
                <div key={index} className={`milestone-item ${milestone.completed ? 'completed' : ''}`}>
                  <div className="milestone-header">
                    <h4>{milestone.title}</h4>
                    {milestone.completed && <span className="completed-badge">✓</span>}
                  </div>
                  <p>{milestone.description}</p>
                  <div className="milestone-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(milestone.currentProgress / milestone.requirement) * 100}%` }}
                      />
                    </div>
                    <span>{milestone.currentProgress} / {milestone.requirement}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No active milestones</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;