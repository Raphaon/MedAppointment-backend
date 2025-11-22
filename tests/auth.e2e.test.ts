import request from 'supertest';
import { UserRole } from '@prisma/client';
import app from '../src/app';
import { authService } from '../src/services/auth.service';
import { verifyToken } from '../src/utils/jwt';

jest.mock('../src/services/auth.service');
jest.mock('../src/utils/jwt', () => ({
  ...jest.requireActual('../src/utils/jwt'),
  verifyToken: jest.fn(),
}));

describe('Auth routes', () => {
  const mockedAuthService = authService as jest.Mocked<typeof authService>;
  const mockedVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should register a new user', async () => {
    mockedAuthService.register = jest.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        phone: '+33123456789',
        role: UserRole.PATIENT,
        isActive: true,
        createdAt: new Date(),
      },
      token: 'token-123',
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      password: 'StrongPass123!',
      firstName: 'New',
      lastName: 'User',
      phone: '+33123456789',
      role: UserRole.PATIENT,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: 'Inscription réussie',
      user: expect.objectContaining({ email: 'new@example.com', role: UserRole.PATIENT }),
      token: 'token-123',
    });
    expect(mockedAuthService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com', role: UserRole.PATIENT }),
    );
  });

  it('should login an existing user', async () => {
    mockedAuthService.login = jest.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        phone: '+33123456789',
        role: UserRole.PATIENT,
        isActive: true,
      },
      token: 'token-456',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'demo@example.com',
      password: 'StrongPass123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: 'Connexion réussie',
      user: expect.objectContaining({ email: 'demo@example.com' }),
      token: 'token-456',
    });
    expect(mockedAuthService.login).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'demo@example.com' }),
    );
  });

  it('should return the authenticated profile', async () => {
    mockedVerifyToken.mockReturnValue({
      userId: 'user-1',
      email: 'profile@example.com',
      role: UserRole.PATIENT,
    });

    mockedAuthService.getProfile = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'profile@example.com',
      firstName: 'Profile',
      lastName: 'User',
      phone: '+33987654321',
      role: UserRole.PATIENT,
      isActive: true,
      createdAt: new Date(),
      doctorProfile: null,
      patientProfile: null,
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: expect.objectContaining({ email: 'profile@example.com', role: UserRole.PATIENT }),
    });
    expect(mockedVerifyToken).toHaveBeenCalledWith('valid-token');
    expect(mockedAuthService.getProfile).toHaveBeenCalledWith('user-1');
  });
});
