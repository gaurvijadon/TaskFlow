import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
          const indexes = await db.collection('users').indexes();
          if (indexes.some((idx: any) => idx.name === 'username_1')) {
            await db.collection('users').dropIndex('username_1');
            console.log('🧹 Dropped obsolete unique index username_1 from users collection');
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not check/drop duplicate index username_1:', err);
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

export default connectDB;
