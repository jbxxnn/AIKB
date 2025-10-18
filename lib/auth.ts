import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[v0] Missing credentials")
          return null
        }

        try {
          console.log("[v0] Attempting to authenticate user:", credentials.email)

          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email}
          `

          console.log("[v0] User query result:", users.length > 0 ? "User found" : "User not found")

          const user = users[0]

          if (!user || !user.password) {
            console.log("[v0] User not found or no password set")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          console.log("[v0] Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("[v0] Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}
