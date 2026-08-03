# Vinay Joshi - Full-Stack Developer Portfolio

Welcome to the source code for my personal portfolio! This project showcases my skills, experience, and the applications I have built. It is designed to be highly interactive, fast, and fully responsive, offering a modern user experience with a clean aesthetic.

## 🚀 Live Demo
You can view the live portfolio here: **[Your Vercel Link Here]**

## ✨ Key Features
- **Dynamic Projects Showcase**: Detailed views of full-stack projects, complete with links to live demos, source code, and comprehensive feature descriptions.
- **Interactive Tech Stack**: A visual representation of my skills separated by Frontend, Backend, Tools, and current studying interests.
- **Experience Timeline**: A clean timeline layout detailing my internships and software development journey.
- **Modern UI/UX**: Built with seamless micro-animations, a custom preloader, magnetic buttons, and custom cursors for an engaging feel.
- **Headless CMS Capability (Optional)**: Features an integrated admin dashboard that allows for dynamic CRUD operations on projects, experiences, and the tech stack when connected to MongoDB.
- **Fully Responsive**: Carefully designed to look great on desktop, tablet, and mobile devices.

## 🛠️ Tech Stack
This portfolio is built using modern web technologies:
- **Framework**: [Next.js](https://nextjs.org/) (React framework for production)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: GSAP & Framer Motion
- **Language**: TypeScript
- **Backend APIs**: Hono.js (via Next.js API Routes)
- **Database (Optional)**: MongoDB via Mongoose
- **Deployment**: Vercel

## 💻 Getting Started (Local Development)

If you'd like to run this project locally, follow the steps below:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/VinayJoshi16/vinay-portfolio.git
   cd vinay-portfolio
   ```

2. Install the dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: The `--legacy-peer-deps` flag is required to bypass a React 19 / React 18 peer dependency conflict with `react-animated-cursor`)*

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables
By default, the application runs perfectly using static fallback data. If you want to enable the `/admin` dashboard and connect it to a real database, create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=86400
JWT_ACCESS_EXPIRES_IN=3600
```

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ by Vinay Joshi*
