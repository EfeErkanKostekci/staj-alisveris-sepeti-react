# Frontend Agent Rules (Alisveris Sepeti React)

This file contains behavioral constraints, styling guidelines, and coding standards for the React Frontend of the Alisveris Sepeti project.

## Tech Stack & Data Fetching
- **Framework:** React 19 + Vite.
- **API Client Generation:** The project uses `orval` to auto-generate Axios clients and React Query hooks from the backend OpenAPI/Swagger definition.
- **Rule:** Do NOT manually write Axios fetching logic or manual `useEffect` fetches. Instead, update the backend, run `npm run generate` (Orval), and use the generated `@tanstack/react-query` hooks.

## Styling & UI/UX (CRITICAL)
- **Vanilla CSS:** Use Vanilla CSS for styling. Do not introduce TailwindCSS or other utility-first frameworks unless explicitly requested by the user.
- **Premium Aesthetics:** Prioritize visual excellence. Use modern design trends: vibrant colors, dark modes, glassmorphism, smooth gradients, and subtle micro-animations on hover/interaction. 
- **Typography:** Use modern web fonts (e.g., Inter, Roboto) rather than browser defaults.
- **Avoid Generic Designs:** Ensure the UI feels premium and dynamic, not like a basic MVP.

## Component Architecture
- **Functional Components:** Use functional components and React Hooks exclusively.
- **Separation of Concerns:** Keep components small, reusable, and focused on a single responsibility.
- **Folder Structure:** Organize files by feature or domain (e.g., `src/features/products`, `src/features/admin`) to maintain scalability in the monorepo architecture.

## Code Quality
- **Linting & Formatting:** Ensure code complies with ESLint and Prettier (`npm run lint`, `npm run format`).
- **Clean Code:** Use descriptive variable names, avoid deeply nested ternaries, and write self-documenting code.
