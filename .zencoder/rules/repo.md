---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
USCOR is a monorepo project built with Turborepo, containing a Next.js frontend application and a NestJS backend API. The project appears to be an e-commerce/marketplace platform with features for businesses and clients, including product management, freelance services, chat functionality, and payment processing.

## Repository Structure
- **apps/**: Contains the main applications
  - **front-ui/**: Next.js frontend application
  - **back-api/**: NestJS backend API

## Projects

### front-ui (Next.js Application)
**Configuration File**: package.json, next.config.js

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.x
**Framework**: Next.js 15.3.0
**Package Manager**: npm 10.9.2

#### Dependencies
**Main Dependencies**:
- React 19.0.0
- Next.js 15.3.0
- @apollo/client 3.13.9
- graphql 16.11.0
- @tanstack/react-query 5.84.1
- zustand 5.0.7
- zod 3.25.76

#### Build & Installation
```bash
npm install
npm run build
npm run dev # for development
npm run start # for production
```

#### Testing
No specific testing framework configuration found in the front-ui project.

### back-api (NestJS Application)
**Configuration File**: package.json, nest-cli.json

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.7.3
**Framework**: NestJS 11.0.1
**Package Manager**: npm 10.9.2
**Database**: PostgreSQL with Prisma ORM

#### Dependencies
**Main Dependencies**:
- @nestjs/core 11.0.1
- @nestjs/graphql 13.0.4
- @apollo/server 4.12.0
- @prisma/client 6.12.0
- graphql 16.10.0
- passport 0.7.0
- argon2 0.41.1

#### Build & Installation
```bash
npm install
npx prisma generate --no-engine
npm run build
npm run dev # for development
npm run start:prod # for production
```

#### Docker
**Docker Compose**: docker-compose.yml
**Configuration**: Sets up a PostgreSQL database for development
```yaml
services:
  dev-db:
    image: postgres:14
    ports:
      - 5434:5432
    environment:
      POSTGRES_USER: uscor
      POSTGRES_PASSWORD: uscor_pwd
      POSTGRES_DB: uscor_db
```

#### Testing
**Framework**: Jest
**Test Location**: /test and /src/**/*.spec.ts
**Naming Convention**: *.spec.ts for unit tests, *.e2e-spec.ts for e2e tests
**Run Command**:
```bash
npm run test # unit tests
npm run test:e2e # end-to-end tests
npm run test:cov # coverage
```