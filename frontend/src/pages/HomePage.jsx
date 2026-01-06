// frontend/src/pages/HomePage.jsx
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="homepage">
      <h1>Book Your Sports Turf</h1>
      <SearchBar onSearch={handleSearch} />
      {/* Rest of homepage content */}
    </div>
  );
}