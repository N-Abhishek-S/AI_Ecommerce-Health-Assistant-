export default function Admin() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold">Admin Panel</h1>
      <p className="opacity-70">
        Add/edit/delete products, upload images, and manage details. This is a
        placeholder page.
      </p>
      <div className="mt-6 rounded-3xl border p-6 bg-neutral-50 dark:bg-neutral-900/60">
        <p>
          Connect a real database (Neon, Supabase) and storage (Firebase
          Storage) to make this live.
        </p>
      </div>
    </div>
  );
}
