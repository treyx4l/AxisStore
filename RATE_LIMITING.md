# Rate Limiting System Documentation

## Overview

This application implements a comprehensive, multi-layered rate limiting system to prevent abuse, DDoS attacks, and ensure fair resource usage. The system uses a sliding window algorithm with per-operation limits and violation tracking.

## Features

### 1. **Sliding Window Algorithm**
- Tracks requests within a time window
- Automatically expires old requests
- Provides accurate rate limiting without fixed intervals

### 2. **Per-Operation Limits**
Different operations have different rate limits based on their criticality:

#### Critical Operations (Very Strict)
- **Order Creation**: 3 requests per minute
  - Penalty: 5 minutes after violation
  - User-specific tracking
  
#### Admin Operations (Moderate)
- **Product Create**: 5 requests per minute (3 min penalty)
- **Product Update**: 10 requests per minute
- **Product Delete**: 5 requests per minute
- **Banner Create**: 5 requests per minute
- **Banner Update**: 10 requests per minute
- **Banner Delete**: 5 requests per minute
- **Settings Update**: 5 requests per minute
- **Tracking Update**: 10 requests per minute

#### User Operations (Moderate)
- **Cart Add**: 20 requests per minute
- **Cart Update**: 30 requests per minute
- **Cart Clear**: 10 requests per minute

#### Read Operations (High Limits)
- **Search Query**: 30 requests per minute
- **Products Read**: 100 requests per minute
- **Orders Read**: 50 requests per minute

### 3. **Violation Tracking & Penalties**
- Tracks violation count per operation
- Implements exponential backoff on repeated violations
- Penalty periods prevent immediate retry after violations
- Automatic cleanup of expired violations

### 4. **User-Specific Tracking**
- Rate limits can be tracked per user ID
- Prevents single user from exhausting shared limits
- Enables fair resource distribution

### 5. **Automatic Cleanup**
- Removes old request records (24+ hours)
- Cleans expired violation records
- Runs every 5 minutes to prevent storage bloat

## Implementation

### Rate Limiter Service (`src/utils/rateLimiter.ts`)

The core rate limiting logic is in a singleton service:

```typescript
import { rateLimiter } from '../utils/rateLimiter'

// Check if operation is allowed
const check = rateLimiter.checkLimit('order:create', userId)
if (!check.allowed) {
  throw new Error(`Rate limit exceeded. Retry after ${check.retryAfter} seconds.`)
}

// Record successful request
rateLimiter.recordRequest('order:create', userId)
```

### Integration Points

Rate limiting is integrated into:

1. **Product Operations** (`src/services/rtdbService.ts`)
   - `productsService.create()`
   - `productsService.update()`
   - `productsService.delete()`

2. **Order Operations** (`src/services/rtdbService.ts`)
   - `ordersService.create()` - Very strict (3/min)
   - `ordersService.updateStatus()`

3. **Banner Operations** (`src/services/rtdbService.ts`)
   - `bannersService.create()`
   - `bannersService.update()`
   - `bannersService.delete()`

4. **Cart Operations** (`src/context/CartContext.tsx`)
   - `addToCart()`
   - `updateQuantity()`
   - `clearCart()`

5. **Search Operations** (`src/pages/SearchPage.tsx`)
   - Search query filtering

6. **Admin Operations** (`src/services/rtdbService.ts`)
   - `storeSettingsService.update()`
   - `ordersService.updateTracking()`

## Error Handling

When rate limits are exceeded, the system throws errors with:
- `error.code = 'RATE_LIMIT_EXCEEDED'`
- `error.retryAfter` - seconds until retry is allowed
- `error.resetAt` - timestamp when limit resets

Components should catch these errors and display user-friendly messages:

```typescript
try {
  await ordersService.create(order)
} catch (error: any) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    showNotification(
      `Too many requests. Please wait ${error.retryAfter} seconds before trying again.`,
      'warning'
    )
  }
}
```

## Security Features

### 1. **Client-Side Enforcement**
- Immediate feedback to users
- Prevents unnecessary API calls
- Reduces server load

### 2. **Server-Side Validation** (Recommended)
For production, consider adding server-side rate limiting:
- Firebase Cloud Functions with rate limiting
- API Gateway rate limiting
- Firebase App Check for bot protection

### 3. **Storage Security**
- Rate limit data stored in localStorage (client-side)
- No sensitive data exposed
- Automatic cleanup prevents storage exhaustion

## Configuration

Rate limits can be adjusted in `src/utils/rateLimiter.ts`:

```typescript
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'order:create': {
    maxRequests: 3,        // Adjust limit
    windowMs: 60000,       // Adjust window (1 minute)
    violationPenaltyMs: 300000, // Adjust penalty (5 minutes)
  },
  // ... other operations
}
```

## Monitoring

The system logs violations to console:
```
Rate limit violation recorded: rate_violation_order:create_<userId>
```

For production, consider:
- Sending violation logs to monitoring service
- Tracking violation patterns
- Alerting on excessive violations

## Best Practices

1. **User Feedback**: Always show clear error messages when rate limits are hit
2. **Retry Logic**: Use `retryAfter` value to implement smart retry
3. **Graceful Degradation**: Return empty results instead of errors for read operations
4. **Monitoring**: Track violation rates to identify abuse patterns
5. **Adjustment**: Monitor and adjust limits based on actual usage patterns

## Future Enhancements

1. **IP-Based Rate Limiting**: Track by IP address for unauthenticated users
2. **Distributed Rate Limiting**: Use Redis or similar for multi-instance deployments
3. **Dynamic Limits**: Adjust limits based on user tier or subscription
4. **Rate Limit Headers**: Include rate limit info in API responses
5. **Admin Dashboard**: UI to view and adjust rate limits

