# VidyaAI — Test Evidence

## Manual Test Cases Executed

| Test | Input | Expected | Result |
|------|-------|----------|--------|
| L1 Explanation | topic: "recursion" | Indian analogy, <150 words | ✅ Pass |
| L2 Trigger | quiz score: 0/2 | Deeper explanation loads | ✅ Pass |
| Quiz Generation | Any explanation | 2 MCQs, valid JSON | ✅ Pass |
| Auth Guard | No token on /api/explain | 401 Unauthorized | ✅ Pass |
| Mastery Update | Correct quiz answer | Firestore updates in real time | ✅ Pass |
| Embed Cold Cache | First /api/embed call | <2s response | ✅ Pass |
| Embed Warm Cache | Second /api/embed call | <500ms response | ✅ Pass |

## Security Tests
| Test | Result |
|------|--------|
| API route without auth token | 401 returned ✅ |
| No hardcoded keys in source | Verified ✅ |
| Secrets via env vars only | Verified ✅ |
