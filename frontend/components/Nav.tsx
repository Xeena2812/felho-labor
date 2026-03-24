"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCurrentUser, logout } from "@/lib/api";
import { clearAuthEmail, getAuthEmail, subscribeAuthChanged } from "@/lib/authSession";

export default function Nav() {
	const router = useRouter();
	const [email, setEmail] = useState<string | null>(null);

	useEffect(() => {
		setEmail(getAuthEmail());
		return subscribeAuthChanged(() => setEmail(getAuthEmail()));
	}, []);

	async function handleLogout() {
		try {
			await logout();
		} finally {
			clearAuthEmail();
			router.push("/");
			router.refresh();
		}
	}

	async function handleDeleteAccount() {
		const confirmed = window.confirm("Are you sure you want to delete your account?");
		if (!confirmed) {
			return;
		}

		try {
			await deleteCurrentUser();
			clearAuthEmail();
			router.push("/");
			router.refresh();
		} catch {
			window.alert("Account deletion failed. Please try again.");
		}
	}

	return (
		<nav>
			<Link href="/" className="brand">📷 Photo as a Service</Link>
			<span className="spacer" />
			{email ? (
				<>
					<span>{email}</span>
					<button className="danger" onClick={handleDeleteAccount}>Delete account</button>
					<button onClick={handleLogout}>Log out</button>
				</>
			) : (
				<>
					<Link href="/login">Log in</Link>
					<Link href="/register">Register</Link>
				</>
			)}
		</nav>
	);
}
