// Ensures requests are bound to a specific user session (JWT user or guest session_id)
export default function sessionGuard(requireAuth = false) {
  return (req, res, next) => {
    const jwtUserId = req.user?.user_id || req.user?.id || req.user?._id;

    const headerSession = req.headers["x-session-id"];
    const querySession = req.query.session_id || req.body?.session_id;
    const bodyUser = req.body?.user_id;
    const paramUser = req.params?.user_id;

    const sessionId = jwtUserId || headerSession || querySession || bodyUser || paramUser;

    if (requireAuth && !jwtUserId) {
      return res.status(401).json({
        error: "Authentication required. Please log in to continue.",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        error:
          "Session not established. Please login or continue as guest before using this feature.",
      });
    }

    req.sessionId = String(sessionId);
    next();
  };
}
