export default function Auth() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-extrabold">Sign in / Register</h1>
      <p className="opacity-70">
        Email/password auth and social logins can be integrated with Firebase or
        Supabase. This is a placeholder.
      </p>
      <div className="mt-6 grid gap-3">
        <input
          aria-label="Email"
          placeholder="Email"
          className="px-4 py-3 rounded-2xl border"
        />
        <input
          aria-label="Password"
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-2xl border"
        />
        <button className="px-4 py-3 rounded-2xl font-extrabold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
          Continue
        </button>
        <button className="px-4 py-3 rounded-2xl font-semibold bg-neutral-200">
          Continue with Google
        </button>
      </div>
    </div>
  );
}
