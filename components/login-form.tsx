"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Ship, Eye, EyeOff, LogIn } from "lucide-react"
import { authService, type LoginCredentials } from "@/lib/auth"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await authService.login(credentials)

    if (result.success) {
      onLoginSuccess()
    } else {
      setError(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  const fillDemoCredentials = (role: "admin" | "user") => {
    if (role === "admin") {
      setCredentials({
        email: "admin@yacht-gwp.com",
        password: "password123",
      })
    } else {
      setCredentials({
        email: "user@yacht-gwp.com",
        password: "password123",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ship className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Yacht GWP Calculator</h1>
          </div>
          <p className="text-gray-600">Sign in to access the Global Warming Potential calculation tool</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>Enter your credentials to access the application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Demo Credentials:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials("admin")}
                  className="w-full text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Admin Access</div>
                    <div className="text-xs text-gray-500">admin@yacht-gwp.com</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials("user")}
                  className="w-full text-left justify-start"
                >
                  <div>
                    <div className="font-medium">User Access</div>
                    <div className="text-xs text-gray-500">user@yacht-gwp.com</div>
                  </div>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password for both accounts: <code className="bg-gray-100 px-1 rounded">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Lightshipweight GWP Calculator v1.0</p>
          <p>For maritime industry environmental assessment</p>
        </div>
      </div>
    </div>
  )
}
