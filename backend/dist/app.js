"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const boards_routes_1 = __importDefault(require("./routes/boards.routes"));
const lists_routes_1 = __importDefault(require("./routes/lists.routes"));
const cards_routes_1 = __importDefault(require("./routes/cards.routes"));
const app = (0, express_1.default)();
// CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // In development, allow any origin. In production, only allow FRONTEND_URL.
        if (!origin || process.env.NODE_ENV === 'development') {
            callback(null, true);
        }
        else {
            const allowed = [process.env.FRONTEND_URL || 'http://localhost:5173'];
            if (allowed.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'TaskFlow API is running 🚀' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/boards', boards_routes_1.default);
app.use('/api/lists', lists_routes_1.default);
app.use('/api/cards', cards_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});
exports.default = app;
//# sourceMappingURL=app.js.map