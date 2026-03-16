export type Photo = {
	id: number;
	name: string;
	uploadedAt: string; // ISO datetime string
	imageUrl: string;
};

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleString("en-GB", {
		year: "numeric", month: "2-digit", day: "2-digit",
		hour: "2-digit", minute: "2-digit",
	});
}
