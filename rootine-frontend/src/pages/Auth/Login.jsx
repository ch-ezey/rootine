import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../app/contexts/auth.context.js";
import { loginUser } from "../../services/api/auth.service.js";
import { getErrorMessage } from "../../services/api/httpClient.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Field, Input } from "../../shared/ui/Field.jsx";
import AuthLayout from "./AuthLayout.jsx";

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-3 text-sm text-danger">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await loginUser(email.trim(), password);
      login(token, user);
      navigate(location.state?.from ?? "/today", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't log you in. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up your routines where you left off."
      footer={
        <>
          New to Rootine?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Email">
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          )}
        </Field>
        <Field label="Password">
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={!email || !password}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
