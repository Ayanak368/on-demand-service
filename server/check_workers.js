const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({ user: { id: 'admin', role: 'admin' } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

fetch('http://localhost:5001/api/admin/workers', {
    headers: { 'x-auth-token': token }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data[0], null, 2)))
.catch(err => console.error(err));
