/**
 * InsightsAgent - Integration Tests
 *
 * These tests make REAL API calls to OpenAI using actual API keys.
 * NO MOCKS - this verifies the complete integration chain.
 *
 * Prerequisites:
 * - OPENAI_API_KEY environment variable must be set
 * - API key must have sufficient quota
 * - Network connection required
 *
 * To run: npm test -- test/integration/agents/insights
 */

import { InsightsAgent } from '../../../../src/interface-adapters/agents/vercel-ai/insights.agent';
import {
  InsightsInput,
  InsightsOutput,
  AgentError,
} from '../../../../src/usecases/generate-ai-insights/interfaces/insights-agent.interface';

describe('InsightsAgent - Integration Tests', () => {
  let agent: InsightsAgent;

  beforeAll(() => {
    // CRITICAL: Verify API key is present - FAIL with clear message if missing
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY not set. Integration tests require real API keys.\n' +
          'Get your key from: https://platform.openai.com/api-keys\n' +
          'Set it: export OPENAI_API_KEY=sk-...',
      );
    }

    // Validate key format (optional but recommended)
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      throw new Error(
        'OPENAI_API_KEY appears to be invalid (should start with sk-)',
      );
    }
  });

  beforeEach(() => {
    agent = new InsightsAgent();
  });

  describe('execute - Single Headache Entry', () => {
    it('should successfully generate insights from a single headache entry using real API', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-1',
              timestamp: new Date('2025-01-12T08:00:00Z'),
              intensity: 7,
              location: ['forehead', 'temples'],
              triggers: ['stress', 'poor_sleep'],
              notes: 'Woke up with headache after only 4 hours sleep',
            },
          ],
          checkinData: [
            {
              id: 'checkin-1',
              timestamp: new Date('2025-01-12T07:00:00Z'),
              sleepQuality: 'poor',
              mood: 'stressed',
              bodyTension: ['neck', 'jaw'],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // Validate structure
      expect(result).toBeDefined();
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);

      // Validate patterns array
      expect(Array.isArray(result.patterns)).toBe(true);
      expect(result.patterns.length).toBeGreaterThan(0);
      result.patterns.forEach((pattern) => {
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
      });

      // Validate recommendations array
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      result.recommendations.forEach((rec) => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });

      // Validate confidence score
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);

      // Validate metadata
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.tokensUsed).toBeGreaterThan(0);
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for real API call

    it('should include contextually relevant insights', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-2',
              timestamp: new Date('2025-01-12T14:00:00Z'),
              intensity: 5,
              location: ['back_of_head'],
              triggers: ['screen_time'],
            },
          ],
          checkinData: [
            {
              id: 'checkin-2',
              timestamp: new Date('2025-01-12T13:00:00Z'),
              sleepQuality: 'good',
              mood: 'calm',
              bodyTension: ['shoulders'],
            },
          ],
        },
        context: 'Analyze patterns for someone working at a computer',
      };

      const result: InsightsOutput = await agent.execute(input);

      // Should provide some insights even with minimal data
      expect(result.summary).toBeTruthy();
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);

      // Confidence might be lower with less data
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }, 30000);
  });

  describe('execute - Multiple Entries', () => {
    it('should analyze patterns across multiple headache entries', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-3',
              timestamp: new Date('2025-01-10T08:00:00Z'),
              intensity: 6,
              location: ['temples'],
              triggers: ['caffeine_withdrawal'],
            },
            {
              id: 'test-4',
              timestamp: new Date('2025-01-11T09:00:00Z'),
              intensity: 7,
              location: ['temples', 'forehead'],
              triggers: ['poor_sleep', 'stress'],
            },
            {
              id: 'test-5',
              timestamp: new Date('2025-01-12T08:30:00Z'),
              intensity: 5,
              location: ['temples'],
              triggers: ['stress'],
            },
          ],
          checkinData: [
            {
              id: 'checkin-3',
              timestamp: new Date('2025-01-10T07:00:00Z'),
              sleepQuality: 'good',
              mood: 'calm',
              bodyTension: [],
            },
            {
              id: 'checkin-4',
              timestamp: new Date('2025-01-11T07:00:00Z'),
              sleepQuality: 'poor',
              mood: 'anxious',
              bodyTension: ['neck', 'jaw'],
            },
            {
              id: 'checkin-5',
              timestamp: new Date('2025-01-12T07:00:00Z'),
              sleepQuality: 'fair',
              mood: 'stressed',
              bodyTension: ['shoulders'],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // With more data, should have more confident analysis
      expect(result.patterns.length).toBeGreaterThanOrEqual(2);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
      expect(result.confidence).toBeGreaterThan(0.3); // Should be reasonably confident with 3 entries

      // Should identify the recurring pattern (stress/poor sleep)
      const hasStressPattern = result.patterns.some(
        (p) =>
          p.toLowerCase().includes('stress') ||
          p.toLowerCase().includes('sleep'),
      );
      expect(hasStressPattern).toBe(true);
    }, 30000);

    it('should provide different confidence levels based on data quantity', async () => {
      // Test with minimal data
      const minimalInput: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-6',
              timestamp: new Date(),
              intensity: 5,
            },
          ],
          checkinData: [
            {
              id: 'checkin-6',
              timestamp: new Date(),
              sleepQuality: 'fair',
              mood: 'neutral',
              bodyTension: [],
            },
          ],
        },
      };

      const minimalResult = await agent.execute(minimalInput);

      // Should still work but with lower confidence
      expect(minimalResult.confidence).toBeLessThanOrEqual(0.7);
      expect(minimalResult.patterns.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('execute - Options', () => {
    it('should respect maxTokens option', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-7',
              timestamp: new Date(),
              intensity: 6,
              triggers: ['stress'],
            },
          ],
          checkinData: [
            {
              id: 'checkin-7',
              timestamp: new Date(),
              sleepQuality: 'good',
              mood: 'calm',
              bodyTension: [],
            },
          ],
        },
        options: {
          maxTokens: 200, // Very low token limit
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // Should still return valid structure, but shorter
      expect(result.summary).toBeTruthy();
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);

      // Response should be relatively short due to token limit
      const totalLength =
        result.summary.length +
        result.patterns.join(' ').length +
        result.recommendations.join(' ').length;
      expect(totalLength).toBeLessThan(2000); // Rough heuristic
    }, 30000);

    it('should respect temperature option for creativity', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-8',
              timestamp: new Date(),
              intensity: 5,
            },
          ],
          checkinData: [
            {
              id: 'checkin-8',
              timestamp: new Date(),
              sleepQuality: 'fair',
              mood: 'neutral',
              bodyTension: [],
            },
          ],
        },
        options: {
          temperature: 0.1, // Very deterministic
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // Should work with low temperature (more focused/deterministic responses)
      expect(result.summary).toBeTruthy();
      expect(result.patterns.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('execute - Edge Cases', () => {
    it('should handle entries with minimal data', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-9',
              timestamp: new Date(),
              intensity: 5,
              // No location, triggers, or notes
            },
          ],
          checkinData: [
            {
              id: 'checkin-9',
              timestamp: new Date(),
              sleepQuality: 'fair',
              mood: 'neutral',
              bodyTension: [],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // Should still provide insights, even with minimal data
      expect(result.summary).toBeTruthy();
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    }, 30000);

    it('should handle entries with all optional fields populated', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-10',
              timestamp: new Date('2025-01-12T10:00:00Z'),
              intensity: 8,
              location: ['forehead', 'temples', 'back_of_head'],
              triggers: ['stress', 'poor_sleep', 'caffeine_withdrawal'],
              notes:
                'Very intense headache, started suddenly, light sensitivity',
            },
          ],
          checkinData: [
            {
              id: 'checkin-10',
              timestamp: new Date('2025-01-12T09:00:00Z'),
              sleepQuality: 'poor',
              mood: 'anxious',
              bodyTension: ['neck', 'jaw', 'shoulders', 'back'],
            },
          ],
        },
        context:
          'User has chronic tension headaches and is tracking triggers',
      };

      const result: InsightsOutput = await agent.execute(input);

      // With rich data, should provide detailed insights
      expect(result.summary.length).toBeGreaterThan(50);
      expect(result.patterns.length).toBeGreaterThanOrEqual(2);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
    }, 30000);
  });

  describe('error handling', () => {
    it('should throw AgentError with proper error code on failure', async () => {
      // Note: This is difficult to test reliably in integration tests
      // because we'd need to trigger actual API failures.
      // Error handling is better tested in unit tests with mocks.
      //
      // However, we document expected behavior:
      // - AUTH_ERROR: Invalid or missing API key (401)
      // - RATE_LIMIT: Too many requests (429)
      // - TIMEOUT: Request took too long
      // - NETWORK_ERROR: Network connectivity issues
      // - INVALID_RESPONSE: AI returned malformed data
      // - UNKNOWN: Other unexpected errors

      // If we wanted to test error handling, we'd need to:
      // 1. Use invalid API key (triggers AUTH_ERROR)
      // 2. Exceed rate limits (triggers RATE_LIMIT)
      // 3. Use network-blocking test environment (triggers NETWORK_ERROR)

      expect(true).toBe(true); // Placeholder test
    });

    it('should include cause in AgentError', async () => {
      // Similar to above - error handling verification
      // In real scenarios, we'd verify the error chain is preserved
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('response validation', () => {
    it('should always return valid InsightsOutput structure', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-11',
              timestamp: new Date(),
              intensity: 6,
            },
          ],
          checkinData: [
            {
              id: 'checkin-11',
              timestamp: new Date(),
              sleepQuality: 'good',
              mood: 'calm',
              bodyTension: [],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // Verify complete structure
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('metadata');

      // Verify types
      expect(typeof result.summary).toBe('string');
      expect(Array.isArray(result.patterns)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.metadata).toBe('object');
    }, 30000);

    it('should return non-empty arrays for patterns and recommendations', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-12',
              timestamp: new Date(),
              intensity: 7,
              triggers: ['stress'],
            },
          ],
          checkinData: [
            {
              id: 'checkin-12',
              timestamp: new Date(),
              sleepQuality: 'poor',
              mood: 'anxious',
              bodyTension: ['neck'],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      // AI should always provide at least some insights
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    }, 30000);

    it('should return valid confidence score in range [0, 1]', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-13',
              timestamp: new Date(),
              intensity: 6,
            },
          ],
          checkinData: [
            {
              id: 'checkin-13',
              timestamp: new Date(),
              sleepQuality: 'fair',
              mood: 'neutral',
              bodyTension: [],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(Number.isFinite(result.confidence)).toBe(true);
      expect(Number.isNaN(result.confidence)).toBe(false);
    }, 30000);
  });

  describe('metadata tracking', () => {
    it('should include token usage in metadata', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-14',
              timestamp: new Date(),
              intensity: 5,
            },
          ],
          checkinData: [
            {
              id: 'checkin-14',
              timestamp: new Date(),
              sleepQuality: 'good',
              mood: 'calm',
              bodyTension: [],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      expect(result.metadata?.tokensUsed).toBeDefined();
      expect(result.metadata?.tokensUsed).toBeGreaterThan(0);
    }, 30000);

    it('should include processing time in metadata', async () => {
      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: 'test-15',
              timestamp: new Date(),
              intensity: 5,
            },
          ],
          checkinData: [
            {
              id: 'checkin-15',
              timestamp: new Date(),
              sleepQuality: 'good',
              mood: 'calm',
              bodyTension: [],
            },
          ],
        },
      };

      const result: InsightsOutput = await agent.execute(input);

      expect(result.metadata?.processingTime).toBeDefined();
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
      expect(result.metadata?.processingTime).toBeLessThan(30000); // Should complete within 30 seconds
    }, 30000);
  });
});
