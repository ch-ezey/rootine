import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../app/contexts/auth.context.js";
import { registerUser } from "../../services/api/auth.service.js";
import { getErrorMessage } from "../../services/api/httpClient.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Field, Input } from "../../shared/ui/Field.jsx";
import AuthLayout from "./AuthLayout.jsx";
import { FormError } from "./Login.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the API's rules so most mistakes are caught before submitting
function validate({ name, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  else if (password.length > 72) errors.password = "Use 72 characters or fewer.";
  return errors;
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(form);
  const show = (field) => (touched[field] ? errors[field] : undefined);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(errors).length) return;

    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await registerUser(form.name.trim(), form.email.trim(), form.password);
      // The API signs new users in straight away
      login(token, user);
      toast.success(`Welcome to Rootine, ${user.name.split(" ")[0]}!`);
      navigate("/today", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create your account. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building routines in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Name" error={show("name")}>
          {(p) => (
            <Input
              {...p}
              autoComplete="name"
              placeholder="Alex Morgan"
              value={form.name}
              onChange={update("name")}
              onBlur={blur("name")}
              autoFocus
            />
          )}
        </Field>
        <Field label="Email" error={show("email")}>
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              onBlur={blur("email")}
            />
          )}
        </Field>
        <Field label="Password" error={show("password")} hint="At least 8 characters.">
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={update("password")}
              onBlur={blur("password")}
            />
          )}
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
