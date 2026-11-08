"use client";

import { FormEvent, useEffect, useState } from "react";

import { createAssociate, getAssociatesByProjectId } from "../../api/associates";
import { getAllProjects, type Project } from "../../api/projects";
import { getAllUsers, type User } from "../../api/users";
import styles from "./assign_user_to_project_form.module.css";

type AssignUserToProjectFormProps = {
	onAssignmentAdded?: () => void;
};

export default function AssignUserToProjectForm({ onAssignmentAdded }: AssignUserToProjectFormProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [projects, setProjects] = useState<Project[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [alreadyAssignedIds, setAlreadyAssignedIds] = useState<number[]>([]);
	const [selectedProjectId, setSelectedProjectId] = useState("");
	const [selectedAssociateId, setSelectedAssociateId] = useState("");
	const [associateList, setAssociateList] = useState<number[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!isExpanded) return;
		const loadData = async () => {
			setIsLoading(true);
			try {
				const [allProjects, allUsers] = await Promise.all([getAllProjects(), getAllUsers()]);
				setProjects(allProjects);
				setUsers(allUsers);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load projects and users";
				setError(message);
			} finally {
				setIsLoading(false);
			}
		};

		void loadData();
	}, [isExpanded]);

	useEffect(() => {
		const loadAssignedUsersForProject = async () => {
			if (!selectedProjectId) {
				setAlreadyAssignedIds([]);
				return;
			}

			const projectIdNumber = Number(selectedProjectId);
			if (Number.isNaN(projectIdNumber)) {
				setAlreadyAssignedIds([]);
				return;
			}

			try {
				const associates = await getAssociatesByProjectId(projectIdNumber);
				setAlreadyAssignedIds(associates.map((associate) => associate.associate_id));
			} catch {
				setAlreadyAssignedIds([]);
			}
		};

		void loadAssignedUsersForProject();
	}, [selectedProjectId]);

	const selectedProject = projects.find((project) => String(project.id) === selectedProjectId);
	const blockedUserIds = new Set<number>([
		...alreadyAssignedIds,
		...(selectedProject ? [selectedProject.project_manager_id] : []),
		...associateList,
	]);
	const assignableUsers = users.filter((user) => !blockedUserIds.has(user.id));

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (!selectedProjectId) {
			setError("Please select a project.");
			return;
		}

		if (associateList.length === 0) {
			setError("Please add at least one user assignment.");
			return;
		}

		const projectIdNumber = Number(selectedProjectId);
		if (Number.isNaN(projectIdNumber)) {
			setError("Invalid project selected.");
			return;
		}

		try {
			setIsSubmitting(true);

			for (const associateId of associateList) {
				await createAssociate({
					project_id: projectIdNumber,
					associate_id: associateId,
				});
			}

			onAssignmentAdded?.();
			setAssociateList([]);
			setSelectedAssociateId("");
			setSelectedProjectId("");
			setAlreadyAssignedIds([]);
			setSuccessMessage("Assignments created successfully.");
			setIsExpanded(false);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create assignments.";
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
				aria-controls="assign-user-to-project-form"
			>
				{isExpanded ? "Hide Assignment Form" : "Assign Users To Project"}
			</button>

			{isExpanded && (
				<form id="assign-user-to-project-form" className={styles.form} onSubmit={handleSubmit}>
					<label className={styles.label}>
						Project
						<select
							className={styles.input}
							value={selectedProjectId}
							onChange={(event) => {
                                setSelectedProjectId(event.target.value);
                                setSelectedAssociateId("");
                                setAssociateList([]);
                            }}
							disabled={isLoading}
						>
							<option value="">Select a project</option>
							{projects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.project_name} ({project.id})
								</option>
							))}
						</select>
					</label>

					<label className={styles.label}>
						User
						<select
							className={styles.input}
							value={selectedAssociateId}
							onChange={(event) => setSelectedAssociateId(event.target.value)}
							disabled={isLoading || !selectedProjectId}
						>
							<option value="">Select a user to assign</option>
							{assignableUsers.map((user) => (
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
							if (blockedUserIds.has(associateIdNumber)) {
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
						Add To Assignment List
					</button>

					{selectedProject && (
						<p className={styles.helperText}>
							Manager ({selectedProject.project_manager_id}) and already-assigned users are excluded.
						</p>
					)}

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
												setAssociateList((previous) => previous.filter((id) => id !== associateId))
											}
										>
											Remove
										</button>
									</li>
								);
							})}
						</ul>
					)}

					<button className={styles.submitButton} type="submit" disabled={isSubmitting || isLoading}>
						{isSubmitting ? "Saving..." : "Create Assignments"}
					</button>
				</form>
			)}

			{error && <p className={styles.error}>{error}</p>}
			{successMessage && <p className={styles.success}>{successMessage}</p>}
		</section>
	);
}
