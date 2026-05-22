import './config/timezone.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import businessesRoutes from './routes/businesses.routes.js';
import servicesRoutes from './routes/services.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import utilsRoutes from './routes/utils.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import staffRoutes from './routes/staff.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/businesses', businessesRoutes);
app.use('/services', servicesRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/marketplace', marketplaceRoutes);
app.use('/staff', staffRoutes);
app.use('/utils', utilsRoutes);
app.use('/upload', uploadRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Zyro API' });
});

// Error handling
app.use(errorMiddleware);

export default app;
