import type React from "react"
import {Inter} from "next/font/google"
import "./globals.css"
import {ThemeProvider} from "@/components/theme-provider"
import {TopNavbar} from "@/components/top-navbar"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
})

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
            <div className="flex h-screen flex-col">
                <TopNavbar/>
                <main className="flex-1 overflow-auto bg-background">{children}</main>
            </div>
        </ThemeProvider>
        </body>
        </html>
    )
}
