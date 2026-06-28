# Next.js Development Troubleshooting Guide

## Common Issues and Solutions

### 1. Turbopack Cache Corruption Errors

**Symptoms:**
- `ENOENT: no such file or directory, open '.next/server/app/*/app-build-manifest.json'`
- `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`
- Pages failing to load with cache-related errors

**Solution:**
```bash
# Quick fix - clear all caches
./clear-cache.sh

# Then restart with stable mode
npm run dev
```

### 2. Profile Fetch Timeout

**Symptoms:**
- `Profile fetch timeout` errors
- Infinite loading on profile pages
- Auth context not loading

**Solution:**
1. Check browser console for detailed logs
2. Verify Supabase connection: `curl -X GET http://localhost:3000/api/auth/health`
3. Clear caches and restart without Turbopack

### 3. Authentication Issues

**Check Points:**
- Environment variables are properly set
- Supabase connection is working
- User session exists

**Debug Commands:**
```bash
# Test auth health
curl -X GET http://localhost:3000/api/auth/health

# Test auth debug (shows session status)
curl -X GET http://localhost:3000/api/auth/debug
```

### 4. Development Server Scripts

**Available Scripts:**
- `npm run dev` - Standard Next.js (stable, recommended)
- `npm run dev:turbo` - With Turbopack (faster but cache issues)
- `npm run dev:safe` - Same as `npm run dev`

**Recommended Development Workflow:**
1. Use `npm run dev` by default
2. If you encounter cache issues, run `./clear-cache.sh`
3. Only use `npm run dev:turbo` if you need faster compilation and can handle cache issues

### 5. When All Else Fails

**Nuclear Reset:**
```bash
# Stop all processes
pkill -f "next"

# Clear everything
./clear-cache.sh

# Reinstall dependencies (if needed)
rm -rf node_modules
npm install

# Start fresh
npm run dev
```

## Prevention Tips

1. **Avoid Turbopack in production-like environments**
2. **Regularly clear caches** during heavy development
3. **Use the stable development server** for important work
4. **Keep the clear-cache.sh script handy**
5. **Monitor console logs** for early warning signs

## Development Environment Status

- **Port 3000**: Standard development server
- **Cache clearing**: `./clear-cache.sh` script available
- **Error handling**: Enhanced with timeouts and fallbacks
- **Profile system**: Full CRUD operations with new schema fields
