import type { Photo } from "@/lib/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5062";

export async function fetchPhotos(sortBy: "name" | "date", descending: boolean): Promise<Photo[]> {
	const response = await fetch(`${API_BASE_URL}/api/photos?sortBy=${sortBy}&descending=${descending}`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to load photos.");
	}

	return response.json() as Promise<Photo[]>;
}

export async function fetchPhotoById(id: number): Promise<Photo | null> {
	const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
		credentials: "include",
		cache: "no-store",
	});

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error("Failed to load photo.");
	}

	return response.json() as Promise<Photo>;
}

export async function createPhoto(name: string, imageUrl?: string): Promise<Photo> {
	const response = await fetch(`${API_BASE_URL}/api/photos`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, imageUrl }),
	});

	if (!response.ok) {
		throw new Error("Failed to create photo.");
	}

	return response.json() as Promise<Photo>;
}

export async function deletePhoto(id: number): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to delete photo.");
	}
}

export async function register(email: string, password: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		throw new Error("Registration failed.");
	}
}

export async function login(email: string, password: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		throw new Error("Login failed.");
	}
}

export async function logout(): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Logout failed.");
	}
}
