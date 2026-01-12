# InsightsAgent Integration Tests

## Overview

Integration tests for the InsightsAgent adapter that makes REAL API calls to OpenAI. These tests verify the complete integration chain from input DTOs through the Vercel AI SDK to OpenAI's API and back.

## Prerequisites

### Required Environment Variables

```bash
export OPENAI_API_KEY=sk-proj-...
```

Get your API key from: https://platform.openai.com/api-keys

### Verification

Before running tests, verify the API key is set:

```bash
echo $OPENAI_API_KEY
```

If not set, the tests will FAIL with a helpful error message explaining how to obtain and set the key.

## Running Tests

### Run All Integration Tests

```bash
npm test -- test/integration/agents/insights
```

### Run Specific Test

```bash
npm test -- test/integration/agents/insights/insights.integration.spec.ts
```

### Run with Coverage

```bash
npm test -- --coverage test/integration/agents/insights
```

## Test Structure

### Test Categories

1. **Single Entry Tests** - Verify basic functionality with one headache entry
2. **Multiple Entry Tests** - Verify pattern analysis across multiple entries
3. **Options Tests** - Verify maxTokens and temperature options are respected
4. **Edge Case Tests** - Verify handling of minimal and complete data
5. **Response Validation** - Verify output structure matches InsightsOutput interface
6. **Metadata Tracking** - Verify token usage and processing time are tracked

### Test Count

- Total Tests: 15
- All tests make REAL API calls (no mocks)
- All tests verify against actual OpenAI responses

## What Is Tested

### Interface Compliance

Every test verifies the response matches the `InsightsOutput` interface:

```typescript
interface InsightsOutput {
  summary: string;
  patterns: string[];
  recommendations: string[];
  confidence: number; // 0-1
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}
```

### Prompt Handling

Tests verify that:
- Headache entry data is correctly formatted in prompts
- Check-in correlation data is included
- Location, triggers, and notes are properly handled
- Context parameter affects AI responses

### Response Quality

Tests verify that:
- Summary is non-empty and meaningful
- Patterns array contains specific insights
- Recommendations are actionable
- Confidence scores are realistic (0-1 range)
- Metadata includes token usage and processing time

### Options Handling

Tests verify that:
- `maxTokens` limits response length
- `temperature` affects response determinism
- Options are properly passed to OpenAI API

### Edge Cases

Tests verify that:
- Minimal data (just intensity) still generates insights
- Complete data (all optional fields) produces detailed insights
- Multiple entries enable pattern recognition
- Confidence varies based on data quantity

## What Is NOT Tested

These are better suited for unit tests with mocks:

- **Rate limit handling** - Hard to trigger reliably in integration tests
- **Timeout handling** - Hard to trigger reliably
- **Network errors** - Requires simulated network failures
- **Invalid API key** - Would fail all tests immediately

## Test Timeouts

Integration tests have longer timeouts due to real API calls:

- Default timeout: **30 seconds** per test
- Reason: OpenAI API can take 5-15 seconds to respond
- If tests timeout, check network connection and API status

## Cost Considerations

Each test run makes **15 real API calls** to OpenAI.

Estimated cost per test run:
- Model: gpt-4o-mini
- Average tokens per call: ~500-1000
- Cost: ~$0.01-0.02 per full test run

**Recommendation:** Run integration tests selectively, not on every code change.

## Test Infrastructure

### Jest Configuration

- **Test Environment:** Node.js (required for Vercel AI SDK)
- **TypeScript:** Supported via next/jest
- **Module Mapping:** `@/` alias maps to `src/`

### Key Files

- `test/integration/agents/insights/insights.integration.spec.ts` - Test implementation
- `src/interface-adapters/agents/vercel-ai/insights.agent.ts` - Agent implementation
- `src/usecases/generate-ai-insights/interfaces/insights-agent.interface.ts` - Interface definition
- `jest.config.js` - Jest configuration (Node environment)

## Troubleshooting

### Tests Fail Immediately

**Error:** `OPENAI_API_KEY not set`

**Solution:**
```bash
export OPENAI_API_KEY=sk-proj-...
npm test -- test/integration/agents/insights
```

### Tests Timeout

**Possible Causes:**
1. Network connection issues
2. OpenAI API is slow or down
3. Rate limits exceeded

**Solutions:**
- Check network connectivity
- Check https://status.openai.com
- Wait a few minutes and retry

### Parsing Errors

**Error:** `Missing semicolon` or `Unexpected token`

**Cause:** Jest configuration using wrong environment

**Solution:**
Ensure `jest.config.js` has:
```javascript
testEnvironment: 'node'
```

## Future Enhancements

- [ ] Add streaming response tests (if agent implements streaming)
- [ ] Add concurrent request tests (verify rate limiting)
- [ ] Add cost tracking per test run
- [ ] Add performance benchmarks (response time tracking)
- [ ] Add tests with different OpenAI models (gpt-4, gpt-3.5-turbo)

## Related Documentation

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
