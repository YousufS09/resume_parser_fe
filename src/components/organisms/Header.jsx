import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Searching opens the Parsed Results page filtered by the term (name, email, skill, or filename)
  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/results?q=${encodeURIComponent(term)}` : '/results');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="icon-button header-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="header-brand-copy">
          <span className="header-eyebrow">Resume intelligence workspace</span>
          <span className="header-title">Operational console</span>
        </div>
      </div>

      <form className="header-search" role="search" onSubmit={handleSearch}>
        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search candidates or skills..."
          className="search-input"
          aria-label="Search candidates"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
    </header>
  );
};

export default Header;
