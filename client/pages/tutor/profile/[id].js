import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Calendar, Edit2 } from 'lucide-react';
import axios from 'axios';
import ChatWidget from '../../../components/copilot/ChatWidget';
import Header from '../../../components/Header';

export default function TutorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }

    if (id) {
      fetchTutorProfile();
      fetchReviews();
      if (token) {
        checkCanReview();
      }
    }
  }, [id]);

  const fetchTutorProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tutors/${id}`);
      setTutor(response.data.tutor || response.data);
    } catch (error) {
      console.error('Error fetching tutor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/tutor/${id}`);
      setReviews(response.data.reviews || []);
      setReviewStats(response.data.stats || { averageRating: 0, totalReviews: 0 });
      
      // Calculate distribution
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      response.data.stats?.distribution?.forEach(item => {
        dist[item._id] = item.count;
      });
      const total = Object.values(dist).reduce((a, b) => a + b, 0);
      const distPercent = {};
      Object.keys(dist).forEach(key => {
        distPercent[key] = total > 0 ? Math.round((dist[key] / total) * 100) : 0;
      });
      setRatingDistribution(distPercent);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reviews/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(response.data.canReview);
      setBookingId(response.data.bookingId);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingReviewId) {
        // Update existing review
        await axios.put(
          `http://localhost:5000/api/reviews/${editingReviewId}`,
          {
            rating: reviewData.rating,
            comment: reviewData.comment
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingReviewId(null);
      } else {
        // Create new review
        await axios.post(
          'http://localhost:5000/api/reviews',
          {
            tutorId: id,
            bookingId: bookingId,
            rating: reviewData.rating,
            comment: reviewData.comment
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCanReview(false);
      }
      
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      fetchReviews();
      fetchTutorProfile();
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to submit review';
      alert(errorMessage);
    }
  };

  const startEditReview = (review) => {
    setReviewData({ rating: review.rating, comment: review.comment });
    setEditingReviewId(review._id);
    setShowReviewForm(true);
  };

  const cancelEdit = () => {
    setShowReviewForm(false);
    setEditingReviewId(null);
    setReviewData({ rating: 5, comment: '' });
  };

  const markHelpful = async (reviewId, helpful) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to vote on reviews');
        return;
      }
      await axios.patch(
        `http://localhost:5000/api/reviews/${reviewId}/helpful`,
        { helpful },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (error) {
      console.error('Error marking review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to vote on review';
      alert(errorMessage);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInMonths = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24 * 30));
    if (diffInMonths === 0) return 'This month';
    if (diffInMonths === 1) return '1 month ago';
    return `${diffInMonths} months ago`;
  };

  const bookSession = () => {
    if (!user) {
      router.push('/auth/student/login');
      return;
    }
    // Navigate to student dashboard with booking modal
    router.push(`/student/home?bookTutor=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white text-xl">Tutor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <ChatWidget />
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Sidebar - Tutor Summary */}
          <aside className="md:col-span-1">
            <div className="bg-[#1A1A1F] rounded-xl p-6 border border-gray-800 sticky top-8">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#E8D4BB] flex items-center justify-center">
                  <span className="text-7xl">👩</span>
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{tutor.name}</h1>
                <p className="text-gray-400">
                  {tutor.bio?.split(',')[0] || 'Expert Tutor'}
                </p>
              </div>

              {/* Rating Summary */}
              <div className="mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white mr-2">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(reviewStats.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{reviewStats.totalReviews} reviews</p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="text-gray-400 w-12">{rating} star</span>
                      <div className="flex-1 mx-3 bg-[#2A2A32] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full"
                          style={{ width: `${ratingDistribution[rating] || 0}%` }}
                        />
                      </div>
                      <span className="text-gray-400 w-10 text-right">
                        {ratingDistribution[rating] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.slice(0, 3).map((subject, idx) => (
                      <span key={idx} className="text-white text-sm">{subject}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Experience</h3>
                  <p className="text-white">5 years</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Hourly Rate</h3>
                  <p className="text-white text-xl font-bold">${tutor.hourlyRate || 50}/hr</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={bookSession}
                  className="w-full px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book a Session</span>
                </button>
                <button
                  onClick={() => router.push(`/chat?tutorId=${id}`)}
                  className="w-full px-6 py-3 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Message Tutor</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Content - Details and Reviews */}
          <main className="md:col-span-2">
            {/* About Section */}
            <div className="bg-[#1A1A1F] rounded-xl p-8 border border-gray-800 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">About {tutor.name}</h2>
              <p className="text-gray-300 leading-relaxed">
                {tutor.bio || `${tutor.name} is a highly experienced tutor with expertise in ${tutor.subjects?.slice(0, 2).join(' and ')}. With a focus on helping students excel in their studies, ${tutor.name.split(' ')[0]} provides personalized instruction tailored to each student's learning style. Their teaching approach is patient, clear, and results-oriented, ensuring students not only understand the material but also gain confidence in their abilities.`}
              </p>
            </div>

            {/* Subjects & Specializations */}
            <div className="bg-[#1A1A1F] rounded-xl p-8 border border-gray-800 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Subjects & Specializations</h2>
              <div className="flex flex-wrap gap-3">
                {tutor.subjects?.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-[#2A2A32] text-gray-300 rounded-lg text-sm"
                  >
                    {subject}
                  </span>
                ))}
                {(!tutor.subjects || tutor.subjects.length === 0) && (
                  <>
                    <span className="px-4 py-2 bg-[#2A2A32] text-gray-300 rounded-lg text-sm">Calculus</span>
                    <span className="px-4 py-2 bg-[#2A2A32] text-gray-300 rounded-lg text-sm">Linear Algebra</span>
                    <span className="px-4 py-2 bg-[#2A2A32] text-gray-300 rounded-lg text-sm">Differential Equations</span>
                  </>
                )}
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-[#1A1A1F] rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Student Reviews</h2>
                {canReview && user && !editingReviewId && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-[#2A2A32] rounded-lg p-6 mb-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {editingReviewId ? 'Edit Your Review' : 'Write Your Review'}
                  </h3>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 cursor-pointer ${
                            star <= reviewData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-600'
                          }`}
                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Comment</label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      placeholder="Share your experience with this tutor..."
                      className="w-full px-4 py-3 bg-[#1A1A1F] text-white rounded-lg border border-gray-700 focus:border-[#3B82F6] focus:outline-none resize-none"
                      rows="4"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={submitReview}
                      disabled={!reviewData.comment.trim()}
                      className="px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingReviewId ? 'Update Review' : 'Submit Review'}
                    </button>
                    {editingReviewId && (
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-2 bg-[#2A2A32] hover:bg-[#3A3A42] text-white rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No reviews yet</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-800 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#E8D4BB] flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-white font-semibold">{review.student?.name || 'Student'}</h4>
                              <p className="text-gray-400 text-sm">{formatDate(review.createdAt)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              {user && review.student?._id === user.id && (
                                <button
                                  onClick={() => startEditReview(review)}
                                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 mb-3">{review.comment}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <button
                              onClick={() => markHelpful(review._id, true)}
                              className="flex items-center space-x-1 text-gray-400 hover:text-white transition"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{review.helpful || 0}</span>
                            </button>
                            <button
                              onClick={() => markHelpful(review._id, false)}
                              className="flex items-center space-x-1 text-gray-400 hover:text-white transition"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>{review.notHelpful || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
