const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tutors',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`\nStatus: ${res.statusCode}`);
      console.log(`Found ${json.tutors?.length || 0} tutors\n`);
      
      if (json.tutors) {
        json.tutors.forEach((t, i) => {
          console.log(`${i + 1}. ${t.name}`);
          console.log(`   Email: ${t.email}`);
          console.log(`   Rating: ${t.averageRating || 'N/A'} (${t.totalReviews || 0} reviews)`);
          console.log(`   Rate: $${t.hourlyRate || 0}/hr`);
          console.log();
        });
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw data:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
  process.exit(1);
});

req.end();
