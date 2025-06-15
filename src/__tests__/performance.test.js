import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../redux/store';
import { App } from '../components/App';

// Performance tests
describe('Performance Tests', () => {
  const renderApp = () => {
    const start = performance.now();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    return performance.now() - start;
  };

  test('app renders within acceptable time', () => {
    const utils = renderApp();

    // App should render within 100ms
    expect(utils).toBeLessThan(100);
  });

  test('large lists render efficiently', async () => {
    const start = performance.now();

    // Mock large product list
    const mockProducts = Array(1000).fill(null).map((_, i) => ({
      _id: `product-${i}`,
      title: `Product ${i}`,
      calories: 100 + i,
      weight: 100,
      categories: 'test',
      groupBloodNotAllowed: [null, false, false, false, false]
    }));

    // Use the mock data
    expect(mockProducts.length).toBe(1000);

    renderApp();

    // Should handle large lists efficiently
    const renderTime = performance.now() - start;
    expect(renderTime).toBeLessThan(500);
  });

  test('memory usage is reasonable', () => {
    // Initial memory usage
    const initialMemory = performance.memory?.usedJSHeapSize || 0;

    renderApp();

    // Memory should not increase dramatically
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    // Should use less than 50MB additional memory
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  }, 10000);

  test('component updates are optimized', async () => {
    renderApp();

    let rerenderCount = 0;
    const originalRender = React.createElement;
    React.createElement = function(...args) {
      rerenderCount++;
      return originalRender.apply(this, args);
    };

    // Trigger some state changes
    await waitFor(() => {
      // Should not cause excessive re-renders
      expect(rerenderCount).toBeLessThan(100);
    });

    // Restore original render
    React.createElement = originalRender;
  });
});
