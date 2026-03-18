# Smart Pantry & AI Recipe Assistant

## Full Backend Technical Specification (V1)

## 1. Project Overview

This backend powers a Smart Pantry and AI Recipe Assistant application. The system manages user pantry items, scans grocery receipts, generates AI-powered recipe suggestions, creates meal plans, maintains shopping lists, and sends expiry notifications.

The V1 backend should be implemented as a **modular monolith** with clean domain boundaries so it can scale into microservices later without major refactoring.

### Core goals

* secure user identity management
* structured pantry inventory tracking
* reliable receipt-to-pantry automation
* low-cost AI recipe generation using Gemini
* scalable background processing
* production-ready API design

---

## 2. Recommended Backend Stack

### Core stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **ORM:** Prisma ORM
* **Database:** PostgreSQL
* **Authentication:** Firebase Authentication
* **AI Provider:** Gemini API
* **OCR:** Google Vision API
* **Recipe Provider:** Spoonacular API
* **Cache:** Redis
* **Queue / Jobs:** BullMQ
* **Object Storage:** AWS S3 or Firebase Storage
* **Push Notifications:** Firebase Cloud Messaging (FCM)
* **Deployment:** Docker + Render / AWS / DigitalOcean

### Why this stack

* Node + Express gives fast development and wide ecosystem support
* Prisma improves schema safety and migration workflow
* PostgreSQL is reliable for relational product data
* Firebase Auth reduces auth complexity and improves security
* Gemini supports structured AI generation at lower cost
* Redis reduces repeated AI/API cost
* BullMQ lets heavy OCR and AI workloads run off the request cycle

---

## 3. Architecture Style

## 3.1 V1 Architecture

Use a **modular monolith** with internal modules:

* Auth
* Users
* Pantry
* Receipts
* Recipes
* Meal Plans
* Shopping Lists
* Notifications
* Background Jobs

## 3.2 Why modular monolith for V1

A microservice architecture is unnecessary for MVP and increases operational complexity. A modular monolith gives:

* simpler deployment
* lower infra cost
* faster development
* easier debugging
* future service extraction path

## 3.3 Future service extraction path

Later, the following modules can be split into separate services:

* OCR Service
* AI Recipe Service
* Notification Service
* Pantry Service

---

## 4. High-Level Functional Flow

## 4.1 User Authentication Flow

1. User signs in or signs up through Firebase on the client
2. Client receives Firebase ID token
3. Client sends token in `Authorization: Bearer <token>` header
4. Backend verifies token using Firebase Admin SDK
5. Backend creates or syncs application user in PostgreSQL
6. Backend attaches application user context to the request

## 4.2 Pantry Flow

1. User adds pantry items manually or through receipt confirmation
2. Backend validates quantity, unit, and ownership
3. Pantry item is stored in PostgreSQL
4. Expiry checks become available for alert jobs

## 4.3 Receipt Processing Flow

1. User uploads receipt image
2. Backend stores image in S3 or Firebase Storage
3. Backend creates a receipt record with `uploaded` status
4. Backend queues receipt processing job
5. Worker reads image and sends it to Google Vision API
6. Raw OCR text is passed to Gemini for structured cleanup
7. Parsed receipt items are stored in `receipt_items`
8. Receipt status becomes `completed`
9. User confirms selected items to add to pantry

## 4.4 Recipe Suggestion Flow

1. Backend fetches pantry items
2. Ingredient list is normalized and hashed
3. System checks Redis and database cache
4. If cache miss:

   * query Spoonacular for base recipes
   * optionally ask Gemini for personalized recipe ideas or substitutions
5. Store response in cache
6. Return recipes to client

## 4.5 Expiry Alert Flow

1. Daily scheduled job runs at 8:00 AM
2. Query pantry items expiring within next 2 days
3. Create notification records
4. Send FCM push notifications

---

## 5. Core Non-Functional Requirements

### Performance

* protected API response target: under 300 ms for normal CRUD
* OCR and AI flows should be asynchronous
* recipe cache hit should return quickly from Redis

### Reliability

* queue retries for OCR and AI failures
* idempotent confirm endpoints where possible
* structured logging for all background jobs

### Security

* Firebase token verification on all protected endpoints
* rate limiting for public or abuse-prone endpoints
* file type validation for receipt uploads
* signed URLs for private files
* secrets stored only in environment variables

### Scalability

* stateless API instances
* Redis shared cache
* background workers can scale separately
* object storage for uploads

---

## 6. Database Design

**Database:** PostgreSQL
**ORM:** Prisma

### Main entities

* users
* pantry_items
* receipts
* receipt_items
* recipes
* recipe_cache
* meal_plans
* shopping_lists
* shopping_list_items
* notifications
* device_tokens

---

## 7. Database Schema Specification

## 7.1 Users

Purpose: stores user account profile and household preferences.

### Fields

* `id` UUID primary key
* `firebase_uid` string unique not null
* `email` string unique not null
* `name` string nullable
* `diet_preference` string nullable
* `allergies` JSON nullable
* `household_size` integer default 1
* `created_at` timestamp
* `updated_at` timestamp

---

## 7.2 Pantry Items

Purpose: stores ingredients owned by a user.

### Fields

* `id` UUID primary key
* `user_id` UUID foreign key -> users.id
* `item_name` string not null
* `normalized_name` string indexed not null
* `category` string nullable
* `quantity` decimal nullable
* `unit` string nullable
* `expiry_date` date nullable
* `source` enum(`manual`, `receipt`, `ai_inferred`) default `manual`
* `created_at` timestamp
* `updated_at` timestamp

### Notes

`normalized_name` is critical for matching ingredient variants like:

* Egg / Eggs / Large Eggs
* Milk / Whole Milk / Dairy Milk

---

## 7.3 Receipts

Purpose: stores uploaded receipt metadata.

### Fields

* `id` UUID primary key
* `user_id` UUID foreign key -> users.id
* `image_url` string not null
* `ocr_raw_text` text nullable
* `processing_status` enum(`uploaded`, `processing`, `completed`, `failed`) default `uploaded`
* `error_message` text nullable
* `created_at` timestamp
* `updated_at` timestamp

---

## 7.4 Receipt Items

Purpose: stores AI-cleaned receipt items before pantry confirmation.

### Fields

* `id` UUID primary key
* `receipt_id` UUID foreign key -> receipts.id
* `item_name` string not null
* `normalized_name` string nullable
* `quantity` decimal nullable
* `unit` string nullable
* `category` string nullable
* `confidence_score` decimal nullable
* `is_confirmed` boolean default false
* `created_at` timestamp

---

## 7.5 Recipes

Purpose: stores recipe metadata from external or AI-generated sources.

### Fields

* `id` UUID primary key
* `external_id` string nullable
* `source` enum(`spoonacular`, `ai_generated`, `internal`) not null
* `title` string not null
* `description` text nullable
* `ingredients` JSONB not null
* `instructions` text not null
* `cooking_time_minutes` integer nullable
* `difficulty_level` string nullable
* `image_url` string nullable
* `nutrition_data` JSONB nullable
* `created_at` timestamp
* `updated_at` timestamp

---

## 7.6 Recipe Cache

Purpose: caches recipe results to reduce Gemini and API cost.

### Fields

* `id` UUID primary key
* `ingredient_hash` string unique indexed not null
* `response_payload` JSONB not null
* `source` string not null
* `expires_at` timestamp not null
* `created_at` timestamp

---

## 7.7 Meal Plans

Purpose: stores daily or weekly meal assignments.

### Fields

* `id` UUID primary key
* `user_id` UUID foreign key -> users.id
* `plan_date` date not null
* `meal_type` enum(`breakfast`, `lunch`, `dinner`, `snack`) not null
* `recipe_id` UUID foreign key -> recipes.id
* `servings` integer default 1
* `created_at` timestamp
* `updated_at` timestamp

---

## 7.8 Shopping Lists

Purpose: stores shopping list containers.

### Fields

* `id` UUID primary key
* `user_id` UUID foreign key -> users.id
* `title` string default `Default Shopping List`
* `created_at` timestamp
* `updated_at` timestamp

---

## 7.9 Shopping List Items

Purpose: stores items within shopping lists.

### Fields

* `id` UUID primary key
* `shopping_list_id` UUID foreign key -> shopping_lists.id
* `item_name` string not null
* `normalized_name` string nullable
* `quantity` decimal nullable
* `unit` string nullable
* `category` string nullable
* `is_purchased` boolean default false
* `created_at` timestamp
* `updated_at` timestamp

---

## 7.10 Notifications

Purpose: stores in-app and push notification history.

### Fields

* `id` UUID primary key
* `user_id` UUID foreign key -> users.id
* `type` enum(`expiry_alert`, `meal_reminder`, `shopping_reminder`, `system`) not null
* `title` string not null
* `message` text not null
* `is_read` boolean default false
* `sent_at` timestamp nullable
* `created_at` timestamp

---

## 7.11 Device Tokens

Purpose: stores user push notification device tokens.

### Fields

* `id` UUID primary key
* `user_id` UUID foreign key -> users.id
* `fcm_token` string unique not null
* `platform` string nullable
* `created_at` timestamp
* `updated_at` timestamp

---

## 8. Prisma Schema (Starter)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PantrySource {
  manual
  receipt
  ai_inferred
}

enum ReceiptProcessingStatus {
  uploaded
  processing
  completed
  failed
}

enum RecipeSource {
  spoonacular
  ai_generated
  internal
}

enum MealType {
  breakfast
  lunch
  dinner
  snack
}

enum NotificationType {
  expiry_alert
  meal_reminder
  shopping_reminder
  system
}

model User {
  id             String         @id @default(uuid())
  firebaseUid    String         @unique @map("firebase_uid")
  email          String         @unique
  name           String?
  dietPreference String?        @map("diet_preference")
  allergies      Json?
  householdSize  Int            @default(1) @map("household_size")
  pantryItems    PantryItem[]
  receipts       Receipt[]
  mealPlans      MealPlan[]
  shoppingLists  ShoppingList[]
  notifications  Notification[]
  deviceTokens   DeviceToken[]
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  @@map("users")
}

model PantryItem {
  id             String       @id @default(uuid())
  userId         String       @map("user_id")
  itemName       String       @map("item_name")
  normalizedName String       @map("normalized_name")
  category       String?
  quantity       Decimal?
  unit           String?
  expiryDate     DateTime?    @db.Date @map("expiry_date")
  source         PantrySource @default(manual)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  @@index([userId])
  @@index([normalizedName])
  @@map("pantry_items")
}

model Receipt {
  id               String                  @id @default(uuid())
  userId           String                  @map("user_id")
  imageUrl         String                  @map("image_url")
  ocrRawText       String?                 @map("ocr_raw_text")
  processingStatus ReceiptProcessingStatus @default(uploaded) @map("processing_status")
  errorMessage     String?                 @map("error_message")
  user             User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  items            ReceiptItem[]
  createdAt        DateTime                @default(now()) @map("created_at")
  updatedAt        DateTime                @updatedAt @map("updated_at")

  @@index([userId])
  @@map("receipts")
}

model ReceiptItem {
  id              String    @id @default(uuid())
  receiptId       String    @map("receipt_id")
  itemName        String    @map("item_name")
  normalizedName  String?   @map("normalized_name")
  quantity        Decimal?
  unit            String?
  category        String?
  confidenceScore Decimal?  @map("confidence_score")
  isConfirmed     Boolean   @default(false) @map("is_confirmed")
  receipt         Receipt   @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  createdAt       DateTime  @default(now()) @map("created_at")

  @@index([receiptId])
  @@map("receipt_items")
}

model Recipe {
  id                String      @id @default(uuid())
  externalId        String?     @map("external_id")
  source            RecipeSource
  title             String
  description       String?
  ingredients       Json
  instructions      String
  cookingTimeMin    Int?        @map("cooking_time_minutes")
  difficultyLevel   String?     @map("difficulty_level")
  imageUrl          String?     @map("image_url")
  nutritionData     Json?       @map("nutrition_data")
  mealPlans         MealPlan[]
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")

  @@map("recipes")
}

model RecipeCache {
  id              String   @id @default(uuid())
  ingredientHash  String   @unique @map("ingredient_hash")
  responsePayload Json     @map("response_payload")
  source          String
  expiresAt       DateTime @map("expires_at")
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([ingredientHash])
  @@map("recipe_cache")
}

model MealPlan {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  planDate   DateTime @db.Date @map("plan_date")
  mealType   MealType @map("meal_type")
  recipeId   String   @map("recipe_id")
  servings   Int      @default(1)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe     Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([userId, planDate])
  @@map("meal_plans")
}

model ShoppingList {
  id         String             @id @default(uuid())
  userId     String             @map("user_id")
  title      String             @default("Default Shopping List")
  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  items      ShoppingListItem[]
  createdAt  DateTime           @default(now()) @map("created_at")
  updatedAt  DateTime           @updatedAt @map("updated_at")

  @@index([userId])
  @@map("shopping_lists")
}

model ShoppingListItem {
  id             String       @id @default(uuid())
  shoppingListId String       @map("shopping_list_id")
  itemName       String       @map("item_name")
  normalizedName String?      @map("normalized_name")
  quantity       Decimal?
  unit           String?
  category       String?
  isPurchased    Boolean      @default(false) @map("is_purchased")
  shoppingList   ShoppingList @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  @@index([shoppingListId])
  @@map("shopping_list_items")
}

model Notification {
  id         String           @id @default(uuid())
  userId     String           @map("user_id")
  type       NotificationType
  title      String
  message    String
  isRead     Boolean          @default(false) @map("is_read")
  sentAt     DateTime?        @map("sent_at")
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime         @default(now()) @map("created_at")

  @@index([userId, isRead])
  @@map("notifications")
}

model DeviceToken {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  fcmToken   String   @unique @map("fcm_token")
  platform   String?
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("device_tokens")
}
```

---

## 9. Gemini Integration Design

## 9.1 Why Gemini is a good fit

This backend can use Gemini effectively for:

* OCR cleanup and structure extraction
* recipe generation
* ingredient substitution
* meal planning
* data normalization suggestions

## 9.2 Recommended usage

Use Gemini for **structured generation only**, not free-form unstable output.

### Example receipt-cleaning prompt

```text
You are a grocery receipt parser.
Convert the following OCR text into valid JSON.
Each item must contain:
item_name, normalized_name, quantity, unit, category, confidence_score.
Only return valid JSON array.

OCR TEXT:
1% MLK 2L
EGGS LG 12CT
BNS SPNCH
```

### Example recipe prompt

```text
Generate 5 simple home-cooking recipes using these pantry ingredients:
eggs, spinach, rice, onion.

Return valid JSON array with:
title, ingredients, instructions, cooking_time_minutes, difficulty_level.
```

## 9.3 Gemini safety rules

* always request strict JSON output
* validate response with schema before saving
* retry once if invalid JSON
* use fallback parsing rules if AI output fails

---

## 10. OCR + AI Receipt Pipeline

### Pipeline steps

1. Upload image
2. Store file in object storage
3. Create receipt row
4. Queue job in BullMQ
5. Worker sends image to Google Vision
6. Save raw OCR text in database
7. Send OCR text to Gemini for cleanup
8. Parse and validate Gemini JSON output
9. Store structured items in `receipt_items`
10. Mark receipt complete

### Why this design is strong

* Google Vision handles text extraction
* Gemini handles semantic cleanup
* queue protects API latency
* user confirmation prevents accidental pantry pollution

---

## 11. API Design

## 11.1 Auth APIs

### `POST /api/auth/sync-user`

Creates or syncs application user after Firebase authentication.

### `GET /api/auth/profile`

Returns authenticated user profile.

### `PUT /api/auth/profile`

Updates profile fields such as diet preference, allergies, and household size.

---

## 11.2 Pantry APIs

### `GET /api/pantry`

Returns pantry items for authenticated user.

### `POST /api/pantry`

Adds a pantry item.

### `PUT /api/pantry/:id`

Updates pantry item quantity, unit, or expiry.

### `DELETE /api/pantry/:id`

Deletes pantry item.

### `GET /api/pantry/expiring`

Returns expiring items.

---

## 11.3 Receipt APIs

### `POST /api/receipts/upload`

Uploads receipt image and creates receipt record.

### `POST /api/receipts/:id/process`

Queues OCR + Gemini parsing.

### `GET /api/receipts/:id`

Returns processing status and parsed items.

### `POST /api/receipts/:id/confirm`

Confirms selected parsed items and inserts them into pantry.

---

## 11.4 Recipe APIs

### `GET /api/recipes/pantry`

Returns recipe suggestions based on pantry.

### `GET /api/recipes/search?q=`

Searches recipe provider or cache.

### `POST /api/recipes/ai`

Generates Gemini-based recipes.

### `POST /api/recipes/substitute`

Returns ingredient substitution suggestions.

---

## 11.5 Meal Plan APIs

### `POST /api/meal-plans/generate`

Generates a weekly meal plan.

### `GET /api/meal-plans`

Returns meal plans in a date range.

### `PUT /api/meal-plans/:id`

Updates a meal plan entry.

### `DELETE /api/meal-plans/:id`

Deletes a meal plan entry.

---

## 11.6 Shopping List APIs

### `GET /api/shopping-lists`

Returns shopping lists.

### `POST /api/shopping-lists`

Creates a shopping list.

### `GET /api/shopping-lists/:id/items`

Returns shopping list items.

### `POST /api/shopping-lists/:id/items`

Adds item to shopping list.

### `PUT /api/shopping-lists/items/:itemId`

Updates purchase state or quantity.

### `DELETE /api/shopping-lists/items/:itemId`

Deletes shopping list item.

---

## 11.7 Notification APIs

### `GET /api/notifications`

Returns user notifications.

### `PUT /api/notifications/:id/read`

Marks a single notification as read.

### `PUT /api/notifications/read-all`

Marks all notifications as read.

### `POST /api/notifications/device-token`

Registers or updates FCM device token.

---

## 12. Example API Contracts

## 12.1 Add pantry item request

```json
{
  "item_name": "Eggs",
  "quantity": 12,
  "unit": "pieces",
  "category": "Dairy & Eggs",
  "expiry_date": "2026-03-20"
}
```

## 12.2 Pantry response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "item_name": "Eggs",
    "normalized_name": "egg",
    "quantity": 12,
    "unit": "pieces",
    "category": "Dairy & Eggs",
    "expiry_date": "2026-03-20"
  }
}
```

## 12.3 Receipt confirm request

```json
{
  "items": [
    {
      "receipt_item_id": "uuid-1",
      "expiry_date": "2026-03-18"
    },
    {
      "receipt_item_id": "uuid-2",
      "expiry_date": "2026-03-22"
    }
  ]
}
```

---

## 13. Caching Strategy

## 13.1 Redis usage

Use Redis for:

* recipe result caching
* Gemini output caching
* Spoonacular response caching
* rate-limiting keys
* short-lived job state if needed

## 13.2 Cache key design

Example recipe key pattern:
`recipes:<ingredient_hash>`

Where ingredient hash is built from:

1. normalize ingredient names
2. deduplicate
3. sort alphabetically
4. hash final string

### Example

`eggs|rice|spinach` -> SHA256 hash

## 13.3 Cache TTL suggestions

* recipe suggestions: 24 hours
* substitutions: 24 hours
* meal plans: 12 hours
* OCR cleanup result: 7 days

---

## 14. Background Jobs

## 14.1 Expiry Alert Job

**Schedule:** every day at 8:00 AM

### Logic

* find pantry items expiring within 2 days
* group by user
* create notifications
* send FCM alerts

## 14.2 Receipt Processor Job

**Trigger:** on receipt upload

### Logic

* fetch file URL
* run Google Vision OCR
* send OCR text to Gemini
* validate JSON structure
* store parsed items

## 14.3 Meal Reminder Job

**Optional schedule-based worker**

* notify users for planned meals
* send at configured meal reminder times

---

## 15. Security Design

### Identity security

* Firebase handles authentication
* backend verifies Firebase ID tokens only
* no password storage in backend database

### API security

* helmet middleware
* CORS allowlist
* rate limiting
* request validation with Zod or Joi
* centralized auth middleware

### Upload security

* only images allowed
* max upload size limit
* malware scanning can be added later
* private bucket by default

### Data security

* HTTPS only in production
* environment-based secret management
* do not log raw auth tokens

---

## 16. Error Handling Standard

### Error response format

```json
{
  "success": false,
  "message": "Invalid pantry item data",
  "error_code": "VALIDATION_ERROR"
}
```

### Recommended error codes

* `AUTH_ERROR`
* `VALIDATION_ERROR`
* `NOT_FOUND`
* `FORBIDDEN`
* `EXTERNAL_API_ERROR`
* `RATE_LIMIT_ERROR`
* `INTERNAL_SERVER_ERROR`

---

## 17. Recommended Folder Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── pantry/
│   │   │   ├── pantry.controller.js
│   │   │   ├── pantry.service.js
│   │   │   ├── pantry.routes.js
│   │   │   └── pantry.validation.js
│   │   ├── receipt/
│   │   │   ├── receipt.controller.js
│   │   │   ├── receipt.service.js
│   │   │   ├── receipt.routes.js
│   │   │   ├── receipt.validation.js
│   │   │   └── receipt.worker.js
│   │   ├── recipe/
│   │   │   ├── recipe.controller.js
│   │   │   ├── recipe.service.js
│   │   │   ├── gemini.service.js
│   │   │   └── recipe.routes.js
│   │   ├── meal-plan/
│   │   │   ├── mealPlan.controller.js
│   │   │   ├── mealPlan.service.js
│   │   │   └── mealPlan.routes.js
│   │   ├── shopping-list/
│   │   │   ├── shoppingList.controller.js
│   │   │   ├── shoppingList.service.js
│   │   │   └── shoppingList.routes.js
│   │   └── notification/
│   │       ├── notification.service.js
│   │       └── notification.routes.js
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── jobs/
│   │   │   ├── expiryAlert.job.js
│   │   │   ├── mealReminder.job.js
│   │   │   └── receiptProcessor.job.js
│   │   ├── queues/
│   │   │   └── receipt.queue.js
│   │   ├── utils/
│   │   │   ├── normalizeIngredient.js
│   │   │   ├── hashIngredients.js
│   │   │   └── expiryCalculator.js
│   │   └── constants/
│   │       └── enums.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── firebase.js
│   │   ├── redis.js
│   │   ├── storage.js
│   │   ├── gemini.js
│   │   └── vision.js
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
├── .env
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 18. Environment Variables

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=kathir@123
DB_NAME=flavorspark

DB_PORT=5432
REDIS_URL=redis://localhost:6379

GEMINI_API_KEY=AIzaSyCBbN0EYTdCa3lLCVkqsAuo3zBifqKvacM
GOOGLE_APPLICATION_CREDENTIALS=./flovarspark-5cb211e5d677.json
SPOONACULAR_API_KEY=8c95f44179074a29ad4504f2ac75b441



FIREBASE_PROJECT_ID=flovarspark
FIREBASE_CLIENT_EMAIL=flovar-spark-services@flovarspark.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"

```

---

## 19. Investor-Ready Strengths

### Data Integrity

Using `normalized_name` directly addresses the food-data fragmentation problem. This makes pantry matching, recipe generation, and shopping automation more reliable.

### Operational Efficiency

Using BullMQ for OCR and Gemini processing prevents server blocking and supports scalable async workloads.

### Cost Control

Redis and recipe cache tables prevent repeated Gemini calls for similar ingredient sets, improving margins.

### Security

Using Firebase for identity and PostgreSQL for app-specific profiles follows a standard secure architecture pattern.

### Scalability

The modular monolith design gives a low-risk path from MVP to larger-scale service extraction.

---

## 20. Final Recommendation

This backend specification is suitable for:

* engineering handoff
* startup technical documentation
* MVP architecture planning
* investor discussions about technical defensibility

For implementation, the next files to create should be:

1. `schema.prisma`
2. `src/app.js`
3. `src/server.js`
4. auth middleware
5. pantry module
6. receipt worker with Gemini + Vision pipeline
7. Redis cache layer
8. expiry alert job
I can also show you the exact Gemini prompt system used by food-tech apps to convert receipt OCR → clean grocery items. It’s one of the core AI features of your project