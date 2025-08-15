// // middleware.ts
// import { NextResponse } from 'next/server';
// import { jwtDecode } from 'jwt-decode';
// import { JwtPayload } from '@/lib/auth';

// export async function middleware(request) {
//   const token = request.cookies.get('accessToken')?.value;
//   if (!token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   try {
//     jwtDecode<JwtPayload>(token); // Basic validation
//     // Optional: Verify token with backend for production
//     // const response = await fetch('/api/verify-token', { headers: { Authorization: `Bearer ${token}` } });
//     // if (!response.ok) throw new Error('Invalid token');
//     return NextResponse.next();
//   } catch {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
// }

// export const config = { matcher: ['/sales', '/inventory', '/workers', '/kyc'] };