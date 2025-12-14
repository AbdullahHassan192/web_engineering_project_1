const axios = require('axios');

async function testTutorAPI() {
  try {
    console.log('Testing /api/tutors endpoint...\n');
    const response = await axios.get('http://localhost:5000/api/tutors');
    console.log(`Status: ${response.status}`);
    console.log(`Found ${response.data.tutors?.length || 0} tutors\n`);
    
    if (response.data.tutors) {
      response.data.tutors.forEach((tutor, idx) => {
        console.log(`${idx + 1}. ${tutor.name}`);
        console.log(`   Email: ${tutor.email}`);
        console.log(`   Rating: ${tutor.averageRating || 'N/A'}, Reviews: ${tutor.totalReviews || 0}`);
        console.log(`   Subjects: ${tutor.subjects?.join(', ') || 'None'}`);
        console.log(`   Rate: $${tutor.hourlyRate || 0}/hr\n`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
  process.exit(0);
}

testTutorAPI();
