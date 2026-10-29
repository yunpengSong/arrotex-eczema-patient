export function isRecaptchaEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA === "true";
}

export async function verifyRecaptcha(token: string | null | undefined) {
  if (!isRecaptchaEnabled()) {
    return true;
  }

  if (!token || !process.env.RECAPTCHA_SECRET_KEY) {
    return false;
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}
