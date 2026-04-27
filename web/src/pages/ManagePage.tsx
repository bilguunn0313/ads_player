import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function ManagePage() {
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      setVideos(await res.json());
    } catch {
      setError("Failed to load videos");
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append("video", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      if (fileInput.current) fileInput.current.value = "";
      await fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    setError(null);

    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      await fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Manage Videos</h1>
          <Link
            to="/"
            className="rounded bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition"
          >
            Back to Player
          </Link>
        </div>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          className="mb-8 flex gap-3 items-center"
        >
          <input
            ref={fileInput}
            type="file"
            accept=".mp4,.webm,.ogg,.mov"
            className="flex-1 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:text-white file:cursor-pointer hover:file:bg-blue-500"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Video list */}
        {videos.length === 0 ? (
          <p className="text-white/40">No videos yet.</p>
        ) : (
          <ul className="space-y-2">
            {videos.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between rounded bg-white/5 px-4 py-3"
              >
                <span className="truncate mr-4 text-sm">{name}</span>
                <button
                  onClick={() => handleDelete(name)}
                  className="shrink-0 rounded bg-red-600/80 px-3 py-1 text-xs hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
