"use client";

import { useState } from "react";
import Link from "next/link";
import { DUMMY_PHOTOS, Photo, formatDate } from "@/lib/data";

type SortKey = "name" | "date";

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>(DUMMY_PHOTOS);
  const [sort, setSort] = useState<SortKey>("date");
  const [newName, setNewName] = useState("");
  const [uploadError, setUploadError] = useState("");

  const sorted = [...photos].sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name)
      : b.uploadedAt.localeCompare(a.uploadedAt)
  );

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return setUploadError("Name is required.");
    if (newName.length > 40) return setUploadError("Name must be 40 characters or fewer.");

    const photo: Photo = {
      id: Date.now(),
      name: newName.trim(),
      uploadedAt: new Date().toISOString(),
      imageUrl: "/photo.jpg",
    };
    setPhotos((prev) => [...prev, photo]);
    setNewName("");
    setUploadError("");
  }

  function handleDelete(id: number) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="page">
      <h1>Photos</h1>

      {/* Sort controls */}
      <div className="sort-bar">
        <span>Sort by:</span>
        <button className={sort === "date" ? "active" : ""} onClick={() => setSort("date")}>Date</button>
        <button className={sort === "name" ? "active" : ""} onClick={() => setSort("name")}>Name</button>
      </div>

      {/* Photo list */}
      <div className="section" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((photo) => (
              <tr key={photo.id}>
                <td><Link href={`/photos/${photo.id}`}>{photo.name}</Link></td>
                <td>{formatDate(photo.uploadedAt)}</td>
                <td><button className="danger" onClick={() => handleDelete(photo.id)}>Delete</button></td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={3} style={{ color: "#888" }}>No photos yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
          <input id="file" type="file" accept="image/*" />
          {uploadError && <p className="error">{uploadError}</p>}
          <div className="form-actions">
            <button type="submit" className="primary">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}
