import { useState } from 'react';
import { useApi } from '@/hooks/use-api';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
}

export default function TestIntegration() {
  const api = useApi();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    { method: 'GET', endpoint: '/health', description: 'Health Check' },
    { method: 'GET', endpoint: '/survey/', description: 'Get Surveys' },
    { method: 'GET', endpoint: '/credits/packages', description: 'Credit Packages' },
    { method: 'POST', endpoint: '/waitlist/join', data: { email: `test${Date.now()}@example.com`, role: 'filler' }, description: 'Join Waitlist' },
    { method: 'POST', endpoint: '/auth/forgot-password', data: { email: 'test@example.com' }, description: 'Forgot Password' },
    { method: 'GET', endpoint: '/waitlist/stats', description: 'Waitlist Stats' },
  ];

  const runTest = async (test: any) => {
    try {
      let response;
      if (test.method === 'GET') {
        response = await api.get(test.endpoint);
      } else if (test.method === 'POST') {
        response = await api.post(test.endpoint, test.data);
      }
      
      return {
        endpoint: test.endpoint,
        method: test.method,
        status: 'success' as const,
        response: response
      };
    } catch (error: any) {
      return {
        endpoint: test.endpoint,
        method: test.method,
        status: 'error' as const,
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const test of testEndpoints) {
      const result = await runTest(test);
      setResults(prev => [...prev, result]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Frontend-Backend Integration Test
          </h1>
          
          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {testEndpoints.map((test, index) => {
              const result = results.find(r => r.endpoint === test.endpoint);
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{test.description}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {test.method} {test.endpoint}
                      </span>
                    </div>
                    
                    {result && (
                      <span className={`font-medium ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {result && (
                    <div className="mt-2">
                      {result.status === 'success' ? (
                        <div className="bg-green-50 p-3 rounded text-sm">
                          <pre className="text-green-800 overflow-x-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-3 rounded text-sm">
                          <span className="text-red-800">{result.error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {results.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">
                    ✅ Passed: {results.filter(r => r.status === 'success').length}
                  </span>
                </div>
                <div>
                  <span className="text-red-600 font-medium">
                    ❌ Failed: {results.filter(r => r.status === 'error').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">
                    📊 Total: {results.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
