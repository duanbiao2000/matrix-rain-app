import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MatrixRain component', () => {
  render(<App />);
  // Check that the MatrixRain component is rendered
  // We can check for the ControlPanel elements or any distinctive element from MatrixRain
  const resetButton = screen.getByText('重置配置');
  expect(resetButton).toBeInTheDocument();
});
