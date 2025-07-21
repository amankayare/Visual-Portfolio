# Visual Portfolio

A modern, responsive portfolio website with an admin dashboard for content management. Built with React, TypeScript, Vite, and Flask.

## 🌟 Features

### Frontend (React + TypeScript + Vite)
- **Modern UI/UX**
  - Responsive design that works on all devices
  - Dark/Light mode support
  - Smooth animations and transitions
  - Accessible components

- **Sections**
  - Hero section with animated introduction
  - About section with skills and experience
  - Projects showcase with filtering
  - Blog section with markdown support
  - Certifications display
  - Contact form with validation

- **Admin Dashboard**
  - Secure authentication
  - User management (admin/user roles)
  - Content management (CRUD operations)
  - Message center for contact form submissions
  - Statistics and analytics

### Backend (Python + Flask)
- **RESTful API**
  - JWT Authentication
  - Rate limiting
  - CORS support
  - Request validation

- **Database Models**
  - Users & Authentication
  - Projects
  - Blog Posts
  - Certifications
  - Contact Messages
  - Skills & Experience

- **File Handling**
  - Image uploads
  - File storage (local/S3 compatible)
  - Secure file serving

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom built with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Routing**: wouter
- **Icons**: Lucide Icons
- **Animation**: Framer Motion
- **Code Quality**: ESLint, Prettier

### Backend
- **Framework**: Flask
- **Database**: SQLAlchemy ORM (PostgreSQL/SQLite)
- **Authentication**: JWT
- **API Documentation**: Flasgger (Swagger)
- **Validation**: Marshmallow
- **File Handling**: Flask-Uploads
- **Security**: Flask-CORS, Flask-Talisman

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (for production)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/visual-portfolio.git
   cd visual-portfolio
   ```

2. **Set up the backend**
   ```bash
   cd server/VisualPortfolioServer
   python -m venv venv
   # On Windows: venv\Scripts\activate
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../..
   cd client
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Frontend
   VITE_API_BASE_URL=http://localhost:5000
   
   # Backend
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   DATABASE_URL=sqlite:///portfolio.db
   JWT_SECRET_KEY=your-jwt-secret
   ```

5. **Run the application**
   - Start the backend:
     ```bash
     cd server/VisualPortfolioServer
     flask run
     ```
   - Start the frontend (in a new terminal):
     ```bash
     cd client
     npm run dev
     ```

## 📚 Project Structure

```
visual-portfolio/
├── client/                    # Frontend React application
│   ├── public/               # Static files
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page components
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utility functions
│       ├── App.tsx           # Main App component
│       └── main.tsx          # Entry point
│
├── server/                   # Backend Flask application
│   └── VisualPortfolioServer/
│       ├── app/              # Application package
│       │   ├── models/       # Database models
│       │   ├── routes/       # API routes
│       │   ├── schemas/      # Marshmallow schemas
│       │   ├── static/       # Static files
│       │   └── templates/    # Email templates
│       ├── tests/            # Test files
│       ├── app.py            # Application factory
│       └── config.py         # Configuration
│
├── .gitignore
├── README.md
└── package.json
```

## 🔒 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (admin/user)
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured to allow requests only from trusted origins
- **Rate Limiting**: Implemented on authentication endpoints
- **Security Headers**: Added for enhanced security

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm test
```

### Backend Tests
```bash
cd server/VisualPortfolioServer
pytest
```

## 🚀 Deployment

### Frontend
1. Build the production bundle:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend
1. Set up a PostgreSQL database
2. Update environment variables:
   ```env
   FLASK_ENV=production
   DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
   SECRET_KEY=your-production-secret
   JWT_SECRET_KEY=your-jwt-secret
   ```
3. Deploy to your preferred platform (Render, Railway, Heroku, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📬 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/visual-portfolio](https://github.com/yourusername/visual-portfolio)
