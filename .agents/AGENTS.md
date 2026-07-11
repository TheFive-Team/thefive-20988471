# Auto-Sync Rule
Always execute a `git commit -am "<message>"` and `git push` automatically after completing any code modifications or tasks to ensure the changes are synced with the Lovable editor.

# Secure Development Policy (Mandatory)
From this point forward, every code change, feature, refactor, or optimization must follow the security requirements below.

## 1. INPUT VALIDATION & SANITIZATION
Treat ALL client input as untrusted. Protect every entry point (Forms, Search, URLs, Headers, Cookies, Uploads, JSON, APIs). Validate inputs on BOTH frontend and backend. Sanitize all text before rendering/storing. Prevent XSS and injections. Reject invalid data with meaningful errors.

## 2. DATABASE SECURITY
Never build SQL queries using string concatenation. Always use Parameterized queries, Prepared statements, or Official ORM methods. Validate identifiers.

## 3. SECRET MANAGEMENT
Never hardcode API Keys, Access Tokens, Secrets, Passwords, or Connection Strings. Always use Environment Variables or Secure Secret Managers. Never expose secrets to the browser or commit them to Git.

## 4. AUTHORIZATION
Never trust the client. Verify authorization on every protected endpoint server-side. Users may only access/modify their own resources.

## 5. RATE LIMITING
Protect ALL API endpoints with rate limiting, request throttling, and brute-force protection. Return HTTP 429 when exceeded.

## 6. CSRF
Protect all state-changing requests. Validate Origin and Referer when appropriate.

## 7. FILE UPLOAD SECURITY
Validate MIME Type, Extension, and File Size. Reject executable files, rename uploaded files, and store outside executable paths.

## 8. OUTPUT ENCODING
Escape all user-generated content before rendering. Never use `dangerouslySetInnerHTML` unless absolutely necessary (and sanitize HTML before rendering).

## 9. ERROR HANDLING
Never expose stack traces, SQL errors, internal paths, or secrets to the client. Return generic client errors and log detailed errors on the server only.

## 10. LOGGING
Never log Passwords, Tokens, Cookies, Credit Card Data, or Personal Secrets. Mask sensitive values.

## 11. SECURITY HEADERS
Ensure production uses Security Headers (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security, X-Frame-Options).

## 12. DEPENDENCIES
Do not introduce packages with known vulnerabilities. Prefer actively maintained libraries and remove unused dependencies.

## 13. PERFORMANCE
Security improvements must not significantly degrade Lighthouse performance (maintain >90 Performance, >95 A11y, 100 Best Practices, 100 SEO).

## 14. BEFORE WRITING CODE
Identify security risks, apply mitigations, and follow OWASP Top 10 best practices.

## 15. BEFORE FINISHING
Review all modified files to verify no new vulnerabilities were introduced, no secrets are exposed, and all validations/authorizations are enforced.
