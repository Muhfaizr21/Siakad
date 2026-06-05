const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    if (!token) {
      console.log('Login failed:', data);
      return;
    }
    
    // Now request ListStages
    http.get('http://localhost:8000/api/kencana-fakultas/stages?period_id=1&fakultas_id=1', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Stages response:', res2.statusCode, data2);
      });
    });

    // Also request GetFacultyPhase
    http.get('http://localhost:8000/api/kencana-fakultas/phase?period_id=1&fakultas_id=1', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, res3 => {
      let data3 = '';
      res3.on('data', chunk => data3 += chunk);
      res3.on('end', () => {
        console.log('Phase response:', res3.statusCode, data3);
      });
    });
  });
});

req.write(JSON.stringify({ email: 'superadmin@bku.ac.id', password: 'sandi_rahasia_bku_2026' }));
req.end();
