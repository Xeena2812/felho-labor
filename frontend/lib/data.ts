export type Photo = {
	id: number;
	name: string;
	uploadedAt: string; // ISO datetime string
	imageUrl: string;
};

export const DUMMY_PHOTOS: Photo[] = [
	{ id: 1, name: "Sunset at the lake", uploadedAt: "2026-01-15T18:30:00", imageUrl: "/photo.jpg" },
	{ id: 2, name: "Mountain hike", uploadedAt: "2026-02-03T10:15:00", imageUrl: "/photo.jpg" },
	{ id: 3, name: "City skyline", uploadedAt: "2026-02-20T20:00:00", imageUrl: "/photo.jpg" },
	{ id: 4, name: "Autumn forest", uploadedAt: "2026-01-28T14:45:00", imageUrl: "/photo.jpg" },
	{ id: 5, name: "Beach morning", uploadedAt: "2026-02-10T08:00:00", imageUrl: "/photo.jpg" },
];

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleString("en-GB", {
		year: "numeric", month: "2-digit", day: "2-digit",
		hour: "2-digit", minute: "2-digit",
	});
}
