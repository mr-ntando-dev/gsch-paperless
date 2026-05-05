import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/documents/:path*", "/api/tasks/:path*", "/api/users/:path*", "/api/maintenance/:path*", "/api/forms/:path*"]
}
