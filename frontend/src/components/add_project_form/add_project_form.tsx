"use client";

import { useState, type FormEvent } from "react";
import { createProject } from "../../api/projects";
import type { User } from "../../api/users";
import styles from "./add_project_form.module.css";

type Props = { users: User[]; onProjectAdded: () => void };

export default function AddProjectForm({ users, onProjectAdded }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get("name")).trim();
    const description = String(fields.get("description")).trim();
    if (!name || !description) {
      setMessage("Enter a project name and description.");
      return;
    }

    setSaving(true);
    try {
      await createProject({
        project_name: name,
        project_manager_id: Number(fields.get("manager")),
        project_description: description,
      });
      form.reset();
      setMessage("Project added.");
      onProjectAdded();
    } catch {
      setMessage("Could not save the project. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className={styles.container}>
      <summary>Add Project</summary>
      <form onSubmit={saveProject}>
        <label>Project Name<input name="name" required /></label>
        <label>Project Manager
          <select name="manager" defaultValue="" required>
            <option value="">Select a manager</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.user_name}</option>)}
          </select>
        </label>
        <label>Project Description<textarea name="description" required /></label>
        <button disabled={saving}>Save Project</button>
        <output>{message}</output>
      </form>
    </details>
  );
}
