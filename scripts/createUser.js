const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Get MongoDB URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    userName: String,
    password: String,
    brandName: String,
    location: String,
    phone: String,
    logo: String,
    role: String
});

const User = mongoose.model('User', UserSchema);

async function createUser() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!');

        // Check if user already exists
        const existingUser = await User.findOne({ userName: 'admin' });
        if (existingUser) {
            console.log('⚠️  User already exists!');
            process.exit(0);
        }

        // 🔐 Hash the password before saving
        const hashedPassword = await bcrypt.hash('admin', 10); // 10 = salt rounds

        const user = await User.create({
            userName: 'admin',
            password: hashedPassword,
            brandName: 'phone store',
            location: 'شارع 16',
            phone: '01000020000',
            logo: '',
            role: "admin"
        });

        console.log('✅ User created successfully!');
        console.log('Username:', user.userName);
        console.log('User ID:', user._id);
        console.log('🔑 Hashed Password:', user.password);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
//node scripts/createUser.js
createUser();