import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/admin/login';
  const isAdminPath = path.startsWith('/admin') && !isPublicPath;
  
  const token = request.cookies.get('admin_session')?.value;

  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
