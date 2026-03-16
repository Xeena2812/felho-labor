const AUTH_EMAIL_KEY = "auth_email";
const AUTH_EVENT = "auth-changed";

export function getAuthEmail(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(AUTH_EMAIL_KEY);
}

export function setAuthEmail(email: string): void {
	localStorage.setItem(AUTH_EMAIL_KEY, email);
	window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthEmail(): void {
	localStorage.removeItem(AUTH_EMAIL_KEY);
	window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuthChanged(onChange: () => void): () => void {
	const onStorage = (event: StorageEvent) => {
		if (event.key === AUTH_EMAIL_KEY) {
			onChange();
		}
	};

	const onCustom = () => onChange();

	window.addEventListener("storage", onStorage);
	window.addEventListener(AUTH_EVENT, onCustom);

	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener(AUTH_EVENT, onCustom);
	};
}
