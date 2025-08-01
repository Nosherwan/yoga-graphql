# Yoga GraphQL Server

[![Yoga Server](https://img.shields.io/badge/Yoga-Server-blue?logo=graphql)](https://the-guild.dev/graphql/yoga-server)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)](https://www.postgresql.org/)
[![Knex](https://img.shields.io/badge/Knex.js-QueryBuilder-orange?logo=knex)](https://knexjs.org/)
[![Mailgun](https://img.shields.io/badge/Mailgun-Email-red?logo=mailgun)](https://www.mailgun.com/)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?logo=node.js)](https://nodejs.org/)

A GraphQL server implementation using Yoga Server with TypeScript, PostgreSQL.

## Features

- User authentication & authorization
- JWT-based session management with refresh tokens
- Cookie-based security implementation
- Email notifications using Mailgun
- PostgreSQL database integration using Knex
- Custom GraphQL scalar types
- Input validation and sanitization

## Prerequisites

- Node.js (v14+)
- PostgreSQL database
- Mailgun account for emails

## Environment Variables Required

Create a .env file with the following:

```
NODE_ENV=development
APP_PORT=4000
DB_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
COOKIE_DOMAIN=localhost
HASH_SECRET=your_hash_secret
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_mailgun_domain
CREATE_PASSWORD_URL=http://localhost:3000/create-password
USER_POOL_NAME=your_cognito_pool_name
USER_POOL_CLIENT_NAME=your_cognito_client_name
USER_POOL_CLIENT_ID=your_cognito_client_id
```

## NPM Commands

First, install dependencies:
```bash
npm install
```

Development:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Start production:
```bash
npm start
```

Type checking:
```bash
npm run type-check
```

## Project Structure

```
src/
├── dataApi/          # Database operations and data access layer
├── email/           # Email templates and email service
├── graphql/         # GraphQL schema, resolvers, and type definitions
├── lib/             # Core utilities and configurations
├── services/        # External services integration (Cognito, email)
├── typings/         # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

## API Endpoints

GraphQL endpoint: http://localhost:4000/graphql

## Development

1. Set up your PostgreSQL database
2. Configure environment variables
3. Run migrations (if any)
4. Start development server
5. Access GraphQL playground at http://localhost:4000/graphql

## Security Notes

- CSRF protection enabled
- Secure cookie implementation
- JWT token refresh mechanism
- Input sanitization
- Role-based access control

## Contributing

Please follow the existing code style and add appropriate tests for new features.
```

To get started quickly:

1. Clone the repository
2. Run `npm install`
3. Set up your .env file with required variables
4. Set up PostgreSQL database
5. Run `npm run dev`
6. Visit http://localhost:4000/graphql

The server should be up and running with GraphQL playground available for testing queries and mutations.


what is the purpose of storing the refresh_token in the database

Storing refresh tokens in the database serves several important security purposes:

1. **Token Revocation**:
```typescript
// Ability to invalidate specific refresh tokens
async function revokeRefreshToken(userId: number, tokenToRevoke: string) {
  const user = await dataApi.user.getUser({ id: userId });
  const updatedTokens = user.refresh_tokens.filter(token => token !== tokenToRevoke);

  await dataApi.user.updateUser({
    id: userId,
    user: { refresh_tokens: updatedTokens }
  });
}

// Revoke all tokens (force logout everywhere)
async function revokeAllRefreshTokens(userId: number) {
  await dataApi.user.updateUser({
    id: userId,
    user: { refresh_tokens: [] }
  });
}
```

2. **Session Management**:
```typescript
// Track active sessions
async function getActiveSessions(userId: number) {
  const user = await dataApi.user.getUser({ id: userId });
  return user.refresh_tokens.length; // Number of active sessions
}

// Limit concurrent sessions
async function enforceSessionLimit(userId: number, maxSessions: number) {
  const user = await dataApi.user.getUser({ id: userId });
  if (user.refresh_tokens.length >= maxSessions) {
    // Remove oldest token(s)
    user.refresh_tokens = user.refresh_tokens.slice(-maxSessions + 1);
    await dataApi.user.updateUser({
      id: userId,
      user: { refresh_tokens: user.refresh_tokens }
    });
  }
}
```

3. **Security Audit**:
```typescript
// Add timestamp and device info to tokens
interface EnhancedRefreshToken {
  token: string;
  createdAt: Date;
  deviceInfo: string;
  lastUsed: Date;
}

// Update token usage
async function updateTokenUsage(userId: number, token: string) {
  const user = await dataApi.user.getUser({ id: userId });
  const tokens = user.refresh_tokens.map(t =>
    t.token === token ? { ...t, lastUsed: new Date() } : t
  );

  await dataApi.user.updateUser({
    id: userId,
    user: { refresh_tokens: tokens }
  });
}
```

4. **Token Rotation**:
```typescript
async function rotateRefreshToken(oldToken: string) {
  const user = await dataApi.user.getUserByRefreshToken({ refreshToken: oldToken });
  if (!user) return null;

  // Generate new token
  const newToken = uuidv4();

  // Remove old token and add new one
  const tokens = user.refresh_tokens.filter(t => t !== oldToken);
  tokens.push(newToken);

  await dataApi.user.updateUser({
    id: user.id,
    user: { refresh_tokens: tokens }
  });

  return newToken;
}
```

5. **Security Breach Handling**:
```typescript
// Detect and handle suspicious activity
async function handleSecurityBreach(userId: number) {
  // Immediately invalidate all refresh tokens
  await dataApi.user.updateUser({
    id: userId,
    user: {
      refresh_tokens: [],
      securityLockout: true,
      lastSecurityEvent: new Date()
    }
  });

  // Notify user
  await sendSecurityAlert(userId);
}
```

6. **Token Cleanup**:
```typescript
// Periodic cleanup of unused tokens
async function cleanupOldTokens() {
  const users = await dataApi.user.getUsers({
    filter: [['refresh_tokens', '!=', '[]']]
  });

  for (const user of users.items) {
    // Filter out tokens older than X days
    const activeTokens = user.refresh_tokens.filter(token => {
      const tokenAge = Date.now() - token.createdAt;
      return tokenAge < (30 * 24 * 60 * 60 * 1000); // 30 days
    });

    if (activeTokens.length !== user.refresh_tokens.length) {
      await dataApi.user.updateUser({
        id: user.id,
        user: { refresh_tokens: activeTokens }
      });
    }
  }
}
```

Implementation Considerations:
```typescript
interface RefreshTokenRecord {
  token: string;
  createdAt: Date;
  lastUsed?: Date;
  deviceInfo?: string;
  ip?: string;
}

// When creating new token
const newToken: RefreshTokenRecord = {
  token: uuidv4(),
  createdAt: new Date(),
  deviceInfo: request.headers['user-agent'],
  ip: request.ip
};

// Store as JSON in database
const tokens = [...user.refresh_tokens, newToken];
await dataApi.user.updateUser({
  id: user.id,
  user: { refresh_tokens: tokens }
});
```

Benefits:
1. Ability to revoke access
2. Track active sessions
3. Implement security policies
4. Audit trail for security events
5. Token rotation for enhanced security
6. Protection against token theft

This approach provides:
- Better security control
- User session management
- Audit capabilities
- Breach response mechanisms
- Token lifecycle management
