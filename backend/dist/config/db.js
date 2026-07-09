"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                const collections = await db.listCollections({ name: 'users' }).toArray();
                if (collections.length > 0) {
                    const indexes = await db.collection('users').indexes();
                    if (indexes.some((idx) => idx.name === 'username_1')) {
                        await db.collection('users').dropIndex('username_1');
                        console.log('🧹 Dropped obsolete unique index username_1 from users collection');
                    }
                }
            }
        }
        catch (err) {
            console.warn('⚠️ Could not check/drop duplicate index username_1:', err);
        }
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});
exports.default = connectDB;
//# sourceMappingURL=db.js.map