"use client";

import { FormEvent, useEffect, useState } from "react";

import { createProject } from "../../api/projects";
import { getAllUsers, type User } from "../../api/users";
import { createAssociate } from "../../api/associates";
import styles from "./add_project_form.module.css";

type AddProjectFormState = {
	project_name: string;
	project_manager_id: string;
	project_description: string;
};

const initialFormState: AddProjectFormState = {
	project_name: "",
	project_manager_id: "",
	project_description: "",
};

type AddProjectFormProps = {
	onProjectAdded?: () => void;
};

export default function AddProjectForm({ onProjectAdded }: AddProjectFormProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingUsers, setIsLoadingUsers] = useState(true);
	const [users, setUsers] = useState<User[]>([]);
	const [associateList, setAssociateList] = useState<number[]>([]);
	const [selectedAssociateId, setSelectedAssociateId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [formData, setFormData] = useState<AddProjectFormState>(initialFormState);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const allUsers = await getAllUsers();
				setUsers(allUsers);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load users";
				setError(message);
			} finally {
				setIsLoadingUsers(false);
			}
		};

		void loadUsers();
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (!formData.project_name || !formData.project_manager_id || !formData.project_description) {
			setError("All fields are required.");
			return;
		}

		const managerIdNumber = Number(formData.project_manager_id);
		if (Number.isNaN(managerIdNumber)) {
			setError("Please select a valid project manager.");
			return;
		}

		try {
			setIsSubmitting(true);
			const createdProject = await createProject({
				project_name: formData.project_name,
				project_manager_id: managerIdNumber,
				project_description: formData.project_description,
			});

			for (const associateId of associateList) {
				await createAssociate({
					project_id: createdProject.id,
					associate_id: associateId,
				});
			}

			onProjectAdded?.();

			setFormData(initialFormState);
			setAssociateList([]);
			setSelectedAssociateId("");
			setSuccessMessage("Project added successfully.");
			setIsExpanded(false);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create project.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className={styles.container}>
			<button
				className={styles.toggleButton}
				type="button"
				onClick={() => {
					setIsExpanded((previous) => !previous);
					setError(null);
					setSuccessMessage(null);
				}}
				aria-expanded={isExpanded}
				aria-controls="add-project-form"
			>
				{isExpanded ? "Hide Add Project Form" : "Add Project"}
			</button>

			{isExpanded && (
				<form id="add-project-form" className={styles.form} onSubmit={handleSubmit}>
					<label className={styles.label}>
						Project Name
						<input
							className={styles.input}
							type="text"
							value={formData.project_name}
							onChange={(event) =>
								setFormData((previous) => ({ ...previous, project_name: event.target.value }))
							}
						/>
					</label>

					<label className={styles.label}>
						Project Manager
						<select
							className={styles.input}
							value={formData.project_manager_id}
							onChange={(event) =>
								setFormData((previous) => ({ ...previous, project_manager_id: event.target.value }))
							}
							disabled={isLoadingUsers}
						>
							<option value="">Select a user</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.user_name} ({user.id})
								</option>
							))}
						</select>
					</label>

					<label className={styles.label}>
						Project Description
						<textarea
							className={styles.textarea}
							value={formData.project_description}
							onChange={(event) =>
								setFormData((previous) => ({ ...previous, project_description: event.target.value }))
							}
						/>
					</label>

					<div className={styles.associateSection}>
						<label className={styles.label}>
							Add Associates
							<select
								className={styles.input}
								value={selectedAssociateId}
								onChange={(event) => setSelectedAssociateId(event.target.value)}
								disabled={isLoadingUsers}
							>
								<option value="">Select a user to add</option>
								{users.map((user) => (
									<option key={user.id} value={user.id}>
										{user.user_name} ({user.id})
									</option>
								))}
							</select>
						</label>

						<button
							type="button"
							className={styles.secondaryButton}
							onClick={() => {
								if (!selectedAssociateId) {
									return;
								}
								const associateIdNumber = Number(selectedAssociateId);
								if (Number.isNaN(associateIdNumber)) {
									return;
								}
								setAssociateList((previous) => {
									if (previous.includes(associateIdNumber)) {
										return previous;
									}
									return [...previous, associateIdNumber];
								});
								setSelectedAssociateId("");
							}}
						>
							Add Associate
						</button>

						{associateList.length > 0 && (
							<ul className={styles.associateList}>
								{associateList.map((associateId) => {
									const associateUser = users.find((user) => user.id === associateId);
									return (
										<li key={associateId} className={styles.associateItem}>
											<span>
												{associateUser ? `${associateUser.user_name} (${associateId})` : `User ${associateId}`}
											</span>
											<button
												type="button"
												className={styles.removeButton}
												onClick={() =>
													setAssociateList((previous) =>
														previous.filter((id) => id !== associateId),
													)
												}
											>
												Remove
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</div>

					<button
						className={styles.submitButton}
						type="submit"
						disabled={isSubmitting || isLoadingUsers}
					>
						{isSubmitting ? "Saving..." : "Save Project"}
					</button>
				</form>
			)}

			{error && <p className={styles.error}>{error}</p>}
			{successMessage && <p className={styles.success}>{successMessage}</p>}
		</section>
	);
}
