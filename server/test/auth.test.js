process.env.JWT_SECRET = 'test-secret-with-at-least-16-chars';

const { sendTokenCookie } = require('../src/middleware/auth');

describe('auth cookie policy', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('uses cross-site cookies in production', () => {
    process.env.NODE_ENV = 'production';
    const cookie = jest.fn();

    sendTokenCookie({ cookie }, { _id: 'user-id', role: 'customer' });

    expect(cookie).toHaveBeenCalledWith('token', expect.any(String), expect.objectContaining({
      httpOnly: true,
      sameSite: 'none',
      secure: true
    }));
  });

  test('keeps local cookies compatible with development', () => {
    process.env.NODE_ENV = 'development';
    const cookie = jest.fn();

    sendTokenCookie({ cookie }, { _id: 'user-id', role: 'customer' });

    expect(cookie).toHaveBeenCalledWith('token', expect.any(String), expect.objectContaining({
      sameSite: 'lax',
      secure: false
    }));
  });
});