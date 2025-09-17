import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user (requires auth)'
      },
      recipes: {
        'GET /api/recipes': 'Get user recipes (requires auth)',
        'POST /api/recipes': 'Create recipe (requires auth)',
        'GET /api/recipes/:id': 'Get recipe by ID (requires auth)',
        'PUT /api/recipes/:id': 'Update recipe (requires auth)',
        'DELETE /api/recipes/:id': 'Delete recipe (requires auth)'
      },
      users: {
        'GET /api/users/profile': 'Get user profile (requires auth)',
        'PUT /api/users/profile': 'Update user profile (requires auth)'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    }
  });
};