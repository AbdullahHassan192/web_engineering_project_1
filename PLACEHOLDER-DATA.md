# Placeholder Data Summary

## Overview
The database has been populated with realistic placeholder data to demonstrate the TutorConnect platform.

## Login Credentials
**Password for all accounts:** `password123`

## Tutors (10 total)

### 1. Dr. Sarah Johnson
- **Email:** sarah.johnson@example.com
- **Subjects:** Machine Learning, Deep Learning, Computer Vision, Python Programming
- **Rate:** $85/hour
- **Bio:** PhD in Machine Learning from MIT. 10+ years of experience in AI research and teaching.

### 2. Prof. Michael Chen
- **Email:** michael.chen@example.com
- **Subjects:** Natural Language Processing, Deep Learning, Machine Learning, Python Programming
- **Rate:** $95/hour
- **Bio:** Former Google AI engineer with a passion for teaching. Expert in NLP and transformers.

### 3. Dr. Emily Rodriguez
- **Email:** emily.rodriguez@example.com
- **Subjects:** Data Science, Statistics, Machine Learning, Python Programming
- **Rate:** $75/hour
- **Bio:** Data Science consultant and educator. Specializing in statistical analysis.

### 4. Alex Thompson
- **Email:** alex.thompson@example.com
- **Subjects:** Web Development, React.js, Node.js, MongoDB
- **Rate:** $65/hour
- **Bio:** Full-stack developer with 8 years in the industry.

### 5. Dr. James Wilson
- **Email:** james.wilson@example.com
- **Subjects:** Mathematics, Calculus, Linear Algebra, Statistics
- **Rate:** $70/hour
- **Bio:** Mathematics professor with 15 years of teaching experience.

### 6. Maria Garcia
- **Email:** maria.garcia@example.com
- **Subjects:** Reinforcement Learning, Machine Learning, Deep Learning, Python Programming
- **Rate:** $100/hour
- **Bio:** Reinforcement Learning researcher at OpenAI.

### 7. Dr. David Kim
- **Email:** david.kim@example.com
- **Subjects:** Physics, Machine Learning, Mathematics, Quantum Mechanics
- **Rate:** $80/hour
- **Bio:** Theoretical physicist turned ML engineer. PhD from Stanford.

### 8. Rachel Foster
- **Email:** rachel.foster@example.com
- **Subjects:** Computer Vision, CNN Architecture, Deep Learning, Python Programming
- **Rate:** $90/hour
- **Bio:** Computer Vision expert working on autonomous vehicles.

### 9. Prof. Robert Martinez
- **Email:** robert.martinez@example.com
- **Subjects:** Chemistry, Organic Chemistry, Biology
- **Rate:** $60/hour
- **Bio:** Chemistry professor with a gift for teaching.

### 10. Dr. Lisa Anderson
- **Email:** lisa.anderson@example.com
- **Subjects:** Biology, Genetics, Data Science, Python Programming
- **Rate:** $75/hour
- **Bio:** Bioinformatics researcher specializing in genetics. PhD from Harvard Medical School.

## Students (15 total)

All students have the password `password123`:

- John Smith (john.smith@example.com)
- Emma Davis (emma.davis@example.com)
- Oliver Brown (oliver.brown@example.com)
- Sophia Miller (sophia.miller@example.com)
- Liam Wilson (liam.wilson@example.com)
- Ava Taylor (ava.taylor@example.com)
- Noah Anderson (noah.anderson@example.com)
- Isabella Thomas (isabella.thomas@example.com)
- Ethan Jackson (ethan.jackson@example.com)
- Mia White (mia.white@example.com)
- Lucas Harris (lucas.harris@example.com)
- Charlotte Martin (charlotte.martin@example.com)
- Mason Lee (mason.lee@example.com)
- Amelia Walker (amelia.walker@example.com)
- Logan Hall (logan.hall@example.com)

## Data Generated

- **10 Tutors** with diverse subjects and expertise
- **15 Students** 
- **52 Completed Bookings** (historical sessions)
- **52 Reviews** from students on tutors
  - Ratings: 4-5 stars (high quality reviews)
  - Realistic review comments
  - Random helpful vote counts (0-15)

## Features

### Tutors
- Each tutor has 3-8 reviews from different students
- Average ratings automatically calculated based on reviews
- Subjects span AI/ML, web development, mathematics, sciences
- Hourly rates range from $60-$100
- All tutors have Monday-Friday 9am-5pm availability

### Reviews
- All reviews are based on completed bookings
- Authentic-sounding comments
- Ratings of 4 or 5 stars to simulate quality platform
- Each review linked to a specific booking and student

### Bookings
- All marked as "completed" status
- Random dates within the last 30 days
- 1-hour duration sessions
- Each booking has a unique meeting ID
- Tied to specific tutor subjects

## How to Re-seed

To regenerate placeholder data:

```bash
cd server
node scripts/seedData.js
```

**Note:** This will delete existing placeholder users and create fresh data.

## Testing the Platform

1. **Browse Tutors:** Visit the search page to see all tutors with their ratings and subjects
2. **View Profiles:** Click on any tutor to see their profile with real reviews
3. **Login as Student:** Use any student email with password `password123`
4. **Login as Tutor:** Use any tutor email with password `password123`
5. **Test Filtering:** Use subject, price, and rating filters on search page
6. **View Reviews:** Each tutor profile shows authentic reviews with star ratings

## Database Collections

The seed script populates:
- `users` collection (tutors and students)
- `bookings` collection (completed sessions)
- `reviews` collection (student feedback on tutors)

Each tutor's `averageRating` and `totalReviews` fields are automatically calculated and updated.
