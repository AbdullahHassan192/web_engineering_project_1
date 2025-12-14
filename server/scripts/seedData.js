const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tutoring-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const subjects = [
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'CNN Architecture',
  'Natural Language Processing',
  'Reinforcement Learning',
  'Data Science',
  'Python Programming',
  'Web Development',
  'React.js',
  'Node.js',
  'MongoDB',
  'Mathematics',
  'Calculus',
  'Linear Algebra',
  'Statistics',
  'Physics',
  'Quantum Mechanics',
  'Chemistry',
  'Organic Chemistry',
  'Biology',
  'Genetics'
];

const tutorData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    bio: 'PhD in Machine Learning from MIT. 10+ years of experience in AI research and teaching. Specialized in neural networks and computer vision applications.',
    subjects: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Python Programming'],
    hourlyRate: 85,
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@example.com',
    bio: 'Former Google AI engineer with a passion for teaching. Expert in NLP and transformers. Published 20+ papers in top ML conferences.',
    subjects: ['Natural Language Processing', 'Deep Learning', 'Machine Learning', 'Python Programming'],
    hourlyRate: 95,
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    bio: 'Data Science consultant and educator. Specializing in statistical analysis and predictive modeling. Master instructor at top bootcamps.',
    subjects: ['Data Science', 'Statistics', 'Machine Learning', 'Python Programming'],
    hourlyRate: 75,
    avatar: 'https://i.pravatar.cc/150?img=9'
  },
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    bio: 'Full-stack developer with 8 years in the industry. Passionate about teaching modern web technologies and best practices.',
    subjects: ['Web Development', 'React.js', 'Node.js', 'MongoDB'],
    hourlyRate: 65,
    avatar: 'https://i.pravatar.cc/150?img=14'
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    bio: 'Mathematics professor with 15 years of teaching experience. Expert in making complex concepts simple and intuitive.',
    subjects: ['Mathematics', 'Calculus', 'Linear Algebra', 'Statistics'],
    hourlyRate: 70,
    avatar: 'https://i.pravatar.cc/150?img=33'
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    bio: 'Reinforcement Learning researcher at OpenAI. Teaching students to build intelligent agents and game AI.',
    subjects: ['Reinforcement Learning', 'Machine Learning', 'Deep Learning', 'Python Programming'],
    hourlyRate: 100,
    avatar: 'https://i.pravatar.cc/150?img=20'
  },
  {
    name: 'Dr. David Kim',
    email: 'david.kim@example.com',
    bio: 'Theoretical physicist turned ML engineer. Bridging the gap between physics and modern AI. PhD from Stanford.',
    subjects: ['Physics', 'Machine Learning', 'Mathematics', 'Quantum Mechanics'],
    hourlyRate: 80,
    avatar: 'https://i.pravatar.cc/150?img=52'
  },
  {
    name: 'Rachel Foster',
    email: 'rachel.foster@example.com',
    bio: 'Computer Vision expert working on autonomous vehicles. Passionate about CNNs and image processing techniques.',
    subjects: ['Computer Vision', 'CNN Architecture', 'Deep Learning', 'Python Programming'],
    hourlyRate: 90,
    avatar: 'https://i.pravatar.cc/150?img=44'
  },
  {
    name: 'Prof. Robert Martinez',
    email: 'robert.martinez@example.com',
    bio: 'Chemistry professor with a gift for teaching. Making organic chemistry fun and accessible for all students.',
    subjects: ['Chemistry', 'Organic Chemistry', 'Biology'],
    hourlyRate: 60,
    avatar: 'https://i.pravatar.cc/150?img=68'
  },
  {
    name: 'Dr. Lisa Anderson',
    email: 'lisa.anderson@example.com',
    bio: 'Bioinformatics researcher specializing in genetics and computational biology. PhD from Harvard Medical School.',
    subjects: ['Biology', 'Genetics', 'Data Science', 'Python Programming'],
    hourlyRate: 75,
    avatar: 'https://i.pravatar.cc/150?img=29'
  }
];

const studentData = [
  { name: 'John Smith', email: 'john.smith@example.com' },
  { name: 'Emma Davis', email: 'emma.davis@example.com' },
  { name: 'Oliver Brown', email: 'oliver.brown@example.com' },
  { name: 'Sophia Miller', email: 'sophia.miller@example.com' },
  { name: 'Liam Wilson', email: 'liam.wilson@example.com' },
  { name: 'Ava Taylor', email: 'ava.taylor@example.com' },
  { name: 'Noah Anderson', email: 'noah.anderson@example.com' },
  { name: 'Isabella Thomas', email: 'isabella.thomas@example.com' },
  { name: 'Ethan Jackson', email: 'ethan.jackson@example.com' },
  { name: 'Mia White', email: 'mia.white@example.com' },
  { name: 'Lucas Harris', email: 'lucas.harris@example.com' },
  { name: 'Charlotte Martin', email: 'charlotte.martin@example.com' },
  { name: 'Mason Lee', email: 'mason.lee@example.com' },
  { name: 'Amelia Walker', email: 'amelia.walker@example.com' },
  { name: 'Logan Hall', email: 'logan.hall@example.com' }
];

const reviewComments = [
  "Absolutely brilliant tutor! Explained concepts clearly and patiently. Highly recommend!",
  "Very knowledgeable and professional. Made difficult topics easy to understand.",
  "Great teaching style and very approachable. Helped me ace my exam!",
  "Patient and thorough. Takes time to ensure you really understand the material.",
  "Excellent tutor! Well-prepared lessons and great examples. Worth every penny!",
  "Outstanding instructor. Clear explanations and real-world applications.",
  "Very helpful and accommodating. Answers all questions with patience.",
  "Fantastic tutor! Makes learning enjoyable and engaging.",
  "Highly skilled and professional. Would definitely recommend to others.",
  "Amazing teacher! Helped me go from struggling to confident in just a few sessions.",
  "Clear communication and deep knowledge of the subject. 5 stars!",
  "Very patient and encouraging. Creates a comfortable learning environment.",
  "Exceptional tutor! Breaks down complex topics into digestible pieces.",
  "Knowledgeable and friendly. Always prepared and on time.",
  "Great experience! Learned more in a few sessions than I did in months on my own.",
  "Superb teaching methods. Really knows how to explain difficult concepts.",
  "Very professional and well-organized. Excellent use of time.",
  "Wonderful tutor! Passionate about the subject and it shows.",
  "Helpful and responsive. Goes above and beyond to help students succeed.",
  "Top-notch instruction! Would book again without hesitation."
];

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing tutors, students, and reviews...');
    await User.deleteMany({ email: { $in: [...tutorData.map(t => t.email), ...studentData.map(s => s.email)] } });
    
    // Create tutors
    console.log('Creating tutors...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const tutors = await Promise.all(
      tutorData.map(async (tutor) => {
        const newTutor = new User({
          ...tutor,
          role: 'tutor',
          passwordHash: hashedPassword,
          availability: {
            monday: ['09:00-17:00'],
            tuesday: ['09:00-17:00'],
            wednesday: ['09:00-17:00'],
            thursday: ['09:00-17:00'],
            friday: ['09:00-17:00']
          }
        });
        return await newTutor.save();
      })
    );
    console.log(`Created ${tutors.length} tutors`);

    // Create students
    console.log('Creating students...');
    const students = await Promise.all(
      studentData.map(async (student) => {
        const newStudent = new User({
          ...student,
          role: 'student',
          passwordHash: hashedPassword,
          bio: 'Eager learner seeking to expand knowledge'
        });
        return await newStudent.save();
      })
    );
    console.log(`Created ${students.length} students`);

    // Create bookings and reviews
    console.log('Creating bookings and reviews...');
    let reviewCount = 0;
    let bookingCount = 0;

    for (const tutor of tutors) {
      // Each tutor gets 3-8 reviews
      const numReviews = Math.floor(Math.random() * 6) + 3;
      const selectedStudents = students.sort(() => 0.5 - Math.random()).slice(0, numReviews);

      for (const student of selectedStudents) {
        // Create a completed booking first
        const booking = new Booking({
          studentId: student._id,
          tutorId: tutor._id,
          subject: tutor.subjects[Math.floor(Math.random() * tutor.subjects.length)],
          startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          endTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 + 3600000), // 1 hour later
          status: 'completed',
          hourlyRate: tutor.hourlyRate,
          meetingId: `MTG-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          videoLink: 'https://meet.example.com/placeholder'
        });
        await booking.save();
        bookingCount++;

        // Create review for this booking
        const rating = Math.floor(Math.random() * 2) + 4; // Rating 4 or 5
        const review = new Review({
          student: student._id,
          tutor: tutor._id,
          booking: booking._id,
          rating: rating,
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          helpfulCount: Math.floor(Math.random() * 15)
        });
        await review.save();
        reviewCount++;
      }

      // Update tutor's average rating
      const reviews = await Review.find({ tutor: tutor._id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      tutor.averageRating = avgRating;
      tutor.totalReviews = reviews.length;
      await tutor.save();
    }

    console.log(`Created ${bookingCount} bookings and ${reviewCount} reviews`);
    console.log('\n✅ Data seeding completed successfully!');
    console.log('\nLogin credentials for all users:');
    console.log('Password: password123');
    console.log('\nTutors:');
    tutors.forEach(t => console.log(`  - ${t.name} (${t.email})`));
    console.log('\nStudents:');
    students.forEach(s => console.log(`  - ${s.name} (${s.email})`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
