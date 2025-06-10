# Peashoot

A web application for gardeners!

## Project Structure

```
packages/
├── client/     # Frontend application (Svelte + TailwindCSS)
├── server/     # Backend server (Node.js + TypeScript)
└── types/      # Shared TypeScript type definitions
```

Each package is independently versioned and can be developed, tested, and deployed separately while sharing common code and types.

## Installation

1. Ensure you have the required tools:
   - Node.js (v18 or later)
   - npm (v9 or later)

2. Clone and install:
```bash
git clone https://github.com/mike-north/peashoot.git
cd peashoot
npm install
```

## Development Tasks

### Development Server
```bash
npm run dev
```
Starts both client and server in development mode with hot reloading:
- Client: Development server with hot module replacement
- Server: TypeScript compilation in watch mode

### Build
```bash
npm run build
```
Compiles all packages:
- Client: Bundles the frontend application
- Server: Compiles TypeScript to JavaScript
- Types: Generates type definitions

### Testing
```bash
npm run test        # Run all tests once
npm run test:watch  # Run tests in watch mode
```
Executes test suites for all packages in parallel.

### Code Quality
```bash
npm run lint   # Run ESLint on all packages
npm run format # Format code with Prettier
```
- Linting: Enforces code style and catches potential issues
- Formatting: Ensures consistent code style across the project

## Technology Stack

- TypeScript
- Node.js
- Svelte
- TailwindCSS
- DaisyUI
- ESLint
- Prettier

# Legal
(c) 2025 Mike Works, Inc. All rights reserved