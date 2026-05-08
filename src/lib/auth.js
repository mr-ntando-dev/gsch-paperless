import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { department: true }
        })

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          departmentId: user.departmentId,
          departmentCode: user.department?.code || null,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.departmentId = user.departmentId
        token.departmentCode = user.departmentCode
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.departmentId = token.departmentId
        session.user.departmentCode = token.departmentCode
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "medifile-gsch-secret-change-in-production",
}

export const getSession = () => getServerSession(authOptions)

export const isSuperAdmin = (session) => session?.user?.role === 'SUPERADMIN'
export const isAdmin = (session) => ['ADMIN', 'SUPERADMIN'].includes(session?.user?.role)
export const isManager = (session) => ['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(session?.user?.role)
