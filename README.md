# Insignia Task Scheduler Frontend

A modern, responsive frontend application for the Insignia Task Scheduler built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Dashboard with summary cards and execution charts
- Task management (create, view, edit, delete)
- Task execution logs with filtering and pagination
- Responsive design that works on mobile, tablet, and desktop
- Dark mode support
- Form validation with real-time feedback
- Loading states and skeleton loaders
- Toast notifications for user feedback

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom built with Headless UI
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Prerequisites

- Node.js 16.14 or later
- npm, yarn, or pnpm
- Docker (optional, for containerized deployment)

## Getting Started

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd insignia-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   NEXT_PUBLIC_API_TOKEN=your-super-secret-token-here
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Docker Setup

1. Ensure Docker is installed on your system.

2. Build and run the application with Docker:
   ```bash
   docker build -t insignia-fe .
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:8000 -e NEXT_PUBLIC_API_TOKEN=your-super-secret-token-here insignia-fe
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000).

### Docker Compose Setup

1. Ensure Docker Compose is installed on your system.

2. Run the application with Docker Compose:
   ```bash
   docker-compose up
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000).

4. To stop the service:
   ```bash
   docker-compose down
   ```

**Note**: The backend service should be running separately at `http://localhost:8000`.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── dashboard/       # Dashboard page
│   ├── tasks/           # Task management pages
│   ├── logs/            # Task logs page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable UI components
│   ├── context/         # React context providers
│   ├── layout/          # Layout components
│   └── ui/              # UI components (buttons, cards, etc.)
├── services/            # API service files
├── types/               # TypeScript interfaces and types
└── utils/               # Utility functions
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint to check for code issues

## Environment Variables

- `NEXT_PUBLIC_API_TOKEN` - Bearer token for API authentication
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for the backend API

## Development

### Adding New Pages

1. Create a new directory in `src/app/` for your page
2. Create a `page.tsx` file with your page content
3. The route will automatically be available based on the directory structure

### Creating New Components

1. Create a new file in `src/components/ui/` for reusable UI components
2. Create a new file in `src/components/layout/` for layout components
3. Export your component and import it where needed

### Adding New API Services

1. Create a new service file in `src/services/`
2. Import the `api` instance from `src/services/api.ts`
3. Implement your API calls using the axios instance

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

## Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.