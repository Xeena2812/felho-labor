"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";
import { setAuthEmail } from "@/lib/authSession";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!email.trim() || !password) {
			setError("Email and password are required.");
			return;
		}

		try {
			setError("");
			await login(email.trim(), password);
			setAuthEmail(email.trim());
			router.push("/");
			router.refresh();
		} catch {
			setError("Invalid email or password.");
		}
	}

	return (
		<div className="page">
			<h1>Log In</h1>
			<div className="section">
				<form onSubmit={handleSubmit}>
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="text"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
					/>

					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{error && <p className="error">{error}</p>}

					<div className="form-actions">
						<button type="submit" className="primary">Log In</button>
						<Link href="/register">Create account</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
