import type React from "react"
import type { Metadata } from "next"
import { Maven_Pro } from "next/font/google" // Import Maven_Pro
import "./globals.css"

const mavenPro = Maven_Pro({
  // Define mavenPro
  subsets: ["latin"],
  display: "swap",
  variable: "--font-maven-pro",
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={mavenPro.variable}>
      <body className={mavenPro.className}>{children}</body>
    </html>
  )
}
