# Overview

This is a full-stack timeshare marketplace web application called "TailoredTimeshareSolutions.com" built with React, Express, and PostgreSQL. The application allows users to browse resorts, search for timeshare rentals, view detailed resort information, and manage bookings. It features a modern UI built with shadcn/ui components and Tailwind CSS, providing a comprehensive platform for timeshare owners and travelers to connect.

# User Preferences

Preferred communication style: Simple, everyday language.

## Branding
- Logo: Custom "Tailored Timeshare Solutions" logo with TS monogram in circular design
- Location: /client/src/assets/logo.jpg
- Usage: Integrated in header navigation with CSS filters for proper contrast

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for home, resort details, search results, and authentication
- **State Management**: TanStack Query for server state management and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with organized route handlers
- **Data Layer**: Drizzle ORM with type-safe database operations
- **Storage**: In-memory storage implementation with interface for easy database switching
- **Development**: Vite middleware integration for hot module replacement

## Database Schema
- **Users**: Authentication and profile management with username, email, and personal information
- **Resorts**: Resort listings with location, amenities, ratings, and pricing information
- **Reviews**: User reviews and ratings for resorts
- **Bookings**: Reservation management with check-in/out dates and pricing
- **Listings**: Property owner rental listings

## Authentication & Authorization
- Session-based authentication structure prepared for implementation
- Form validation using Zod schemas for secure data handling
- User registration and login UI components ready for backend integration

## Development Environment
- **Hot Reload**: Vite development server with React Fast Refresh
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Quality**: ESLint and TypeScript compiler checks
- **Path Mapping**: Organized imports with @ aliases for clean code structure

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migration and schema management tools

## UI & Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant styling utility
- **lucide-react**: Icon library for consistent iconography

## State Management & Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers for Zod integration

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type system for JavaScript
- **@replit/vite-plugin-runtime-error-modal**: Development error handling for Replit environment
- **wouter**: Minimalist routing library for React

## Additional Libraries
- **date-fns**: Date manipulation and formatting utilities
- **zod**: Runtime type validation and schema definition
- **embla-carousel-react**: Carousel component for image galleries
- **cmdk**: Command palette component for search interfaces