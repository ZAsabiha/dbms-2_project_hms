


import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./LoginPage.css" // Added CSS import for enhanced styling

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("admin")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Added loading state
  const navigate = useNavigate()

  const auth = useAuth()
  const { login } = auth

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Set loading state
    setError("") // Clear previous errors

    try {
      const body = role === "guest" ? { role: "guest" } : { email, password, role }

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed")
        return
      }

      login(data.token, data.user.role)

      if (data.user.role === "admin") navigate("/admin/dashboard")
      else if (data.user.role === "guest") navigate("/guest/dashboard")
      else navigate("/")
    } catch (err) {
      setError("Server error. Try again later.")
    } finally {
      setIsLoading(false) // Reset loading state
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="hotel-icon">🏨</div>
            <h1 className="login-title">Hotel Management</h1>
            <p className="login-subtitle">Welcome back! Please sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Access Level</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-button ${role === "admin" ? "active" : ""}`}
                  onClick={() => setRole("admin")}
                >
                  <span className="role-icon">👨‍💼</span>
                  Administrator
                </button>
                <button
                  type="button"
                  className={`role-button ${role === "guest" ? "active" : ""}`}
                  onClick={() => setRole("guest")}
                >
                  <span className="role-icon">👤</span>
                  Guest Access
                </button>
              </div>
            </div>

            {role === "admin" && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {role === "guest" && (
              <div className="guest-info">
                <div className="info-card">
                  <span className="info-icon">ℹ️</span>
                  <p>
                    Guest access allows you to view available rooms and make reservations without creating an account.
                  </p>
                </div>
              </div>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  {role === "admin" ? "Sign In as Admin" : "Continue as Guest"}
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Secure hotel management system</p>
          </div>
        </div>
      </div>
    </div>
  )
}