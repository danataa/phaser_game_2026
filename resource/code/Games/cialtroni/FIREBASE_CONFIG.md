# Firebase Environment Configuration

## Setup

The Firebase configuration has been moved to environment variables for security.


### Create your project on Firebase https://console.firebase.google.com/

create your project
Add Anonymous Autentication
Add Realtime Database
Add the following database rules
{
  "rules": {
      "scores-cialtroni": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}



### Steps to setup:

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Update the `.env` file with your actual Firebase credentials (already done if using existing project)

3. The `.env` file is already configured in `.gitignore` and will NOT be committed to the repository

### Files:
- **`.env`** - Contains actual Firebase credentials (not committed)
- **`.env.example`** - Template file with placeholder values (committed to repo)
- **`src/config/firebase.config.ts`** - Configuration loader that reads from environment variables
- **`src/scenes/LeaderBoard.ts`** - Updated to import config from the config file

### Environment Variables:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

### Build Process:
The webpack configuration (`webpack/webpack.common.js`) uses `dotenv` to load environment variables and injects them into the build using webpack's `DefinePlugin`.
