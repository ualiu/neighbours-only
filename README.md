# Neighborhood Social Network

A hyper-local social network that connects neighbors based on their geographic location. Users can share updates, images, and connect with others in their immediate neighborhood.

## Features

- **OAuth Authentication**: Secure sign-up and login with Google
- **Automatic Neighborhood Assignment**: Users are automatically grouped by their address sublocality
- **Neighborhood Feed**: View posts from your neighbors in real-time
- **Image Sharing**: Upload and share images with your community
- **Member Directory**: See who's in your neighborhood
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Google OAuth 2.0)
- **View Engine**: EJS
- **File Upload**: Cloudinary
- **Styling**: Bootstrap 5
- **Session Management**: Express-session with MongoDB store

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

You'll also need accounts and API keys for:

- Google Cloud Platform (for OAuth and Places API)
- Cloudinary (for image uploads)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd super-karen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit the `.env` file with your credentials:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/neighborhood-app

SESSION_SECRET=your-session-secret-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

GOOGLE_PLACES_API_KEY=your-google-places-api-key

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized JavaScript origins: `http://localhost:3000`
6. Set authorized redirect URIs: `http://localhost:3000/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### 5. Configure Google Places API

1. In the same Google Cloud Console project
2. Enable the "Places API" and "Geocoding API"
3. Go to "Credentials" → "Create Credentials" → "API Key"
4. Copy the API key to your `.env` file as `GOOGLE_PLACES_API_KEY`

### 6. Configure Cloudinary

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

### 7. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 8. Run the Application

**Development mode** (with auto-restart):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
super-karen/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── passport.js           # Google OAuth strategy
│   └── cloudinary.js         # Cloudinary & multer config
├── models/
│   ├── User.js              # User schema
│   ├── Neighborhood.js      # Neighborhood schema
│   └── Post.js              # Post schema
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── neighborhoodController.js  # Neighborhood logic
│   └── postController.js    # Post logic
├── routes/
│   ├── authRoutes.js        # Auth routes
│   ├── neighborhoodRoutes.js  # Neighborhood routes
│   └── postRoutes.js        # Post routes
├── views/
│   ├── partials/
│   │   ├── header.ejs       # HTML head & navbar
│   │   ├── footer.ejs       # Footer & scripts
│   │   └── nav.ejs          # Navigation bar
│   ├── index.ejs            # Landing page
│   ├── signup-address.ejs   # Address entry form
│   ├── neighborhood.ejs     # Main feed
│   ├── create-post.ejs      # Create post form
│   ├── members.ejs          # Members list
│   ├── 404.ejs              # 404 error page
│   └── error.ejs            # Error page
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       └── main.js          # Client-side JavaScript
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── server.js                # Entry point
└── README.md                # This file
```

## Usage

### First Time Setup

1. Navigate to `http://localhost:3000`
2. Click "Sign Up with Google"
3. Authorize the application
4. Enter your address (with Google Places Autocomplete)
5. You'll be automatically assigned to your neighborhood
6. Start posting and connecting with neighbors!

### Creating Posts

1. Click "New Post" in the navigation
2. Write your message (max 2000 characters)
3. Optionally upload an image (max 5MB)
4. Click "Post" to share with your neighborhood

### Viewing Members

Click "Members" in the navigation to see all users in your neighborhood.

## API Endpoints

### Authentication

- `GET /` - Landing page
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/logout` - Logout user
- `GET /signup/address` - Address entry form
- `POST /signup/complete-profile` - Complete user profile

### Neighborhood

- `GET /neighborhood` - View neighborhood feed
- `GET /neighborhood/members` - View neighborhood members

### Posts

- `GET /posts/new` - Create post form
- `POST /posts/create` - Create new post
- `POST /posts/:id/delete` - Delete a post

## Deployment

### Deploy to Railway

1. Install Railway CLI:

```bash
npm install -g @railway/cli
```

2. Login to Railway:

```bash
railway login
```

3. Initialize project:

```bash
railway init
```

4. Add environment variables in Railway dashboard

5. Deploy:

```bash
railway up
```

### Environment Variables for Production

Make sure to set the following in your production environment:

- Set `NODE_ENV=production`
- Update `GOOGLE_CALLBACK_URL` to your production URL
- Use a strong `SESSION_SECRET`
- Use MongoDB Atlas or another cloud MongoDB service for `MONGODB_URI`

## Security Considerations

- Never commit your `.env` file
- Use strong session secrets
- Keep all API keys secure
- Use HTTPS in production
- Implement rate limiting for production use
- Add CSRF protection for forms
- Validate and sanitize all user inputs

## Future Enhancements

- [ ] Comments on posts
- [ ] Like/reaction functionality
- [ ] Real-time notifications
- [ ] Direct messaging between neighbors
- [ ] Event planning features
- [ ] Search functionality
- [ ] Admin moderation tools
- [ ] Report inappropriate content
- [ ] User profiles with bio
- [ ] Email notifications

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

### Google OAuth Errors

- Ensure redirect URIs match exactly in Google Console
- Check that Google+ API is enabled
- Verify Client ID and Secret are correct

### Cloudinary Upload Issues

- Check API credentials
- Verify file size is under 5MB
- Ensure file format is supported (JPG, PNG, GIF)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with Node.js and Express
- UI powered by Bootstrap 5
- Authentication via Passport.js
- Image hosting by Cloudinary
- Maps and geolocation by Google Maps Platform
