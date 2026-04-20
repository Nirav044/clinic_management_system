const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Test Supabase connection
const supabase = require('./lib/supabase');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', async (req, res) => {
    try {
        // Test database connection
        const { data, error } = await supabase.from('clinics').select('count').limit(1);
        if (error) throw error;
        res.json({ message: 'SmartClinic Backend Server is running!', database: 'Connected to Supabase' });
    } catch (err) {
        res.json({ message: 'SmartClinic Backend Server is running!', database: 'Not connected', error: err.message });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/dispensary', require('./routes/dispensary'));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('✅ Using Supabase PostgreSQL database');
});
