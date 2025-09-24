import React, { useState, useEffect, useMemo } from 'react';
import { Event } from '../types';

interface SearchFilterProps {
  events: Event[];
  onFilteredEvents: (filteredEvents: Event[]) => void;
  className?: string;
}

interface FilterState {
  search: string;
  category: string;
  dateRange: string;
  priceRange: string;
  location: string;
  sortBy: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  events,
  onFilteredEvents,
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    dateRange: '',
    priceRange: '',
    location: '',
    sortBy: 'date'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(events.map(event => event.event_type))];
    const locations = [...new Set(events.map(event => event.venue))];
    
    return {
      categories: categories.filter(Boolean),
      locations: locations.filter(Boolean)
    };
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.venue.toLowerCase().includes(searchLower) ||
        (event.organizer_name && event.organizer_name.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(event => event.event_type === filters.category);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event => event.venue === filters.location);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_start_datetime);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        
        switch (filters.dateRange) {
          case 'today':
            return eventDateOnly.getTime() === today.getTime();
          case 'tomorrow':
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return eventDateOnly.getTime() === tomorrow.getTime();
          case 'this-week':
            const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDateOnly >= today && eventDateOnly <= weekEnd;
          case 'this-month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return eventDateOnly >= monthStart && eventDateOnly <= monthEnd;
          case 'upcoming':
            return eventDateOnly >= today;
          default:
            return true;
        }
      });
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(a.event_start_datetime).getTime() - new Date(b.event_start_datetime).getTime();
        case 'name':
          return a.event_name.localeCompare(b.event_name);
        case 'popularity':
          return (b.current_attendees || 0) - (a.current_attendees || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, filters]);

  // Update parent component when filtered events change
  useEffect(() => {
    onFilteredEvents(filteredEvents);
  }, [filteredEvents, onFilteredEvents]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      dateRange: '',
      priceRange: '',
      location: '',
      sortBy: 'date'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'date');

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search events, venues, organizers..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('dateRange', filters.dateRange === 'today' ? '' : 'today')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.dateRange === 'today'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-text-secondary border-border hover:border-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleFilterChange('dateRange', filters.dateRange === 'this-week' ? '' : 'this-week')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.dateRange === 'this-week'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-text-secondary border-border hover:border-primary'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => handleFilterChange('dateRange', filters.dateRange === 'upcoming' ? '' : 'upcoming')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.dateRange === 'upcoming'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-text-secondary border-border hover:border-primary'
          }`}
        >
          Upcoming
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <span>Advanced Filters</span>
          <svg 
            className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Locations</option>
              {filterOptions.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Any Time</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-text-secondary">
          Showing {filteredEvents.length} of {events.length} events
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Filtered
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default SearchFilter;
