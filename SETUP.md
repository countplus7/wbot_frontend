# Frontend Setup Guide

This guide helps you set up and run the frontend application that connects to the WhatsApp AI Bot API backend.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend root directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
```

**Note:** Make sure your backend is running on port 8000 before starting the frontend.

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:8080` (or the port shown in your terminal).

## 🔌 Backend Connection

### Prerequisites

1. **Backend must be running** on `http://localhost:8000`
2. **Database must be initialized** with `npm run init-db` in the backend
3. **Environment variables** must be configured in the backend

### Backend Setup Commands

```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run init-db
npm run migrate-db
npm run dev
```

## 🎯 Features

The frontend provides a complete business management interface:

- **Business Management**: Create, edit, and delete businesses
- **WhatsApp Configuration**: Set up WhatsApp Business API credentials
- **AI Tone Management**: Configure custom AI response personalities
- **Real-time Updates**: Automatic data synchronization with the backend
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/           # React components
│   └── business/        # Business management components
├── hooks/               # React Query hooks
├── lib/                 # API client and services
├── config/              # Environment configuration
└── types/               # TypeScript type definitions
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running and CORS is configured
2. **API Connection Failed**: Check if backend is running on port 8000
3. **Database Errors**: Run `npm run init-db` in the backend
4. **Environment Variables**: Verify `.env` file exists and is configured

### Debug Mode

Enable debug logging in your browser console:

```javascript
localStorage.setItem('debug', 'true');
```

## 🚀 Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

For production, set:

```bash
VITE_API_URL=https://your-backend-domain.com
```

### Deploy

The built files in `dist/` can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## 📚 API Documentation

For complete API documentation, see `../backend/API_DOCUMENTATION.md`

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify backend is running and accessible
3. Check network tab for API request failures
4. Ensure all environment variables are set correctly 