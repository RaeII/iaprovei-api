# Study Trail Generation Models

This document describes the different question generation models available for study trails.

## Overview

Study trails now support two different generation models that determine how questions are selected and organized:

1. **Adaptive Model** (default) - The original model that generates stops dynamically based on user performance
2. **All Questions By Difficulty** - A new model that uses all available questions ordered by difficulty

## Generation Models

### 1. Adaptive Model (`adaptive`)

**Behavior:**
- Creates stops dynamically as the user progresses
- Selects questions based on user performance and difficulty strategy
- Adapts to user's skill level over time
- Creates a maximum of 5 stops by default
- Targets 10 questions per stop
- Avoids repeating questions within the same trail

**Use Case:**
- Best for personalized learning experiences
- Ideal when you want to adapt to user performance
- Suitable when you have a large question pool

**Example:**
```json
{
  "skill_category_id": 1,
  "name": "Trilha Adaptativa de Matemática",
  "generation_model": "adaptive"
}
```

### 2. All Questions By Difficulty (`all_questions_by_difficulty`)

**Behavior:**
- Fetches ALL questions for the skill category at once
- Orders questions by difficulty level: easy → medium → hard
- Splits questions into stops with a maximum of 7 questions per stop
- Creates all stops upfront (no dynamic creation)
- Number of stops is determined by total questions available
- Provides a complete, structured learning path

**Calculation:**
- Total Stops = ceil(Total Questions / 7)
- Examples:
  - 20 questions → 3 stops (7, 7, 6)
  - 15 questions → 3 stops (7, 7, 1)
  - 50 questions → 8 stops (7 questions each, with 1 in the last stop)

**Use Case:**
- Best for comprehensive coverage of a topic
- Ideal when you want a predictable, complete learning path
- Suitable for exam preparation where all topics must be covered
- Great for smaller question pools where you want to use all questions

**Example:**
```json
{
  "skill_category_id": 1,
  "name": "Trilha Completa de Matemática",
  "generation_model": "all_questions_by_difficulty"
}
```

## API Usage

### Creating a Study Trail

**Endpoint:** `POST /study-trails`

**Request Body:**
```json
{
  "skill_category_id": 1,
  "name": "My Study Trail",
  "description": "Optional description",
  "generation_model": "all_questions_by_difficulty"  // optional, defaults to "adaptive"
}
```

### Response

The response includes the `generation_model` field:

```json
{
  "id": 123,
  "skill_category_id": 1,
  "skill_category_name": "Matemática",
  "name": "My Study Trail",
  "status": "active",
  "generation_model": "all_questions_by_difficulty",
  "current_stop_position": 1,
  "total_stops": 5,
  "completion_percentage": 0,
  "total_xp_earned": 0,
  "average_performance": 0,
  "created_at": "2024-10-22T10:00:00.000Z",
  "updated_at": "2024-10-22T10:00:00.000Z"
}
```

## Technical Implementation

### Database Schema

The `study_trails` table now includes a `generation_model` column:

```sql
ALTER TABLE `study_trails` 
ADD `generation_model` enum ('adaptive', 'all_questions_by_difficulty') 
NOT NULL DEFAULT 'adaptive';
```

### Migration

To apply this change to your database, run:

```bash
npm run migration:run
```

Or in production:

```bash
NODE_ENV=production npm run migration:run
```

### Service Methods

#### `createAllStopsByDifficulty(trailId, skillCategoryId)`

This private method is called when creating a trail with the `all_questions_by_difficulty` model:

1. Fetches all active questions for the skill category (optimized: only selects needed fields)
2. Orders them by difficulty level (ASC) and then by ID (ASC)
3. Splits them into chunks of maximum 7 questions
4. Creates all stops and assigns questions to each stop
5. Determines the primary difficulty level for each stop based on the most common difficulty among its questions

**Performance Optimizations:**
- Uses bulk insert operations instead of individual saves
- Queries only necessary fields (id, difficulty_level) to reduce data transfer
- Prepares all data in memory before database operations
- Uses chunked bulk inserts (500 records at a time) to handle large datasets
- Reduces database roundtrips from O(n) to O(1) + O(questions/500)

#### `generateStudyTrailsForDesiredCourse(userId)`

Auto-generates trails for a user's desired course:

**Performance Optimizations:**
- Checks existing trails in a single query using `IN` operator
- Creates all trails in parallel using `Promise.all()`
- Filters categories before creation to avoid unnecessary operations
- Includes error handling to prevent one failed trail from blocking others

### Performance Characteristics

For a course with 10 skill categories, each with 100 questions:

**Before Optimization:**
- Sequential trail creation: ~5+ minutes
- Database operations: 1,000+ individual queries
- Each trail waits for previous to complete

**After Optimization:**
- Parallel trail creation: ~15-30 seconds
- Database operations: ~50-100 queries total
- All trails created simultaneously
- Bulk inserts handle large datasets efficiently

## Comparison

| Feature | Adaptive | All Questions By Difficulty |
|---------|----------|----------------------------|
| Stop Creation | Dynamic (as user progresses) | All at once (upfront) |
| Question Selection | Based on performance | All questions ordered by difficulty |
| Max Questions Per Stop | 10 | 7 |
| Max Stops | 5 | Unlimited (based on questions) |
| Question Ordering | Mixed based on strategy | Strictly by difficulty |
| Use Case | Personalized learning | Complete coverage |
| Predictability | Lower (adapts to user) | Higher (fixed structure) |

## Auto-Generated Study Trails

When using the auto-generate feature (`generateStudyTrailsForDesiredCourse`), the system automatically uses the `all_questions_by_difficulty` generation model. This ensures that:

- All available questions for each skill category are included
- Users get a complete, structured learning path for their desired course
- Progress through topics is predictable and comprehensive

**API Endpoint:** `POST /study-trails/generate-for-desired-course`

This endpoint analyzes the user's desired course and automatically creates trails for relevant skill categories using the `all_questions_by_difficulty` model.

## Best Practices

1. **Choose the right model:**
   - Use `adaptive` for ongoing learning and skill development
   - Use `all_questions_by_difficulty` for comprehensive reviews and exam preparation
   - Auto-generated trails always use `all_questions_by_difficulty`

2. **Question pool size:**
   - `adaptive` works well with any pool size
   - `all_questions_by_difficulty` is best when you have a reasonable number of questions (not too few, not too many)

3. **User experience:**
   - `adaptive` provides a more dynamic experience
   - `all_questions_by_difficulty` provides a clearer roadmap of progress

4. **Content coverage:**
   - `adaptive` may not cover all questions
   - `all_questions_by_difficulty` guarantees all questions are included

## Migration Guide

If you have existing trails, they will continue to work with the `adaptive` model (default). No action is required for existing trails.

To migrate existing trails to the new model, you would need to:
1. Mark the old trail as completed or paused
2. Create a new trail with the desired generation model

## Future Enhancements

Potential future improvements could include:

- Custom question limits per stop for `all_questions_by_difficulty` model
- Hybrid models that combine aspects of both approaches
- User preference settings for default generation model
- Analytics to compare effectiveness of different models

