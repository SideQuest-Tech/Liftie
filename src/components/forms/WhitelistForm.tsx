import { Check, Info, LoaderCircle, Send } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  submitWhitelistRequest,
  type SubmissionState,
} from "../../lib/submissions";
import {
  isPersonalEmail,
  isValidDomain,
  isValidEmail,
  required,
  type FieldErrors,
} from "../../lib/validation";
import { Button } from "../ui/Button";
import { FormField } from "./FormField";

type WhitelistData = {
  organisationName: string;
  organisationType: string;
  website: string;
  domain: string;
  fullName: string;
  workEmail: string;
  role: string;
  commuters: string;
  city: string;
  message: string;
  consent: boolean;
};

const initialData: WhitelistData = {
  organisationName: "",
  organisationType: "",
  website: "",
  domain: "",
  fullName: "",
  workEmail: "",
  role: "",
  commuters: "",
  city: "",
  message: "",
  consent: false,
};

export function WhitelistForm() {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);

  const setField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const next =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : value;
    setForm((current) => ({ ...current, [name]: next }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmission(null);
  };

  const validate = () => {
    const next: FieldErrors = {
      organisationName: required(form.organisationName, "Organisation name"),
      organisationType: required(form.organisationType, "Organisation type"),
      website:
        form.website && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(form.website)
          ? "Enter a complete website address, including https://."
          : "",
      domain: !form.domain.trim()
        ? "Official email domain is required."
        : !isValidDomain(form.domain)
          ? "Enter a valid domain, such as organisation.ac.za."
          : "",
      fullName: required(form.fullName, "Requester's full name"),
      workEmail: !isValidEmail(form.workEmail)
        ? "Enter a valid work email address."
        : isPersonalEmail(form.workEmail)
          ? "Use an official organisation email address."
          : "",
      role: required(form.role, "Role or department"),
      commuters: required(form.commuters, "Potential commuter estimate"),
      city: required(form.city, "City or campus"),
      consent: form.consent ? "" : "Consent is required to submit this review request.",
    };
    const filtered = Object.fromEntries(
      Object.entries(next).filter(([, value]) => value),
    );
    setErrors(filtered);
    const firstError = Object.keys(filtered)[0];
    if (firstError) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`.whitelist-form [name="${firstError}"]`)
          ?.focus();
      });
    }
    return Object.keys(filtered).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submissionLock.current || !validate()) return;
    submissionLock.current = true;
    setSubmitting(true);
    try {
      const result = await submitWhitelistRequest({
        ...form,
        source: "liftie-website",
        submittedAt: new Date().toISOString(),
      });
      setSubmission(result);
      if (result.status === "success") setForm(initialData);
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form className="whitelist-form" onSubmit={onSubmit} noValidate>
      <div className="whitelist-form-heading">
        <span className="mono">DOMAIN REVIEW REQUEST</span>
        <h3>Request organisation access</h3>
        <p>Provide enough context for Liftie to review the official email domain.</p>
      </div>
      <div className="form-grid">
        <FormField
          label="Organisation name"
          name="organisationName"
          value={form.organisationName}
          onChange={setField}
          error={errors.organisationName}
          required
        />
        <FormField
          as="select"
          label="Organisation type"
          name="organisationType"
          value={form.organisationType}
          onChange={setField}
          error={errors.organisationType}
          required
        >
          <option value="">Select a type</option>
          <option>Company or employer</option>
          <option>University</option>
          <option>College</option>
          <option>Hospital</option>
          <option>Business park</option>
          <option>Other institution</option>
        </FormField>
        <FormField
          label="Official website"
          name="website"
          type="url"
          placeholder="https://organisation.co.za"
          value={form.website}
          onChange={setField}
          error={errors.website}
        />
        <FormField
          label="Official email domain"
          name="domain"
          placeholder="organisation.co.za"
          value={form.domain}
          onChange={setField}
          error={errors.domain}
          required
        />
        <FormField
          label="Requester's full name"
          name="fullName"
          value={form.fullName}
          onChange={setField}
          error={errors.fullName}
          autoComplete="name"
          required
        />
        <FormField
          label="Requester's work email"
          name="workEmail"
          type="email"
          value={form.workEmail}
          onChange={setField}
          error={errors.workEmail}
          autoComplete="email"
          required
        />
        <FormField
          label="Role or department"
          name="role"
          value={form.role}
          onChange={setField}
          error={errors.role}
          required
        />
        <FormField
          as="select"
          label="Potential commuters"
          name="commuters"
          value={form.commuters}
          onChange={setField}
          error={errors.commuters}
          required
        >
          <option value="">Select an estimate</option>
          <option>Fewer than 100</option>
          <option>100 to 499</option>
          <option>500 to 1,999</option>
          <option>2,000 to 4,999</option>
          <option>5,000 or more</option>
        </FormField>
        <FormField
          label="City or campus"
          name="city"
          value={form.city}
          onChange={setField}
          error={errors.city}
          required
        />
        <FormField
          as="textarea"
          className="full-field"
          label="Additional context"
          name="message"
          rows={4}
          value={form.message}
          onChange={setField}
          hint="Optional. Do not include personal details about other commuters."
        />
      </div>
      <label className="whitelist-consent">
        <input
          type="checkbox"
          name="consent"
          checked={form.consent}
          onChange={setField}
          aria-invalid={Boolean(errors.consent)}
        />
        <span>I consent to Liftie using these details to assess organisation eligibility and respond when an appropriate channel is available.</span>
      </label>
      {errors.consent && <small className="field-error">{errors.consent}</small>}

      {submission && (
        <div className={`submission-message status-${submission.status}`} role="status">
          {submission.status === "success" ? <Check /> : <Info />}
          <div><strong>{submission.status === "success" ? "Review requested" : "Request not submitted"}</strong><p>{submission.message}</p></div>
        </div>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <><LoaderCircle className="spin" size={17} /> Sending request</>
        ) : (
          <><Send size={16} /> Submit domain review</>
        )}
      </Button>
    </form>
  );
}
