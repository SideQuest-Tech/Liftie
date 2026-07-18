import { AlertCircle, ArrowRight, Check, Info, LoaderCircle } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  submitJoinRequest,
  type SubmissionState,
} from "../../lib/submissions";
import {
  isPersonalEmail,
  isValidEmail,
  required,
  type FieldErrors,
} from "../../lib/validation";
import { Button } from "../ui/Button";
import { FormField } from "./FormField";
import { Modal } from "./Modal";

export type CommuteRole = "rider" | "driver" | "both";

type JoinNetworkModalProps = {
  open: boolean;
  onClose: () => void;
  initialRole: CommuteRole;
};

type JoinForm = {
  fullName: string;
  email: string;
  organisation: string;
  organisationType: string;
  city: string;
  role: CommuteRole;
  startArea: string;
  destinationArea: string;
  morningTime: string;
  afternoonTime: string;
  weekdays: string[];
  detour: string;
  seats: string;
  updatesConsent: boolean;
  termsAccepted: boolean;
};

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const initialForm: JoinForm = {
  fullName: "",
  email: "",
  organisation: "",
  organisationType: "",
  city: "",
  role: "rider",
  startArea: "",
  destinationArea: "",
  morningTime: "07:00",
  afternoonTime: "17:00",
  weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  detour: "3",
  seats: "2",
  updatesConsent: false,
  termsAccepted: false,
};

const savedProgressKey = "liftie-join-preferences";

export function JoinNetworkModal({
  open,
  onClose,
  initialRole,
}: JoinNetworkModalProps) {
  const [form, setForm] = useState<JoinForm>(() => {
    try {
      const saved = localStorage.getItem(savedProgressKey);
      if (!saved) return { ...initialForm, role: initialRole };
      const progress = JSON.parse(saved) as Partial<JoinForm>;
      return { ...initialForm, ...progress, role: initialRole };
    } catch {
      return { ...initialForm, role: initialRole };
    }
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);

  useEffect(() => {
    // Only low-risk preferences are retained. Names, emails, organisations, and
    // route areas remain in component memory and are not written to storage.
    const safeProgress = {
      organisationType: form.organisationType,
      city: form.city,
      role: form.role,
      morningTime: form.morningTime,
      afternoonTime: form.afternoonTime,
      weekdays: form.weekdays,
      detour: form.detour,
      seats: form.seats,
    };
    localStorage.setItem(savedProgressKey, JSON.stringify(safeProgress));
  }, [
    form.afternoonTime,
    form.city,
    form.detour,
    form.morningTime,
    form.organisationType,
    form.role,
    form.seats,
    form.weekdays,
  ]);

  const setField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const nextValue =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmission(null);
  };

  const toggleWeekday = (day: string) => {
    setForm((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((item) => item !== day)
        : [...current.weekdays, day],
    }));
    setErrors((current) => ({ ...current, weekdays: "" }));
  };

  const validate = () => {
    const next: FieldErrors = {
      fullName: required(form.fullName, "Full name"),
      email: !form.email.trim()
        ? "Official organisation email is required."
        : !isValidEmail(form.email)
          ? "Enter a valid email address."
          : isPersonalEmail(form.email)
            ? "Use your official employer or university email address."
            : "",
      organisation: required(form.organisation, "Organisation name"),
      organisationType: required(form.organisationType, "Organisation type"),
      city: required(form.city, "City"),
      startArea: required(form.startArea, "General starting area"),
      destinationArea: required(form.destinationArea, "General destination area"),
      weekdays: form.weekdays.length ? "" : "Select at least one weekday.",
      termsAccepted: form.termsAccepted
        ? ""
        : "Accept the privacy notice and terms to continue.",
    };
    const filtered = Object.fromEntries(
      Object.entries(next).filter(([, value]) => value),
    );
    setErrors(filtered);
    const firstError = Object.keys(filtered)[0];
    if (firstError) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`.join-form [name="${firstError}"]`)
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
    setSubmission(null);
    try {
      const result = await submitJoinRequest({
        ...form,
        source: "liftie-website",
        submittedAt: new Date().toISOString(),
      });
      setSubmission(result);
      if (result.status === "success") {
        localStorage.removeItem(savedProgressKey);
      }
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  const isDriver = form.role === "driver" || form.role === "both";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add your route to the network."
      description="Tell Liftie about your normal routine. General areas are enough at this stage, so do not enter an exact home address."
    >
      <form className="join-form" onSubmit={onSubmit} noValidate>
        <div className="form-section">
          <div className="form-section-title">
            <span>01</span>
            <div><h3>Organisation access</h3><p>We use an official domain to establish organisation affiliation.</p></div>
          </div>
          <div className="form-grid">
            <FormField
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={setField}
              autoComplete="name"
              error={errors.fullName}
              required
            />
            <FormField
              label="Official organisation email"
              name="email"
              type="email"
              value={form.email}
              onChange={setField}
              autoComplete="email"
              error={errors.email}
              hint={
                isPersonalEmail(form.email) ? (
                  <span className="field-warning"><AlertCircle size={13} /> Personal email domains cannot establish organisation affiliation.</span>
                ) : (
                  "No ID upload is required for initial organisation verification."
                )
              }
              required
            />
            <FormField
              label="Organisation name"
              name="organisation"
              value={form.organisation}
              onChange={setField}
              autoComplete="organization"
              error={errors.organisation}
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
              <option>Employer</option>
              <option>University</option>
              <option>College</option>
              <option>Hospital</option>
              <option>Business park</option>
              <option>Other institution</option>
            </FormField>
            <FormField
              label="City or campus"
              name="city"
              value={form.city}
              onChange={setField}
              autoComplete="address-level2"
              error={errors.city}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>02</span>
            <div><h3>Your commute role</h3><p>Choose how you expect to use recurring journeys.</p></div>
          </div>
          <fieldset className="role-picker">
            <legend className="sr-only">Rider, driver, or both</legend>
            {(["rider", "driver", "both"] as const).map((role) => (
              <label key={role} className={form.role === role ? "selected" : ""}>
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={setField}
                />
                <span>{role === "both" ? "Rider and driver" : role[0].toUpperCase() + role.slice(1)}</span>
                {form.role === role && <Check size={16} aria-hidden="true" />}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>03</span>
            <div><h3>Your general routine</h3><p>General suburb or campus areas only, not street addresses.</p></div>
          </div>
          <div className="form-grid">
            <FormField
              label="General starting area"
              name="startArea"
              value={form.startArea}
              onChange={setField}
              error={errors.startArea}
              hint="For example, Midrand or Rosebank."
              required
            />
            <FormField
              label="General destination area"
              name="destinationArea"
              value={form.destinationArea}
              onChange={setField}
              error={errors.destinationArea}
              hint="For example, Hatfield campus."
              required
            />
            <FormField
              label="Morning commute time"
              name="morningTime"
              type="time"
              value={form.morningTime}
              onChange={setField}
              required
            />
            <FormField
              label="Afternoon commute time"
              name="afternoonTime"
              type="time"
              value={form.afternoonTime}
              onChange={setField}
              required
            />
          </div>
          <fieldset className="weekday-field">
            <legend>Usual weekdays *</legend>
            <div>
              {weekdays.map((day) => (
                <label key={day} className={form.weekdays.includes(day) ? "selected" : ""}>
                  <input
                    type="checkbox"
                    checked={form.weekdays.includes(day)}
                    onChange={() => toggleWeekday(day)}
                  />
                  {day.slice(0, 3)}
                </label>
              ))}
            </div>
            {errors.weekdays && <small className="field-error">{errors.weekdays}</small>}
          </fieldset>

          {isDriver && (
            <div className="form-grid driver-fields">
              <FormField
                label="Maximum driver detour"
                name="detour"
                as="select"
                value={form.detour}
                onChange={setField}
                required
              >
                {[1, 2, 3, 4, 5, 7, 10].map((value) => (
                  <option key={value} value={value}>{value} km</option>
                ))}
              </FormField>
              <FormField
                label="Available seats"
                name="seats"
                as="select"
                value={form.seats}
                onChange={setField}
                required
              >
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </FormField>
            </div>
          )}
        </div>

        <div className="consent-stack">
          <label>
            <input
              type="checkbox"
              name="updatesConsent"
              checked={form.updatesConsent}
              onChange={setField}
            />
            <span>Send me Liftie network and route updates.</span>
          </label>
          <label>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={setField}
              aria-invalid={Boolean(errors.termsAccepted)}
              aria-describedby={errors.termsAccepted ? "terms-error" : undefined}
            />
            <span>I accept the planned privacy notice and terms for this prelaunch request. *</span>
          </label>
          {errors.termsAccepted && <small id="terms-error" className="field-error">{errors.termsAccepted}</small>}
        </div>

        {submission && (
          <div className={`submission-message status-${submission.status}`} role="status">
            {submission.status === "success" ? <Check /> : <Info />}
            <div><strong>{submission.status === "success" ? "Request received" : "Submission not completed"}</strong><p>{submission.message}</p></div>
          </div>
        )}

        <div className="form-actions">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <><LoaderCircle className="spin" size={17} /> Sending request</>
            ) : (
              <>Register my route <ArrowRight size={17} /></>
            )}
          </Button>
          <p>Your exact home address is not requested or needed here.</p>
        </div>
      </form>
    </Modal>
  );
}
