/**
 * Insights Agent Interface Unit Tests
 *
 * TDD tests for the InsightsAgent interface contract.
 * Tests use a MockInsightsAgent to verify the interface works correctly.
 */

import {
  IInsightsAgent,
  InsightsInput,
  InsightsOutput,
  AgentError,
} from '@/usecases/generate-ai-insights/interfaces/insights-agent.interface';

// ============================================================================
// Mock Implementation for Testing
// ============================================================================

/**
 * Mock implementation of IInsightsAgent for testing use cases
 * This mock allows tests to verify the interface contract without calling real AI APIs
 */
class MockInsightsAgent implements IInsightsAgent {
  private mockResponse: InsightsOutput | null = null;
  private mockError: Error | null = null;

  setMockResponse(response: InsightsOutput): void {
    this.mockResponse = response;
    this.mockError = null;
  }

  setMockError(error: Error): void {
    this.mockError = error;
    this.mockResponse = null;
  }

  async execute(input: InsightsInput): Promise<InsightsOutput> {
    if (this.mockError) {
      throw this.mockError;
    }
    if (this.mockResponse) {
      return this.mockResponse;
    }
    throw new Error('Mock not configured');
  }
}

// ============================================================================
// Test Suite
// ============================================================================

describe('InsightsAgent Interface', () => {
  let mockAgent: MockInsightsAgent;

  beforeEach(() => {
    mockAgent = new MockInsightsAgent();
  });

  describe('execute - Success Scenarios', () => {
    it('should return expected output for valid input with headache entries only', async () => {
      // Arrange
      const expectedOutput: InsightsOutput = {
        summary: 'Detected pattern: Morning headaches with moderate intensity',
        patterns: ['Morning headaches', 'Intensity peaks at 7/10'],
        recommendations: [
          'Consider tracking sleep quality',
          'Monitor stress levels',
        ],
        confidence: 0.85,
      };
      mockAgent.setMockResponse(expectedOutput);

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 7,
              location: ['temple', 'forehead'],
              triggers: ['stress'],
              notes: 'Started after waking up',
            },
          ],
          checkinData: [],
        },
      };

      // Act
      const result = await mockAgent.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(result.summary).toBe(expectedOutput.summary);
      expect(result.patterns).toHaveLength(2);
      expect(result.recommendations).toHaveLength(2);
      expect(result.confidence).toBe(0.85);
    });

    it('should return expected output for input with both headaches and checkins', async () => {
      // Arrange
      const expectedOutput: InsightsOutput = {
        summary:
          'Poor sleep quality correlates with increased headache frequency',
        patterns: [
          'Headaches after poor sleep',
          'Jaw tension present on headache days',
        ],
        recommendations: [
          'Improve sleep hygiene',
          'Practice jaw relaxation exercises',
        ],
        confidence: 0.92,
        metadata: {
          tokensUsed: 150,
          processingTime: 1200,
        },
      };
      mockAgent.setMockResponse(expectedOutput);

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T07:00:00Z'),
              sleepQuality: 'poor',
              mood: 'stressed',
              bodyTension: ['jaw', 'neck'],
            },
          ],
        },
        context: 'Analyze headache patterns and provide insights',
      };

      // Act
      const result = await mockAgent.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.tokensUsed).toBe(150);
      expect(result.metadata?.processingTime).toBe(1200);
    });

    it('should handle optional parameters correctly', async () => {
      // Arrange
      const expectedOutput: InsightsOutput = {
        summary: 'Analysis complete',
        patterns: ['Test pattern'],
        recommendations: ['Test recommendation'],
        confidence: 0.75,
      };
      mockAgent.setMockResponse(expectedOutput);

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 3,
            },
          ],
          checkinData: [],
        },
        options: {
          maxTokens: 500,
          temperature: 0.7,
        },
      };

      // Act
      const result = await mockAgent.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle empty patterns and recommendations arrays', async () => {
      // Arrange
      const expectedOutput: InsightsOutput = {
        summary: 'Insufficient data for pattern detection',
        patterns: [],
        recommendations: [],
        confidence: 0.3,
      };
      mockAgent.setMockResponse(expectedOutput);

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 2,
            },
          ],
          checkinData: [],
        },
      };

      // Act
      const result = await mockAgent.execute(input);

      // Assert
      expect(result.patterns).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('execute - Error Scenarios', () => {
    it('should throw AgentError with RATE_LIMIT code on rate limit exceeded', async () => {
      // Arrange
      mockAgent.setMockError(
        new AgentError('Rate limit exceeded', 'RATE_LIMIT'),
      );

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [],
        },
      };

      // Act & Assert
      await expect(mockAgent.execute(input)).rejects.toThrow('Rate limit exceeded');
      await expect(mockAgent.execute(input)).rejects.toThrow(AgentError);

      try {
        await mockAgent.execute(input);
      } catch (error) {
        expect((error as AgentError).code).toBe('RATE_LIMIT');
      }
    });

    it('should throw AgentError with TIMEOUT code on request timeout', async () => {
      // Arrange
      mockAgent.setMockError(new AgentError('Request timeout', 'TIMEOUT'));

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [],
        },
      };

      // Act & Assert
      await expect(mockAgent.execute(input)).rejects.toThrow('Request timeout');

      try {
        await mockAgent.execute(input);
      } catch (error) {
        expect((error as AgentError).code).toBe('TIMEOUT');
      }
    });

    it('should throw AgentError with INVALID_RESPONSE code on invalid response format', async () => {
      // Arrange
      mockAgent.setMockError(
        new AgentError('Invalid response format', 'INVALID_RESPONSE'),
      );

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [],
        },
      };

      // Act & Assert
      await expect(mockAgent.execute(input)).rejects.toThrow('Invalid response format');

      try {
        await mockAgent.execute(input);
      } catch (error) {
        expect((error as AgentError).code).toBe('INVALID_RESPONSE');
      }
    });

    it('should throw AgentError with NETWORK_ERROR code on network failure', async () => {
      // Arrange
      mockAgent.setMockError(
        new AgentError('Network connection failed', 'NETWORK_ERROR'),
      );

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [],
        },
      };

      // Act & Assert
      await expect(mockAgent.execute(input)).rejects.toThrow('Network connection failed');

      try {
        await mockAgent.execute(input);
      } catch (error) {
        expect((error as AgentError).code).toBe('NETWORK_ERROR');
      }
    });

    it('should throw AgentError with AUTH_ERROR code on authentication failure', async () => {
      // Arrange
      mockAgent.setMockError(
        new AgentError('Authentication failed', 'AUTH_ERROR'),
      );

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [],
        },
      };

      // Act & Assert
      await expect(mockAgent.execute(input)).rejects.toThrow('Authentication failed');

      try {
        await mockAgent.execute(input);
      } catch (error) {
        expect((error as AgentError).code).toBe('AUTH_ERROR');
      }
    });

    it('should throw AgentError with UNKNOWN code for unexpected errors', async () => {
      // Arrange
      mockAgent.setMockError(
        new AgentError('Unknown error occurred', 'UNKNOWN'),
      );

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
          ],
          checkinData: [],
        },
      };

      // Act & Assert
      await expect(mockAgent.execute(input)).rejects.toThrow('Unknown error occurred');

      try {
        await mockAgent.execute(input);
      } catch (error) {
        expect((error as AgentError).code).toBe('UNKNOWN');
      }
    });
  });

  describe('AgentError class', () => {
    it('should create AgentError with all properties', () => {
      // Arrange
      const cause = new Error('Original error');

      // Act
      const error = new AgentError('Test error message', 'TIMEOUT', cause);

      // Assert
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TIMEOUT');
      expect(error.cause).toBe(cause);
      expect(error.name).toBe('AgentError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create AgentError without cause', () => {
      // Act
      const error = new AgentError('Test error', 'RATE_LIMIT');

      // Assert
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.cause).toBeUndefined();
    });
  });

  describe('Input validation edge cases', () => {
    it('should handle input with multiple headache entries', async () => {
      // Arrange
      const expectedOutput: InsightsOutput = {
        summary: 'Multiple headache episodes detected',
        patterns: ['Increasing frequency', 'Variable intensity'],
        recommendations: ['Track triggers consistently'],
        confidence: 0.88,
      };
      mockAgent.setMockResponse(expectedOutput);

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
            },
            {
              id: '2',
              timestamp: new Date('2024-01-11T10:00:00Z'),
              intensity: 7,
            },
            {
              id: '3',
              timestamp: new Date('2024-01-12T14:00:00Z'),
              intensity: 6,
            },
          ],
          checkinData: [],
        },
      };

      // Act
      const result = await mockAgent.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle input with all optional fields populated', async () => {
      // Arrange
      const expectedOutput: InsightsOutput = {
        summary: 'Comprehensive analysis complete',
        patterns: ['Complex pattern detected'],
        recommendations: ['Detailed recommendation'],
        confidence: 0.95,
      };
      mockAgent.setMockResponse(expectedOutput);

      const input: InsightsInput = {
        data: {
          headacheEntries: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T08:00:00Z'),
              intensity: 5,
              location: ['temple', 'forehead'],
              triggers: ['stress', 'lack of sleep'],
              notes: 'Severe pain, lasted 3 hours',
            },
          ],
          checkinData: [
            {
              id: '1',
              timestamp: new Date('2024-01-10T07:00:00Z'),
              sleepQuality: 'poor',
              mood: 'anxious',
              bodyTension: ['jaw', 'neck', 'shoulders'],
            },
          ],
        },
        context: 'Detailed analysis of headache patterns',
        options: {
          maxTokens: 1000,
          temperature: 0.8,
        },
      };

      // Act
      const result = await mockAgent.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
