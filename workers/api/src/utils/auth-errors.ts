import { fail } from "./response";

export const AuthErrors = {
  invalidBody: (message = "Invalid body") =>
    fail("INVALID_BODY", message),

  invalidEmail: () =>
    fail("INVALID_EMAIL", "Invalid email"),

  weakPassword: () =>
    fail("WEAK_PASSWORD", "Weak password"),

  emailAlreadyExists: () =>
    fail("EMAIL_EXISTS", "Email already exists"),

  invalidCredentials: () =>
    fail("INVALID_CREDENTIALS", "Invalid email or password"),

  unauthorized: (message = "User not authenticated") =>
    fail("UNAUTHORIZED", message),

  sessionExpired: () =>
    fail("SESSION_EXPIRED", "Session expired"),

  registerFailed: () =>
    fail("REGISTER_FAILED", "Registration failed"),

  loginFailed: () =>
    fail("LOGIN_FAILED", "Login failed"),

  logoutFailed: () =>
    fail("LOGOUT_FAILED", "Logout failed"),

  missingGoogleCode: () =>
    fail("MISSING_CODE", "Missing Google code"),

  googleTokenExchangeFailed: () =>
    fail("GOOGLE_TOKEN_EXCHANGE_FAILED", "Failed to exchange Google code"),

  googleProfileFailed: () =>
    fail("GOOGLE_PROFILE_FAILED", "Failed to fetch Google profile"),

  googleCallbackCrash: () =>
    fail("GOOGLE_CALLBACK_CRASH", "Google callback crashed"),
};
