// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin } = require('../models/Admin'); // Adjust path to your Admin model

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES = '2h'; // token expiration

exports.login = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    // Guest login (no email/password)
    if (role === 'guest') {
      const token = jwt.sign({ role: 'guest', name: 'Guest User' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      return res.json({ token, user: { name: 'Guest User', role: 'guest' } });
    }

    // Admin login
    if (!email || !password || role !== 'admin') {
      return res.status(400).json({ message: 'Missing or invalid credentials' });
    }

    // Fetch admin from database
    let admin = await Admin.findOne({ where: { email } }); // Prisma example

    admin = {
      id: admin.ID,
      name: admin.NAME,
      email: admin.EMAIL,
      password: admin.PASSWORD,
      role: admin.ROLE,
    };
    // const admin = await Admin.findOne({ email }); // Mongoose example

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(admin);

    // Compare passwords
    const isMatch = password == admin.password; // await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { sub: admin.id, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({ token, user: { name: admin.name, role: admin.role } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};