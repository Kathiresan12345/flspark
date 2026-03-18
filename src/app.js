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

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/pantry', require('./modules/pantry/pantry.routes'));
app.use('/api/receipts', require('./modules/receipt/receipt.routes'));
app.use('/api/recipes', require('./modules/recipe/recipe.routes'));
app.use('/api/meal-plans', require('./modules/meal-plan/mealPlan.routes'));
app.use('/api/shopping-lists', require('./modules/shopping-list/shoppingList.routes'));
app.use('/api/notifications', require('./modules/notification/notification.routes'));

// Error Handling
app.use(errorMiddleware);

module.exports = app;
