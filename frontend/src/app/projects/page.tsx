"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAllProjects, type Project } from "../../api/projects";
import { getAllUsers, type User } from "../../api/users";
import { getAssociatesByProjectId, type Associate } from "../../api/associates";
import AddProjectForm from "../../components/add_project_form/add_project_form";
import AssignUserToProjectForm from "../../components/assign_user_to_project_form/assign_user_to_project_form";
import ProjectDisplay from "../../components/project_display/project_display";
import styles from "./projects_page.module.css";

export default function ProjectsPage() {
  const [projectRefreshKey, setProjectRefreshKey] = useState(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Associate[]>([]);
  const [status, setStatus] = useState("Loading projects...");

  function refresh() {
    setProjectRefreshKey(previous => previous + 1);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [projects, users] = await Promise.all([getAllProjects(), getAllUsers()]);
        const teams = await Promise.all(projects.map(project => getAssociatesByProjectId(project.id)));
        if (active) {
          setProjects(projects);
          setUsers(users);
          setAssignments(teams.flat());
          setStatus("");
        }
      } catch {
        if (active) setStatus("Could not load projects.");
      }
    }
    void load();
    return () => { active = false; };
  }, [projectRefreshKey]);

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.brand}>TCG Project Management Dashboard</div>
          <div className={styles.navLinks}>
            <Link href="/users" className={styles.navButton}>Users</Link>
            <Link href="/projects" className={`${styles.navButton} ${styles.navButtonActive}`}>Projects</Link>
          </div>
        </div>
        <div className={styles.logoWrap}><Image src="/tcg_logo.png" alt="Logo" width={100} height={40} /></div>
      </nav>
      <main className={styles.main}>
        <section className={styles.card}>
          {status ? <p>{status}</p> : (
            <>
              <AddProjectForm users={users} onProjectAdded={refresh} />
              <AssignUserToProjectForm projects={projects} users={users} assignments={assignments} onAssignmentAdded={refresh} />
              <ProjectDisplay projects={projects} users={users} assignments={assignments} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
