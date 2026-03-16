"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import type { Photo } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { fetchPhotoById } from "@/lib/api";

export default function PhotoPage() {
	const { id } = useParams();
	const [photo, setPhoto] = useState<Photo | null | undefined>(undefined);

	useEffect(() => {
		const numericId = Number(id);
		if (Number.isNaN(numericId)) {
			setPhoto(null);
			return;
		}

		async function load() {
			try {
				const result = await fetchPhotoById(numericId);
				setPhoto(result);
			} catch {
				setPhoto(null);
			}
		}

		void load();
	}, [id]);

	if (photo === undefined) {
		return (
			<div className="page photo-detail">
				<Link href="/">← Back</Link>
				<p className="meta">Loading...</p>
			</div>
		);
	}

	if (!photo) notFound();

	return (
		<div className="page photo-detail">
			<Link href="/">← Back</Link>
			<h1 style={{ marginTop: "1rem" }}>{photo.name}</h1>
			<p className="meta">Uploaded: {formatDate(photo.uploadedAt)}</p>
			<img src={photo.imageUrl} alt={photo.name} />
		</div>
	);
}
