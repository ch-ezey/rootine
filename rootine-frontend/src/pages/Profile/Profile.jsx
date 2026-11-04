import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Trash2 } from "lucide-react";
import { useAuth } from "../../app/contexts/auth.context.js";
import { Avatar } from "../../app/layout/AppShell.jsx";
import { useDeleteMe, useUpdateMe } from "../../services/queries.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Card, PageHeader } from "../../shared/ui/Card.jsx";
import { ConfirmDialog } from "../../shared/ui/Dialog.jsx";
import { Field, Input } from "../../shared/ui/Field.jsx";
import { ThemeSwitcher } from "../../shared/ui/ThemeSwitcher.jsx";

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" }) : "—";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateMe = useUpdateMe();
  const deleteMe = useDeleteMe();

  const dirty = name.trim() && name.trim() !== user.name;

  const saveName = (e) => {
    e.preventDefault();
    updateMe.mutate(
      { name: name.trim() },
      {
        onSuccess: (updated) => {
          setUser(updated);
          toast.success("Name updated");
        },
      },
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Profile" description="Your account details." />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card className="flex flex-col items-center p-6 text-center lg:self-start">
          <Avatar name={user.name} className="size-20 text-2xl" />
          <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-muted">{user.email}</p>
          <dl className="mt-6 grid w-full grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-surface-2 p-3">
              <dt className="text-xs text-muted">Member since</dt>
              <dd className="mt-0.5 text-sm font-medium">{formatDate(user.createdAt)}</dd>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <dt className="text-xs text-muted">Last login</dt>
              <dd className="mt-0.5 text-sm font-medium">{formatDate(user.lastLogin)}</dd>
            </div>
          </dl>
          <Button variant="secondary" icon={LogOut} className="mt-6 w-full" onClick={logout}>
            Log out
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold">Personal details</h2>
            <form onSubmit={saveName} className="mt-5 space-y-4">
              <Field label="Name">
                {(p) => <Input {...p} value={name} maxLength={255} onChange={(e) => setName(e.target.value)} />}
              </Field>
              <Field label="Email" hint="Email changes aren't supported yet.">
                {(p) => <Input {...p} value={user.email} disabled readOnly />}
              </Field>
              <div className="flex justify-end gap-2">
                {dirty && (
                  <Button variant="ghost" onClick={() => setName(user.name)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={!dirty} loading={updateMe.isPending}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-muted">
              Choose a theme, or follow your device's setting. Saved on this device.
            </p>
            <ThemeSwitcher showLabels className="mt-4 flex w-full sm:w-auto" />
          </Card>

          <Card className="border-danger/30 p-6">
            <h2 className="font-semibold text-danger">Delete account</h2>
            <p className="mt-1 text-sm text-muted">
              Permanently deletes your account, routines and tasks. This can't be undone.
            </p>
            <Button variant="danger" icon={Trash2} className="mt-4" onClick={() => setConfirmDelete(true)}>
              Delete my account
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        description="All of your routines and tasks will be permanently deleted."
        confirmLabel="Delete account"
        confirmText="DELETE"
        loading={deleteMe.isPending}
        onConfirm={() =>
          deleteMe.mutate(undefined, {
            onSuccess: () => {
              logout();
              toast.success("Your account has been deleted");
              navigate("/", { replace: true });
            },
          })
        }
      />
    </div>
  );
}
