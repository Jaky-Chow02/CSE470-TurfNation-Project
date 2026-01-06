// frontend/src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    sportType: '',
    date: '',
    startTime: '',
    endTime: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance',
    page: 1
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get popular searches on mount
  useEffect(() => {
    fetchPopularSearches();
  }, []);

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      query: params.get('q') || '',
      location: params.get('location') || '',
      sportType: params.get('sport') || '',
      date: params.get('date') || '',
      startTime: params.get('start') || '',
      endTime: params.get('end') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sortBy: params.get('sort') || 'relevance',
      page: parseInt(params.get('page')) || 1
    };

    setFilters(newFilters);
    if (newFilters.query || newFilters.location || newFilters.sportType) {
      performSearch(newFilters);
    }
  }, [location.search]);

  const fetchPopularSearches = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/search/popular`
      );
      if (response.data.success) {
        setPopularSearches(response.data.popular);
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const performSearch = async (searchFilters) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/search`,
        { params: searchFilters }
      );

      if (response.data.success) {
        setTurfs(response.data.turfs);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    const newFilters = { ...filters, query, page: 1 };
    updateURL(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    updateURL(filters);
  };

  const clearFilters = () => {
    const newFilters = {
      query: filters.query,
      location: '',
      sportType: '',
      date: '',
      startTime: '',
      endTime: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance',
      page: 1
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    updateURL(newFilters);
  };

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        const paramKey = key === 'query' ? 'q' : 
                        key === 'sportType' ? 'sport' :
                        key === 'sortBy' ? 'sort' : key;
        params.set(paramKey, value);
      }
    });
    navigate(`/search?${params.toString()}`);
  };

  const handleSelectTurf = (turf) => {
    navigate(`/turf/${turf.id}`);
  };

  const handlePopularClick = (type, value) => {
    const newFilters = { ...filters, page: 1 };
    if (type === 'sport') {
      newFilters.sportType = value;
    } else if (type === 'location') {
      newFilters.location = value;
    } else if (type === 'turf') {
      newFilters.query = value;
    }
    updateURL(newFilters);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Find Your Perfect Turf</h1>
        <SearchBar onSearch={handleSearch} onSelectTurf={handleSelectTurf} />
      </div>

      {/* Popular Searches */}
      {!filters.query && Object.keys(popularSearches).length > 0 && (
        <div className="popular-section">
          <h3>🔥 Popular Searches</h3>
          <div className="popular-items">
            {popularSearches.sports?.map((sport, idx) => (
              <button
                key={`sport-${idx}`}
                className="popular-chip"
                onClick={() => handlePopularClick('sport', sport)}
              >
                ⚽ {sport}
              </button>
            ))}
            {popularSearches.locations?.map((loc, idx) => (
              <button
                key={`loc-${idx}`}
                className="popular-chip"
                onClick={() => handlePopularClick('location', loc)}
              >
                📍 {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <button
          className="toggle-filters-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          🔧 Filters {showFilters ? '▲' : '▼'}
        </button>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g., Gulshan, Dhanmondi"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Sport Type</label>
                <select
                  value={filters.sportType}
                  onChange={(e) => handleFilterChange('sportType', e.target.value)}
                >
                  <option value="">All Sports</option>
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Volleyball">Volleyball</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Date</label>
                <input
                  type="date"
                  value={filters.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={filters.startTime}
                  onChange={(e) => handleFilterChange('startTime', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={filters.endTime}
                  onChange={(e) => handleFilterChange('endTime', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Min Price (৳/hour)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Max Price (৳/hour)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="clear-btn" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="results-section">
        {loading ? (
          <div className="loading">
            <div className="spinner-large">⏳</div>
            <p>Searching turfs...</p>
          </div>
        ) : turfs.length > 0 ? (
          <>
            <div className="results-header">
              <h2>{pagination.totalResults} Turfs Found</h2>
              <p>Page {pagination.currentPage} of {pagination.totalPages}</p>
            </div>

            <div className="turfs-grid">
              {turfs.map((turf) => (
                <div key={turf._id} className="turf-card">
                  <div className="turf-image">
                    <img
                      src={turf.images?.[0] || '/placeholder-turf.jpg'}
                      alt={turf.name}
                    />
                    {turf.isAvailable !== undefined && (
                      <span className={`availability-badge ${turf.isAvailable ? 'available' : 'booked'}`}>
                        {turf.isAvailable ? '✓ Available' : '✗ Booked'}
                      </span>
                    )}
                  </div>

                  <div className="turf-info">
                    <h3>{turf.name}</h3>
                    <p className="turf-location">📍 {turf.location?.address || 'Location not specified'}</p>
                    <p className="turf-sport">⚽ {turf.sportType}</p>
                    <div className="turf-footer">
                      <span className="turf-price">৳{turf.pricePerHour}/hour</span>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/turf/${turf._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  ← Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - pagination.currentPage) <= 2
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={pageNum === pagination.currentPage ? 'active' : ''}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.currentPage - 3 ||
                    pageNum === pagination.currentPage + 3
                  ) {
                    return <span key={pageNum}>...</span>;
                  }
                  return null;
                })}

                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : filters.query || filters.sportType || filters.location ? (
          <div className="no-results">
            <h2>No turfs found</h2>
            <p>Try adjusting your search filters</p>
            <button className="clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;