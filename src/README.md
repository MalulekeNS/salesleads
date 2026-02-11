# LeadsHub React Frontend

This is the React frontend source code for LeadsHub.

## Structure

- `pages/` - Page components (Index, Auth, Dashboard, NotFound)
- `components/` - Reusable UI components
  - `ui/` - Base UI components (Button, Input, etc.)
  - `leads/` - Lead management components
  - `layout/` - Layout components (Header)
  - `chat/` - ChatBot component
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `lib/` - Utility functions
- `integrations/` - External service integrations
- `assets/` - Static assets (images, fonts)

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Run development server: `npm run dev`

## Note

The `components/ui/` folder should contain all shadcn/ui components.
Copy them from the original project or install via shadcn CLI.
