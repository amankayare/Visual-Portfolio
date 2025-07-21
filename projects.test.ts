// client/src/tests/projects.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsManagement } from '@/pages/admin/ProjectsManagement';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { setToken } from '@/lib/tokenManager';

// Mock API responses
jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('ProjectsManagement', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders project management page', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ProjectsManagement />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('handles project creation', async () => {
    const mockToken = 'test-token';
    setToken(mockToken);

    // Mock API responses
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        // ... other project fields
      }
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProjectsManagement />
        </AuthProvider>
      </MemoryRouter>
    );

    // Find and click create button
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    // Fill form and submit
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Project' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test Description' }
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    // Verify API call
    expect(api.post).toHaveBeenCalledWith('/projects/', expect.any(Object));
  });

  // Add more tests for update, delete, and error scenarios
});