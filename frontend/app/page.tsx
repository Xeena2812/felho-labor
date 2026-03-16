"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Photo } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { createPhoto, deletePhoto, fetchPhotos } from "@/lib/api";
import { getAuthEmail, subscribeAuthChanged } from "@/lib/authSession";

type SortKey = "name" | "date";
type SortDirection = "asc" | "desc";

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setCurrentUserEmail(getAuthEmail());
    return subscribeAuthChanged(() => setCurrentUserEmail(getAuthEmail()));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setApiError("");
        const result = await fetchPhotos(sortBy, sortDirection === "desc");
        setPhotos(result);
      } catch {
        setApiError("Could not load photos from backend.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [sortBy, sortDirection]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      setSelectedFile(null);
      return;
    }

    setUploadError("");
    setSelectedFile(file);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserEmail) return setUploadError("Please log in to upload photos.");
    if (!newName.trim()) return setUploadError("Name is required.");
    if (newName.length > 40) return setUploadError("Name must be 40 characters or fewer.");

    try {
      setUploadError("");
      const created = await createPhoto(newName.trim(), selectedFile);
      setPhotos((prev) => [created, ...prev]);
      setNewName("");
      setSelectedFile(null);
    } catch {
      setUploadError("Upload failed. Please try again.");
    }
  }

  async function handleDelete(id: number) {
    if (!currentUserEmail) {
      setApiError("Please log in to delete photos.");
      return;
    }

    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setApiError("Delete failed. Please refresh and try again.");
    }
  }

  return (
    <div className="page">
      <h1>Photos</h1>

      <div className="sort-bar">
        <span>Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          aria-label="Sort field"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
        </select>
        <span>Order:</span>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value as SortDirection)}
          aria-label="Sort direction"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      {apiError && <p className="error" style={{ marginBottom: "0.75rem" }}>{apiError}</p>}

      <div className="section" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Uploaded</th>
              {currentUserEmail && <th></th>}
            </tr>
          </thead>
          <tbody>
            {!loading && photos.map((photo) => (
              <tr key={photo.id}>
                <td><Link href={`/photos/${photo.id}`}>{photo.name}</Link></td>
                <td>{formatDate(photo.uploadedAt)}</td>
                {currentUserEmail && (
                  <td><button className="danger" onClick={() => handleDelete(photo.id)}>Delete</button></td>
                )}
              </tr>
            ))}
            {loading && (
              <tr><td colSpan={3} style={{ color: "#888" }}>Loading...</td></tr>
            )}
            {!loading && photos.length === 0 && (
              <tr><td colSpan={3} style={{ color: "#888" }}>No photos yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {currentUserEmail && (
        <div className="section">
          <h2>Upload Photo</h2>
          <form onSubmit={handleUpload}>
            <label htmlFor="name">Name (max 40 chars)</label>
            <input
              id="name"
              type="text"
              maxLength={40}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My photo"
            />
            <label htmlFor="file">File</label>
            <input id="file" type="file" accept="image/*" onChange={handleFileChange} />
            {uploadError && <p className="error">{uploadError}</p>}
            <div className="form-actions">
              <button type="submit" className="primary">Upload</button>
            </div>
          </form>
        </div>
      )}

      {!currentUserEmail && (
        <p style={{ color: "#555" }}>
          <Link href="/login">Log in</Link> to upload and delete photos.
        </p>
      )}
    </div>
  );
}
