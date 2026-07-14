// Clerk middleware disabled due to Edge Runtime 404 issue.
// Route protection handled by Clerk Protect component in (app)/layout.tsx instead.
export default function middleware() {
  return true;
}

export const config = {
  matcher: [],
};
