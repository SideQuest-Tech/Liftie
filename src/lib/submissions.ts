export type SubmissionState =
  | { status: "success"; message: string }
  | { status: "missing-endpoint"; message: string }
  | { status: "server-error"; message: string }
  | { status: "network-error"; message: string };

const submitJson = async (
  endpoint: string | undefined,
  payload: Record<string, unknown>,
): Promise<SubmissionState> => {
  if (!endpoint?.trim()) {
    return {
      status: "missing-endpoint",
      message:
        "Your details are still in this form, but submissions are not connected yet. Please try again once Liftie has configured its secure registration endpoint.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        status: "server-error",
        message:
          "The registration service could not accept this request. Your details have not been cleared, so you can try again.",
      };
    }

    return {
      status: "success",
      message: "Your request has been received. Liftie will use your organisation and route details to plan network access.",
    };
  } catch {
    return {
      status: "network-error",
      message:
        "We could not reach the registration service. Check your connection and try again. Your details are still here.",
    };
  }
};

export const submitJoinRequest = (payload: Record<string, unknown>) =>
  submitJson(import.meta.env.VITE_LIFTIE_JOIN_ENDPOINT, payload);

export const submitWhitelistRequest = (payload: Record<string, unknown>) =>
  submitJson(import.meta.env.VITE_LIFTIE_WHITELIST_ENDPOINT, payload);
