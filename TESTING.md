# VidyaAI — Test Evidence

## Manual Test Cases

| Test | Input | Expected | Result |
|------|-------|----------|--------|
| L1 Explanation | topic: "recursion" | Indian analogy, <150 words | ✅ Pass |
| L2 Trigger | quiz score: 0/2 | Deeper explanation loads | ✅ Pass |
| Quiz Generation | Any explanation | 2 MCQs, valid JSON | ✅ Pass |
| JSON Retry | Malformed Gemini output | Auto-retry, valid response | ✅ Pass |
| Auth Guard | No token on /api/explain | 401 Unauthorized | ✅ Pass |
| Mastery Update | Correct quiz answer | Firestore updates live | ✅ Pass |
| Embed Cold Cache | First /api/embed call | Related concepts returned | ✅ Pass |
| Embed Warm Cache | Second /api/embed call | <500ms response | ✅ Pass |
| Unauthorized domain | Cloud Run URL | Auth works after whitelist | ✅ Pass |

## Security Tests

| Test | Result |
|------|--------|
| API without auth token | 401 returned ✅ |
| No hardcoded keys in source | Verified ✅ |
| Secrets via Secret Manager | Verified ✅ |
| Firebase Auth on all routes | Verified ✅ |

## Automated Validation
- npx tsc --noEmit → 0 type errors ✅
- Zod schema validation on all env vars at startup ✅
- Zod schema validation on all API request bodies ✅
