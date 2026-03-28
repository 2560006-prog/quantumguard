import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Get user role and redirect accordingly
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userData?.role || 'farmer';
    const url = request.nextUrl.clone();
    url.pathname = `/dashboard/${role}`;
    return NextResponse.redirect(url);
  }

  // Role-based access control for dashboards
  if (user && isDashboardRoute) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userData?.role || 'farmer';
    const path = request.nextUrl.pathname;

    // Prevent access to wrong dashboard
    if (path.startsWith('/dashboard/farmer') && role !== 'farmer') {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }
    if (path.startsWith('/dashboard/validator') && role !== 'validator' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }
    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
