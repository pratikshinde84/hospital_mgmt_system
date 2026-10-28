# Hospital Management System (Medicore)

## Project Overview
Medicore is a full‑stack hospital management web application built with **React**, **TypeScript**, and **Vite**. It provides patient‑facing pages for browsing doctors, viewing health tips, and managing appointments, as well as administrative interfaces for hospitals.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with custom dark‑mode support
- **Build Tool**: Vite (fast dev server, HMR)
- **Package Manager**: npm
- **Testing**: (if any) – placeholder for Jest/React Testing Library
- **Version Control**: Git

## Features
- Doctor directory with search and specialization filters
- Hospital information display
- Health tips carousel with icons
- Appointment scheduling UI
- Dynamic greeting based on user name
- Responsive design for desktop and mobile

## Installation
```bash
# Clone the repository
git clone <repo-url>
cd medicore

# Install dependencies
npm install

# Run the development server
npm run dev
```
The app will be available at `http://localhost:5173`.

## Usage
1. Open the app in a browser.
2. Navigate to **Patient Doctors** to browse doctors.
3. Use the search bar or specialization filter to find a doctor.
4. Click **Book** to schedule an appointment (demo navigation).
5. Visit **Patient Dashboard** for health tips and personalized greeting.

## Data Flow
- **Static Data**: JSON files or mock services (`doctorService`, `authService`) provide doctor and hospital data.
- **Components** fetch data via `useMemo` hooks, filter it locally, and render UI.
- **User Interaction** updates component state (search, filter) which triggers re‑render.
- **Routing** is handled by `react-router-dom` to switch between pages.

## Architecture
```
src/
├─ components/          # Reusable UI components (EmptyState, etc.)
├─ pages/               # Page‑level components (PatientDoctors, PatientDashboard, ...)
├─ services/            # Data fetching abstractions (doctorService, authService)
├─ types/               # TypeScript type definitions
├─ lib/                 # Utility libraries (motion, etc.)
└─ App.tsx              # Root component with routing
```
Each page imports services to retrieve data, uses React state/hooks for interactivity, and applies Tailwind classes for styling.

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Make your changes and ensure the app still builds.
4. Submit a pull request.

## License
MIT License – see `LICENSE` file.