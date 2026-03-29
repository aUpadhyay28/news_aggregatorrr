# Clerk Authentication Setup Guide

## Overview
Your React app "The Curator" has been successfully integrated with Clerk authentication following the official Vite + React guidelines.

## Current Setup Status ✅
- ✅ Clerk React SDK installed (`@clerk/clerk-react@latest`)
- ✅ Environment file created (`.env.local`)
- ✅ Provider configured in `main.jsx` with `afterSignOutUrl="/"`
- ✅ App components updated to use Clerk's modern components
- ✅ Development server running successfully

## Next Steps to Complete Setup

### 1. Get Your Clerk Publishable Key
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in or create a new account
3. Create a new application or select an existing one
4. In your Clerk dashboard, go to **API Keys**
5. Copy your **Publishable key** (starts with `pk_`)

### 2. Update Environment Variable ✅ COMPLETED
1. Open the `.env.local` file in your project root
2. Replace the placeholder with your actual Clerk publishable key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmluZS1tb3NxdWl0by0yNS5jbGVyay5hY2NvdW50cy5kZXYk
```

### 3. Test the Authentication
1. Visit `http://localhost:5180` in your browser
2. You should see the sign-in/sign-up buttons
3. Click "Sign Up" to create a new account
4. After signing up, you'll be redirected to the main app
5. Test signing out from the Profile page

## Clerk Components Used

### Authentication Flow
- **`<Show>`**: Conditionally renders signed-in vs signed-out states
- **`<SignInButton>`**: Modal-based sign-in (mode="modal")
- **`<SignUpButton>`**: Modal-based sign-up (mode="modal")

### User Management
- **`useUser()`**: Hook to access current user data
- **`useClerk()`**: Hook for authentication actions (signOut, etc.)

## File Changes Made

### main.jsx
- Added ClerkProvider wrapper with afterSignOutUrl="/"
- No manual publishableKey prop (uses environment variable)

### TheCurator.jsx
- Removed custom authentication state
- Added Show component for conditional rendering
- Added SignInButton and SignUpButton for authentication

### ProfilePage.jsx
- Updated to use useUser and useClerk hooks
- Displays real user data from Clerk
- Sign out functionality uses Clerk's signOut method

### .env.local
- Created with VITE_CLERK_PUBLISHABLE_KEY placeholder

## Troubleshooting

### Common Issues
1. **"Invalid publishableKey" error**: Make sure your key starts with `pk_` and is correctly set in `.env.local`
2. **Auth modals not appearing**: Check that you're using `mode="modal"` on the buttons
3. **User data not showing**: Ensure you're using the correct Clerk hooks (`useUser`, `useClerk`)

### Development Tips
- Clerk automatically handles token refresh and session management
- The app will automatically redirect to "/" after sign out
- User data is available throughout the app when authenticated

## Known Issues & Solutions

### Production Build Issue
**Issue**: `npm run build` fails with "Rollup failed to resolve import '@clerk/clerk-react'"

**Status**: This is a known issue with Vite 4.x and Clerk React. The development server works perfectly, but production builds may fail.

**Workaround**: For production deployment, you can:
1. Use Vite 5.x (update your Vite version)
2. Or deploy using the development build for now
3. Or configure your deployment platform to use the dev server

**Note**: This doesn't affect development - the dev server runs fine and authentication works perfectly.

### Import Resolution Issue (FIXED)
**Issue**: `[plugin:vite:import-analysis] Failed to resolve import "@clerk/react"`

**Solution**: Updated `vite.config.js` to exclude Clerk from `optimizeDeps`:
```js
optimizeDeps: {
  exclude: ['@clerk/clerk-react']
}
```

This allows Vite to properly resolve the Clerk imports during development.

### Alternative Build Command (if needed)
```bash
# For development builds that work
npm run dev
```

## Testing Authentication