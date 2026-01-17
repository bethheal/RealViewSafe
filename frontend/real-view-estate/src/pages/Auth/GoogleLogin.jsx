import { GoogleLogin } from "@react-oauth/google";

<GoogleLogin
  onSuccess={async (res) => {
    try {
      await api.post("/auth/google", { token: res.credential });
      // optionally navigate after success
      // navigate("/dashboard");
    } catch (err) {
      console.error("Google auth failed:", err);
    }
  }}
  onError={() => {
    console.error("Google Login Failed");
  }}
/>
