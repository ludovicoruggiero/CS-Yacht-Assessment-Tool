import type React from "react"
import type { Metadata } from "next"
// REMOVE: import { Maven_Pro } from 'next/font/google'
import "./globals.css"
import { APP_CONFIG } from "@/lib/constants"

// REMOVE: const mavenPro = Maven_Pro({
// REMOVE:   subsets: ["latin"],
// REMOVE:   display: "swap",
// REMOVE:   variable: "--font-maven-pro",
// REMOVE: })

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {" "}
      {/* REMOVE: className={mavenPro.variable} */}
      <body>{children}</body> {/* REMOVE: className={mavenPro.className} */}
    </html>
  )
}
