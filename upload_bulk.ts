import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

async function main() {
  const loginRes = await axios.post('http://localhost:5050/api/auth/login', {
    email: 'admin2@aion.local',
    password: 'password123'
  });
  
  const token = loginRes.data.token;
  console.log('Logged in, token received');

  const filePath = path.join(__dirname, 'frontend/public/templates/bulk_users_filled.xlsx');
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const uploadRes = await axios.post('http://localhost:5050/api/auth/bulk-register', form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Upload response:', uploadRes.data);
}

main().catch(err => console.error(err.response ? err.response.data : err));
