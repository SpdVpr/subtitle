# Debugging Progress Tracking Issues

## Problem Diagnosis

The user reports that progress tracking shows only the beginning and end, without showing the detailed research phases. This suggests either:

1. **Mock Translation Mode**: System is using demo/mock translation instead of real AI
2. **Missing Progress Updates**: Real-time progress tracking is not working
3. **API Key Issues**: OpenAI API key not properly configured

## Diagnostic Steps

### 1. Check API Key Status (Development Only)

Visit: `http://localhost:3000/api/debug-env`

This will show:
- Whether OpenAI API key exists
- Key length and format validation
- Preview of key (first 10 characters)

### 2. Test Premium Translation (Development Only)

Visit: `http://localhost:3000/api/test-premium`

This will:
- Run a complete premium translation test
- Show all progress phases
- Display API key status
- Return translated results

### 3. Check Browser Console

When using Premium Context AI service, look for:

**Expected Logs (Real AI Mode):**
```
🎬 Premium Research-Based AI Translation started: X subtitles
🔑 API Key check: sk-proj-Yg... 
🔑 API Key length: 164
🔑 API Key starts with sk-: true
📁 PHASE 1: Analyzing filename
🔍 PHASE 2: Conducting research
🤖 Querying OpenAI for show research...
🤖 OpenAI research query completed
📊 PHASE 3: Analyzing content
🌐 PHASE 4: Starting contextual translation
✨ PHASE 5: Finalizing translation
✅ Premium Research-Based AI Translation completed
```

**Mock Mode Logs:**
```
🎬 Premium Research-Based AI Translation started: X subtitles
🔑 API Key check: NO KEY (or demo_key)
🎭 Using mock translation - API key not valid
🎭 Reason: No API key (or other reason)
🎭 DEMO MODE: Simulating research-based translation process
```

### 4. Check Network Tab

Look for these requests:
- `POST /api/translate` - Initial translation request
- `GET /api/translate-progress?sessionId=...` - Server-Sent Events stream

## Common Issues & Solutions

### Issue 1: API Key Not Set on Vercel

**Symptoms:**
- Always shows mock translation
- Console shows "NO KEY" or "demo_key"

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your actual OpenAI API key
3. Redeploy the application

### Issue 2: Progress Tracking Not Working

**Symptoms:**
- Shows phases but jumps immediately to completion
- No Server-Sent Events in Network tab

**Solution:**
1. Check if `sessionId` is being generated and passed correctly
2. Verify Server-Sent Events endpoint is accessible
3. Check browser console for EventSource errors

### Issue 3: Real Translation But No Progress

**Symptoms:**
- Translation works but no detailed progress shown
- Console shows real API calls but no phase updates

**Solution:**
1. Verify `progressCallback` is being called in translation service
2. Check if `updateTranslationProgress` function is working
3. Ensure progress store is properly updated

## Testing Scenarios

### Scenario 1: Demo Mode (Expected Behavior)

**File:** `Naruto.S01E01.srt`
**Expected Progress:**
1. 🚀 Initializing (0%) - "Starting translation process..."
2. 📁 Analyzing File (10%) - "Analyzing filename 'Naruto.S01E01.srt'..."
3. 🔍 Researching Content (30%) - "Researching 'Naruto' for contextual information..."
4. 📊 Analyzing Subtitles (50%) - "Analyzing subtitle content and themes..."
5. 🌐 Translating (80%) - "Translating with contextual awareness..."
6. ✨ Finalizing (95%) - "Finalizing translation and quality checks..."
7. ✅ Completed (100%) - "Translation completed successfully!"

**Duration:** ~6 seconds with realistic delays

### Scenario 2: Real AI Mode (With Valid API Key)

**File:** `Wednesday.S01E01.srt`
**Expected Progress:**
- Same phases as demo mode
- Real OpenAI API calls for research
- Actual contextual translation
- Longer processing time (10-30 seconds)

## Troubleshooting Commands

### Check Environment Variables (Local)
```bash
# In project root
cat .env.local | grep OPENAI_API_KEY
```

### Test API Key Validity
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}],"max_tokens":5}' \
     https://api.openai.com/v1/chat/completions
```

### Monitor Server-Sent Events
```javascript
// In browser console
const eventSource = new EventSource('/api/translate-progress?sessionId=test123');
eventSource.onmessage = (event) => console.log('SSE:', JSON.parse(event.data));
eventSource.onerror = (error) => console.error('SSE Error:', error);
```

## Expected Behavior Summary

### With Valid API Key:
- ✅ Real AI research about the show/movie
- ✅ Contextual translation with character names preserved
- ✅ Detailed progress through all 6 phases
- ✅ Realistic processing time (10-30 seconds)

### Without Valid API Key (Demo Mode):
- ✅ Simulated research phases with realistic timing
- ✅ Mock contextual translation with show-specific examples
- ✅ All 6 progress phases displayed
- ✅ Faster processing time (~6 seconds)

### Current Issue (What User Sees):
- ❌ Only start and end phases visible
- ❌ No detailed research or translation phases
- ❌ Immediate jump to completion
- ❌ No contextual improvements in translation
