import { GoogleLogin } from "@react-oauth/google";

<GoogleLogin
  onSuccess={(res) =>
    api.post("/auth/google", { token: res.credential })
  }
/>
