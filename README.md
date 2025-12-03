eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxlYXJzaSIsInN1YiI6OSwiaXNfYWRtaW4iOjEsImlhdCI6MTc2NDcxMzA1NSwiZXhwIjoxNzY0Nzk5NDU1fQ.xYiwKYYfVghM0AzKNo1nS3NuQjC1_LNncXYcsgZnrDA
# IAprovei API

Educational platform API built with NestJS and TypeScript.

## Features

- User authentication and authorization
- Contest and question management
- AI-powered answer correction and explanation
- Real-time assistance sessions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- MySQL database
- OpenAI API

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - Database connection details
   - JWT secret
   - OpenAI API key

4. Run database migrations:
```bash
pnpm run migration:run
```

5. Start the development server:
```bash
pnpm run start:dev
```

## API Endpoints

### AI Assistant

- `POST /ai-assistant/correct-answer` - Get AI-powered correction and explanation for student answers

## Architecture

The application follows SOLID principles with:

- **Single Responsibility**: Each service has a focused responsibility
- **Open/Closed**: Services are extensible through interfaces
- **Liskov Substitution**: AI providers can be substituted
- **Interface Segregation**: Focused interfaces for specific capabilities
- **Dependency Inversion**: Services depend on abstractions, not implementations

LUCAS MIGUEL SCHMIDT