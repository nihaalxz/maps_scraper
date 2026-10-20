import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Arab Season Leads Application', () => {
  it('renders the main dashboard with navigation and title', async () => {
    render(<App />);

    // Navigation and Section headers
    expect(screen.getByText(/industry sectors/i)).toBeInTheDocument();
    expect(screen.getByText(/all sectors/i)).toBeInTheDocument();

    // Pipeline status tabs
    expect(screen.getByText('New Customers')).toBeInTheDocument();
    expect(screen.getByText('Old Customers')).toBeInTheDocument();
    expect(screen.getByText('Closed Customers')).toBeInTheDocument();
  });
});
