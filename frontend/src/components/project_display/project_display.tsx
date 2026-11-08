import type { Project } from "../../api/projects";
import type { User } from "../../api/users";
import type { Associate } from "../../api/associates";
import styles from "./project_display.module.css";

type Props = { projects: Project[]; users: User[]; assignments: Associate[] };

export default function ProjectDisplay({ projects, users, assignments }: Props) {
    function userName(id: number) {
        return users.find(user => user.id === id)?.user_name ?? `User ${id}`;
    }

    function associateNames(projectId: number) {
        const members = assignments.filter(item => item.project_id === projectId);
        return members.map(item => userName(item.associate_id)).join(", ") || "None";
    }

	if (projects.length === 0) {
		return <p>No projects found.</p>;
	}

	return (
		<div className={styles.tableWrap}>
			<table className={styles.table}>
				<thead className={styles.head}>
					<tr>
						<th className={styles.cell}>ID</th>
						<th className={styles.cell}>Project Name</th>
						<th className={styles.cell}>Manager</th>
						<th className={styles.cell}>Associates</th>
						<th className={styles.cell}>Description</th>
					</tr>
				</thead>
				<tbody>
					{projects.map((project) => (
						<tr key={project.id} className={styles.row}>
							<td className={styles.cell}>{project.id}</td>
							<td className={styles.cell}>{project.project_name}</td>
							<td className={styles.cell}>
								{userName(project.project_manager_id)}
							</td>
							<td className={styles.cell}>
								{associateNames(project.id)}
							</td>
							<td className={styles.cell}>{project.project_description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
