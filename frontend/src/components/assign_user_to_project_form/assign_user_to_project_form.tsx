"use client";

import { useState, type FormEvent } from "react";
import { createAssociate, type Associate } from "../../api/associates";
import type { Project } from "../../api/projects";
import type { User } from "../../api/users";
import styles from "../add_project_form/add_project_form.module.css";

type Props = {
  projects: Project[];
  users: User[];
  assignments: Associate[];
  onAssignmentAdded: () => void;
};

export default function AssignUserToProjectForm({ projects, users, assignments, onAssignmentAdded }: Props) {
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const project = projects.find(item => item.id === Number(projectId));
  const availableUsers = users.filter(user =>
    user.id !== project?.project_manager_id &&
    !assignments.some(item => item.project_id === project?.id && item.associate_id === user.id)
  );

  async function assignUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = Number(new FormData(event.currentTarget).get("user"));
    if (!project || !userId) return;
    setSaving(true);
    try {
      await createAssociate({ project_id: project.id, associate_id: userId });
      setMessage("Associate assigned.");
      setProjectId("");
      onAssignmentAdded();
    } catch {
      setMessage("Could not assign this associate. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className={styles.container}>
      <summary>Assign Associate</summary>
      <form onSubmit={assignUser}>
        <label>Project
          <select value={projectId} onChange={event => setProjectId(event.target.value)} required>
            <option value="">Select a project</option>
            {projects.map(item => <option key={item.id} value={item.id}>{item.project_name}</option>)}
          </select>
        </label>
        <label>Associate
          <select key={projectId} name="user" defaultValue="" disabled={!project} required>
            <option value="">Select an associate</option>
            {availableUsers.map(user => <option key={user.id} value={user.id}>{user.user_name}</option>)}
          </select>
        </label>
        <button disabled={saving || !project || !availableUsers.length}>Assign</button>
        <output>{message}</output>
      </form>
    </details>
  );
}
