// Base authentication and HTTP utility service
export class BaseApiService {
  protected baseUrl = '';

  // Get auth token from cookies
  protected getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Simple cookie parsing - in production use js-cookie library
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }

  // Decode JWT token to get user info
  private decodeJWT(token: string): any {
    try {
      // JWT has 3 parts separated by dots: header.payload.signature
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      // Decode base64 payload
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Get current user info from JWT token in cookies
  getCurrentUser(): any {
    const token = this.getAuthToken();
    if (!token) {
      console.warn('No auth token found in cookies');
      return null;
    }

    const decoded = this.decodeJWT(token);
    if (!decoded) {
      console.warn('Could not decode auth token');
      return null;
    }
    return decoded;
  }

  // Helper method to get current username for createdBy fields
  getCurrentUsername(): string {
    const user = this.getCurrentUser();
    if (user) {
      console.log('Decoded user from JWT:', user); // Debug log
      // Try different possible field names for username
      const username = user.username || 
                      user.name || 
                      user.email || 
                      user.sub ||  // JWT standard subject field
                      user.user_name ||
                      user.display_name ||
                      'Unknown User';
      console.log('Using username for createdBy:', username); // Debug log
      return username;
    }
    
    console.warn('Could not get current user from token');
    return 'Unknown User';
  }

  // Get headers with authorization
  protected getHeaders(includeContentType = true): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
}

// Auth service for authentication-related operations
export class AuthService extends BaseApiService {
  // Add any auth-specific methods here in the future
  // like login, logout, refreshToken, etc.
}

export const authService = new AuthService();
