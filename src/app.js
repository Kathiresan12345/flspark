const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { errorMiddleware } = require('./common/middleware/error.middleware');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to FlavorSpark API', 
    status: 'OK', 
    documentation: 'See README for API endpoints' 
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes (Prefix /api is handled by Vercel's api/ folder)
app.use('/auth', require('./modules/auth/auth.routes'));
app.use('/pantry', require('./modules/pantry/pantry.routes'));
app.use('/receipts', require('./modules/receipt/receipt.routes'));
app.use('/recipes', require('./modules/recipe/recipe.routes'));
app.use('/meal-plans', require('./modules/meal-plan/mealPlan.routes'));
app.use('/shopping-lists', require('./modules/shopping-list/shoppingList.routes'));
app.use('/notifications', require('./modules/notification/notification.routes'));

// Error Handling
app.use(errorMiddleware);

module.exports = app;
