// frontend/src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SearchBar.css';

const SearchBar = ({ onSearch, onSelectTurf }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const fetchSuggestions = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/search/suggestions`,
        {
          params: { query: searchQuery, type: 'all' }
        }
      );

      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === 'turf') {
      setQuery(suggestion.name);
      onSelectTurf?.(suggestion);
    } else if (suggestion.type === 'location') {
      setQuery(suggestion.name);
      handleSearch(suggestion.name);
    } else if (suggestion.type === 'sport') {
      setQuery(suggestion.name);
      handleSearch(suggestion.name);
    }
    setShowSuggestions(false);
  };

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'turf':
        return '🏟️';
      case 'location':
        return '📍';
      case 'sport':
        return '⚽';
      default:
        return '🔍';
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search turfs, locations, or sports..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button
          className="search-button"
          onClick={() => handleSearch()}
          disabled={!query.trim()}
        >
          {loading ? (
            <span className="spinner">⏳</span>
          ) : (
            <span>🔍 Search</span>
          )}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${index}`}
              className={`suggestion-item ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="suggestion-icon">
                {getSuggestionIcon(suggestion.type)}
              </span>
              <div className="suggestion-content">
                <div className="suggestion-name">
                  {highlightMatch(suggestion.name, query)}
                </div>
                {suggestion.location && (
                  <div className="suggestion-meta">
                    📍 {suggestion.location}
                  </div>
                )}
                {suggestion.sportType && (
                  <div className="suggestion-meta">
                    ⚽ {suggestion.sportType}
                  </div>
                )}
                {suggestion.price && (
                  <div className="suggestion-meta">
                    💰 ৳{suggestion.price}/hour
                  </div>
                )}
              </div>
              <span className="suggestion-type">{suggestion.type}</span>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && !loading && suggestions.length === 0 && query.length >= 2 && (
        <div className="suggestions-dropdown">
          <div className="no-suggestions">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;