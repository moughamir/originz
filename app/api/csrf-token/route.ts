import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/security/csrf-protection';

export async function GET(request: NextRequest) {
  try {
    const token = csrfProtection.generateToken();
    const response = NextResponse.json({ token });
    
    // Set the token in a secure cookie
    csrfProtection.setTokenCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}