import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: "Dashboard - Secure Authentication",
  description: "Modern dashboard with NextAuth authentication",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          async
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
