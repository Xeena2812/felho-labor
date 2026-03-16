"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api";

export default function RegisterPage() {
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
			await register(email.trim(), password);
			router.push("/login");
		} catch {
			setError("Registration failed. Email may already be used.");
		}
	}

	return (
		<div className="page">
			<h1>Register</h1>
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
						<button type="submit" className="primary">Register</button>
						<Link href="/login">Back to login</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
