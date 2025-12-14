import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Search, Star, ChevronDown, DollarSign } from 'lucide-react';
import ChatWidget from '../components/copilot/ChatWidget';
import Header from '../components/Header';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [topTutors, setTopTutors] = useState([]);
  const [allTutors, setAllTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [showSubjectFilter, setShowSubjectFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'student') {
        router.push('/student/home');
      } else if (user.role === 'tutor') {
        router.push('/tutor/home');
      }
    }

    // Fetch top rated tutors
    fetchTopTutors();
  }, [router]);

  const fetchTopTutors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tutors');
      const tutors = response.data.tutors || [];
      setAllTutors(tutors); // Store all tutors
      setTopTutors(tutors.slice(0, 4)); // Get top 4 tutors for display
      setFilteredTutors(tutors); // Show all tutors initially
      
      // Extract unique subjects
      const subjects = new Set();
      tutors.forEach(tutor => {
        tutor.subjects?.forEach(subject => subjects.add(subject));
      });
      setAllSubjects(Array.from(subjects).sort());
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  // Filter tutors based on search and filters
  useEffect(() => {
    if (!allTutors.length) return;

    let filtered = [...allTutors];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply subject filter
    if (selectedSubject) {
      filtered = filtered.filter(tutor =>
        tutor.subjects?.includes(selectedSubject)
      );
    }

    // Apply price filter
    filtered = filtered.filter(tutor => (tutor.hourlyRate || 0) <= priceRange);

    // Apply rating filter
    filtered = filtered.filter(tutor => (tutor.averageRating || 0) >= minRating);

    setFilteredTutors(filtered);
  }, [searchTerm, selectedSubject, priceRange, minRating, allTutors]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('.filter-dropdown')) {
        setShowSubjectFilter(false);
        setShowPriceFilter(false);
        setShowRatingFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration placeholder */}
          <div className="flex justify-center">
            <div className="w-full max-w-md aspect-square bg-gradient-to-br from-[#2A2A32] to-[#1A1A1F] rounded-2xl flex items-center justify-center border border-gray-800">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-400">Students studying together</p>
                <p className="text-sm text-gray-500 mt-2">Illustration placeholder</p>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Connect with expert tutors
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Find the perfect tutor for any subject, any time. Get personalized learning and achieve your academic goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/search')}
                className="px-8 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition text-lg"
              >
                Find a tutor
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-8 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition text-lg"
              >
                Become a tutor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for subjects or tutors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#2A2A32] text-white rounded-xl border border-gray-700 focus:border-[#3B82F6] focus:outline-none text-lg"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Subject Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowSubjectFilter(!showSubjectFilter)}
                className="px-6 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition flex items-center space-x-2"
              >
                <span>{selectedSubject || 'Subject'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSubjectFilter && (
                <div className="absolute top-full mt-2 w-64 bg-[#2A2A32] border border-gray-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedSubject('');
                      setShowSubjectFilter(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-[#3A3A42] transition"
                  >
                    All Subjects
                  </button>
                  {allSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setShowSubjectFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-[#3A3A42] transition"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowPriceFilter(!showPriceFilter)}
                className="px-6 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition flex items-center space-x-2"
              >
                <span>Price: ${priceRange}/hr</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showPriceFilter && (
                <div className="absolute top-full mt-2 w-64 bg-[#2A2A32] border border-gray-700 rounded-lg shadow-xl z-10 p-4">
                  <label className="block text-white text-sm mb-2">Max Price: ${priceRange}/hr</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#3B82F6]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>$10</span>
                    <span>$200</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowRatingFilter(!showRatingFilter)}
                className="px-6 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition flex items-center space-x-2"
              >
                <span>Rating: {minRating}+ ⭐</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showRatingFilter && (
                <div className="absolute top-full mt-2 w-64 bg-[#2A2A32] border border-gray-700 rounded-lg shadow-xl z-10 p-4">
                  <label className="block text-white text-sm mb-2">Minimum Rating: {minRating}+</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full accent-[#3B82F6]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtered Results Count */}
          <p className="text-gray-400 text-sm">
            {filteredTutors.length === 0 ? 'No tutors found' : `Showing ${filteredTutors.length} tutor${filteredTutors.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </section>

      {/* Tutors Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          {searchTerm || selectedSubject || priceRange < 100 || minRating > 0 ? 'Search Results' : 'Our Tutors'}
        </h3>
        {filteredTutors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tutors found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('');
                setPriceRange(100);
                setMinRating(0);
              }}
              className="mt-4 px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {filteredTutors.slice(0, 8).map((tutor, index) => (
              <div
                key={tutor._id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => router.push(`/tutor/profile/${tutor._id}`)}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#E8D4BB] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="text-5xl">
                    {index % 4 === 0 ? '👩' : index % 4 === 1 ? '👨' : index % 4 === 2 ? '👩' : '👨'}
                  </span>
                </div>
                <h4 className="text-white font-semibold text-center mb-1">{tutor.name}</h4>
                <p className="text-gray-400 text-sm text-center">
                  {tutor.subjects?.slice(0, 2).join(', ') || 'Tutor'}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white ml-1 text-sm">
                    {tutor.averageRating ? tutor.averageRating.toFixed(1) : 'New'}
                  </span>
                </div>
                <p className="text-[#3B82F6] font-semibold mt-1 text-sm">
                  ${tutor.hourlyRate}/hr
                </p>
              </div>
            ))}
          </div>
        )}
        {filteredTutors.length > 8 && (
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/auth/register')}
              className="px-8 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition"
            >
              View All {filteredTutors.length} Tutors
            </button>
          </div>
        )}
      </section>

      {/* Why Choose TutorConnect */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Why Choose TutorConnect?</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-[#1A1A1F] p-8 rounded-xl border border-gray-800">
            <div className="text-4xl mb-4">🎓</div>
            <h4 className="text-xl font-semibold text-white mb-3">Expert Tutors</h4>
            <p className="text-gray-400">
              All tutors are verified professionals with proven expertise in their subjects.
            </p>
          </div>
          <div className="bg-[#1A1A1F] p-8 rounded-xl border border-gray-800">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="text-xl font-semibold text-white mb-3">Affordable Pricing</h4>
            <p className="text-gray-400">
              Choose from a range of tutors at different price points to fit your budget.
            </p>
          </div>
          <div className="bg-[#1A1A1F] p-8 rounded-xl border border-gray-800">
            <div className="text-4xl mb-4">⏰</div>
            <h4 className="text-xl font-semibold text-white mb-3">Flexible Schedule</h4>
            <p className="text-gray-400">
              Book sessions that work with your schedule, 24/7 availability.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1F] border-t border-gray-800 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 TutorConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
















