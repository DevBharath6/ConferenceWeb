const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const navbarRoutes = require('./routes/navbarRoutes');
app.use('/api/navbar', navbarRoutes);
const footerRoutes = require('./routes/footerRoutes');
app.use('/api/footer', footerRoutes);




// Debugging + Mongoose fix
mongoose.set('strictQuery', true);
console.log('Connecting to Mongo URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend server running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
