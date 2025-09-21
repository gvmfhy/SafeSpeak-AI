# Healthcare Translation App

## Overview

This is a healthcare translation application designed to provide culturally intelligent translation services for medical communication. The app features a multi-step workflow that includes translation, back-translation for quality assurance, and audio generation. It's built as a full-stack TypeScript application with a React frontend and Express.js backend, specifically designed for healthcare professionals to communicate effectively with patients across language barriers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with a custom healthcare-focused design system
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for client-side routing
- **Theme System**: Custom light/dark mode implementation with CSS variables

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES modules throughout the application
- **API Design**: RESTful endpoints for translation, back-translation, and audio generation
- **Request Validation**: Zod schemas for type-safe API validation
- **Session Management**: In-memory storage with extensible interface for future database integration

### Translation Workflow
- **Step 1**: Smart translation with cultural intelligence using Anthropic's Claude
- **Step 2**: Independent back-translation for quality assurance
- **Step 3**: Audio generation for pronunciation assistance
- **Refinement**: User feedback loop for translation improvements

### Design System
- **Reference**: Apple-inspired design following healthcare professional standards
- **Color Palette**: Medical blue and trust green with comprehensive light/dark mode support
- **Typography**: Inter and Source Sans Pro font families
- **Spacing**: Consistent Tailwind spacing units (2, 4, 6, 8, 12, 16)
- **Components**: Healthcare-specific components like step indicators, translation cards, and patient preset selectors

### Data Storage
- **Current**: In-memory storage for user data and sessions
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Extensible**: Interface-based storage design allows easy transition to persistent storage

## External Dependencies

### AI Services
- **Anthropic Claude**: Primary translation engine using the latest claude-sonnet-4-20250514 model for culturally intelligent translations
- **ElevenLabs**: Text-to-speech API for multi-language audio generation with voice mapping for different languages

### Database
- **Neon Database**: PostgreSQL serverless database (configured but not actively used)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Connection**: Environment variable based configuration (DATABASE_URL)

### UI Libraries
- **Radix UI**: Headless component primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom healthcare theme
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant system for maintainable styling

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Production bundling for the backend
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Authentication & Session Management
- **Connect PG Simple**: PostgreSQL session store (configured for future use)
- **Custom Session**: Memory-based session management with user interface abstraction