"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { DUMMY_PHOTOS, formatDate } from "@/lib/data";

export default function PhotoPage() {
	const { id } = useParams();
	const photo = DUMMY_PHOTOS.find((p) => p.id === Number(id));

	if (!photo) notFound();

	return (
		<div className="page photo-detail">
			<Link href="/">← Back</Link>
			<h1 style={{ marginTop: "1rem" }}>{photo.name}</h1>
			<p className="meta">Uploaded: {formatDate(photo.uploadedAt)}</p>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={photo.imageUrl} alt={photo.name} />
		</div>
	);
}
