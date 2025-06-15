import { wakeUpBackend } from '../backendTester';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  defaults: {
    baseURL: 'http://localhost:5000/api',
  },
}));

const axios = require('axios');

describe('Backend Tester Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('wakeUpBackend returns true when backend is available', async () => {
    axios.get.mockResolvedValueOnce({
      data: { message: 'SlimMom API is running!' },
      status: 200,
    });

    const result = await wakeUpBackend();

    expect(result).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('/', { timeout: 5000 });
  });

  test('wakeUpBackend returns false when backend is unavailable', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    const result = await wakeUpBackend();

    expect(result).toBe(false);
    expect(axios.get).toHaveBeenCalledWith('/', { timeout: 5000 });
  });

  test('wakeUpBackend handles timeout errors', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    axios.get.mockRejectedValueOnce(timeoutError);

    const result = await wakeUpBackend();

    expect(result).toBe(false);
  });

  test('wakeUpBackend handles network errors', async () => {
    const networkError = new Error('Network Error');
    networkError.code = 'ECONNREFUSED';
    axios.get.mockRejectedValueOnce(networkError);

    const result = await wakeUpBackend();

    expect(result).toBe(false);
  });

  test('wakeUpBackend handles server errors', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    });

    const result = await wakeUpBackend();

    expect(result).toBe(false);
  });

  test('wakeUpBackend retries on failure', async () => {
    // First call fails, second succeeds
    axios.get
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce({
        data: { message: 'SlimMom API is running!' },
        status: 200,
      });

    const result = await wakeUpBackend();

    expect(result).toBe(true);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
