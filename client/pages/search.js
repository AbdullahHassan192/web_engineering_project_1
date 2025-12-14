import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search as SearchIcon, Star, ChevronDown, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';
import ChatWidget from '../components/copilot/ChatWidget';
import Header from '../components/Header';

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);

  const subjects = [
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'CNN Architecture',
    'Unreal Engine 5',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Programming'
  ];

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTutors();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedSubject, priceRange, minRating]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedSubject) params.subject = selectedSubject;
      if (priceRange[0] > 0) params.minRate = priceRange[0];
      if (priceRange[1] < 100) params.maxRate = priceRange[1];
      if (minRating > 0) params.minRating = minRating;

      const response = await axios.get('http://localhost:5000/api/search/tutors', { params });
      setTutors(response.data.tutors || []);
    } catch (error) {
      console.error('Error searching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setPriceRange([0, 100]);
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="md:col-span-1">
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Filter Tutors</h2>
              
              {/* Subject Filter */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Subject</label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A32] text-white rounded-lg border border-gray-700 focus:border-[#3B82F6] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Price Range</label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-[#3B82F6]"
                  />
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}/hr</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Rating</label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full accent-[#3B82F6]"
                  />
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>0</span>
                    <span>{minRating.toFixed(1)} stars</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={fetchTutors}
                  className="w-full px-4 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* Right Content - Search and Results */}
          <main className="md:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for tutors"
                  className="w-full pl-12 pr-4 py-4 bg-[#2A2A32] text-white rounded-xl border border-gray-700 focus:border-[#3B82F6] focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Results Header */}
            <h2 className="text-2xl font-bold text-white mb-6">Available Tutors</h2>

            {/* Tutor Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading tutors...</div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-xl mb-2">No tutors found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                tutors.map((tutor, index) => (
                  <div
                    key={tutor._id}
                    className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 hover:border-[#3B82F6] transition cursor-pointer"
                    onClick={() => router.push(`/tutor/profile/${tutor._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Name */}
                        <h3 className="text-2xl font-bold text-white mb-2">{tutor.name}</h3>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          {(tutor.totalReviews || 0) > 0 ? (
                            <>
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                              <span className="text-white font-semibold ml-1 text-lg">
                                {(tutor.averageRating || 0).toFixed(1)}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">({tutor.totalReviews || 0} reviews)</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">⭐ New - No reviews yet</span>
                          )}
                        </div>

                        {/* Subjects */}
                        {tutor.subjects && tutor.subjects.length > 0 && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-sm font-medium">Subjects: </span>
                            <span className="text-gray-300 text-sm">
                              {tutor.subjects.slice(0, 3).join(', ')}
                              {tutor.subjects.length > 3 && ` +${tutor.subjects.length - 3} more`}
                            </span>
                          </div>
                        )}

                        {/* Experience and Price */}
                        <div className="flex items-center space-x-6 mb-4">
                          <div>
                            <span className="text-gray-400 text-sm font-medium">Experience: </span>
                            <span className="text-white text-sm font-semibold">5 years</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm font-medium">Rate: </span>
                            <span className="text-[#3B82F6] text-lg font-bold">${tutor.hourlyRate || 50}/hr</span>
                          </div>
                        </div>

                        {/* Bio/Description */}
                        {tutor.bio && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {tutor.bio}
                          </p>
                        )}

                        {/* View Profile Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tutor/profile/${tutor._id}`);
                          }}
                          className="px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition"
                        >
                          View Profile
                        </button>
                      </div>

                      {/* Tutor Avatar */}
                      <div className="ml-6 flex-shrink-0">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#E8D4BB] flex items-center justify-center border-2 border-gray-700">
                          <span className="text-6xl">
                            {index % 4 === 0 ? '👩' : index % 4 === 1 ? '👨' : index % 4 === 2 ? '👩' : '👨'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}














