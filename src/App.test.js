import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

jest.mock('./services/Api', () => ({
  getHomeSections: jest.fn().mockResolvedValue([]),
  getPopularMovies: jest.fn().mockResolvedValue([]),
  searchMovies: jest.fn(),
}));

jest.mock('./services/AccountApi', () => ({
  accountApi: {
    getSession: jest.fn().mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 })),
    getProfiles: jest.fn().mockResolvedValue({ profiles: [] }),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    createProfile: jest.fn(),
  },
}));

test('shows sign in when there is no authenticated account', async () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Create an account' })).toBeInTheDocument();
});
