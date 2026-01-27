
# Aelgo World

Aelgo World is a comprehensive, Phase-1 E-Learning Web Application designed to deliver a premium educational experience. It features distinct portals for Students, Instructors, and Administrators, facilitating a complete lifecycle of online education from course creation to certification.

## Key Functionality

### 🎓 Student Portal
*   **Dashboard:** Personalized learning hub with progress tracking, streaks, and gamified XP stats.
*   **Course Player:** A versatile content renderer supporting:
    *   **Video Lessons:** Seamless playback with progress tracking.
    *   **Reading Materials:** Embedded PDF and document viewers.
    *   **Podcasts:** Audio-only learning mode with persistent playback controls.
    *   **Interactive Coding:** Built-in Python environment (Jupyter-compatible) running directly in the browser via WebAssembly for real-time code practice and data science simulations.
    *   **Quizzes:** Timed assessments with automated scoring.
*   **Certificates:** Generate and download verifyable certificates upon course completion.

### 👩‍🏫 Instructor & Admin Portal
*   **Analytics Dashboard:** Detailed visualizations of revenue, enrollment trends, and student activity.
*   **Course Builder:** Robust tools to create courses, upload thumbnails, manage modules, and organize lessons.
*   **User Management:** Administrative tables to manage student access, instructor profiles, and team permissions (RBAC).
*   **Billing & Finance:**
    *   Transaction history and invoice generation (PDF).
    *   Offline payment approval workflows.
    *   Payment request generation.
*   **Platform Settings:**
    *   **Theming:** Customize brand colors, gradients, and fonts.
    *   **Localization:** Currency configuration.

## Technical Highlights

*   **Frontend:** Built with React, utilizing functional components and hooks.
*   **Styling:** Responsive design implemented with Tailwind CSS.
*   **State Management:** Context API for authentication and theme management.
*   **Performance:** Python code execution via WebAssembly (Pyodide) allows for client-side data processing without heavy backend infrastructure.
*   **Animations:** Smooth transitions and interactions powered by Framer Motion.
*   **Backend Agnostic:** Currently configured with a mock API layer for demonstration, with a structured architecture to integrate Supabase for production persistence.

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/aelgo-world.git
    cd aelgo-world
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## Configuration

### Database (Optional)
The application runs in **Mock Mode** by default, allowing full feature exploration without backend setup. To persist data:

1.  Set up a Supabase project.
2.  Execute the SQL scripts found in `supabase/schema.sql` and `supabase/seeds.sql`.
3.  Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

### Customization
Navigate to **Admin > Settings > Appearance** to modify the platform's color scheme, fonts, and layout scaling dynamically.

## License

This project is proprietary software. All rights reserved.
