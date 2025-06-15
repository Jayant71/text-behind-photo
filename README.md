<!-- filepath: /home/jayant/work/photo-text-fusion-lab/README.md -->
# Text Behind Photo

Text Behind Photo is a web application that allows users to upload an image, automatically segment a person from the background, and then creatively place text layers behind or in front of the segmented person.

## Key Features

*   **Image Upload & Processing**: Upload your photos and the application will automatically detect and segment the person from the background.
*   **Text Layering**: Add multiple text layers to your image.
*   **Text Customization**:
    *   Modify text content.
    *   Adjust font family, size, and color.
    *   Control text alignment (left, center, right).
    *   Set opacity and rotation.
    *   Position text precisely using X/Y coordinates.
    *   Resize text block dimensions (width/height).
*   **Layer Management**:
    *   Easily select and manage different text layers.
    *   Control the stacking order (zIndex) of text layers.
    *   Toggle whether text appears behind or in front of the segmented person.
*   **Interactive Canvas**: See your changes in real-time on an interactive canvas.
*   **Theme Support**: Switch between light and dark themes for comfortable viewing.
*   **Responsive Design**: UI panels are resizable for optimal workflow on different screen sizes.

## Technologies Used

*   **Frontend**:
    *   [Vite](https://vitejs.dev/) - Next generation frontend tooling
    *   [React](https://reactjs.org/) - A JavaScript library for building user interfaces
    *   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale
    *   [Shadcn/UI](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
    *   [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
    *   [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) - For robust form validation
    *   [TanStack Query (React Query)](https://tanstack.com/query/latest) - For server state management
    *   [React Router DOM](https://reactrouter.com/) - For client-side routing
*   **Development Tools**:
    *   ESLint
    *   Prettier (assumed, common with this stack)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn (or bun, as `bun.lockb` is present)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Jayant71/text-behind-photo.git
    cd text-behind-photo
    ```
2.  Install dependencies:
    ```bash
    # Using npm
    npm install

    # Or using yarn
    yarn install

    # Or using bun
    bun install
    ```

### Environment Variables

The application requires an API endpoint for image segmentation. Create a `.env` file in the root of the project and add the following variable:

```env
VITE_SEGMENT_API_ENDPOINT=your_segmentation_api_endpoint_here
```

Replace `your_segmentation_api_endpoint_here` with the actual URL of your image segmentation service.

### Running the Application

To start the development server:

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev

# Or using bun
bun dev
```

The application will typically be available at `http://localhost:8080` or a similar address indicated in your terminal.

## Available Scripts

In the project directory, you can run the following scripts:

*   `npm run dev` or `bun dev`: Runs the app in development mode.
*   `npm run build` or `bun build`: Builds the app for production to the `dist` folder.
*   `npm run build:dev` or `bun run build:dev`: Builds the app for development mode (likely with more debugging information).
*   `npm run lint` or `bun lint`: Lints the codebase using ESLint.
*   `npm run preview` or `bun preview`: Serves the production build locally for preview.

## Project Structure Overview

```
/
├── public/             # Static assets
├── src/
│   ├── components/     # React components (UI elements, specific features like Canvas, TextEditor)
│   │   └── ui/         # Shadcn/UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page-level components (e.g., Index, NotFound)
│   ├── App.tsx         # Main application component, routing setup
│   ├── main.tsx        # Entry point of the application
│   └── index.css       # Global styles
├── package.json        # Project metadata and dependencies
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

