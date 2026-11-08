
import { Router } from "express";
import * as projectsController from "../controllers/projects";

const router = Router();

// GET /projects/all - Get all projects
router.get("/all", projectsController.getAllProjects);

// GET /projects/:id - Get project by ID
router.get("/:id", projectsController.getProjectById);

// POST /projects - Create a new project
router.post("/", projectsController.createProject);

// PUT /projects/:id - Update a project by ID
router.put("/:id", projectsController.updateProjectById);

// DELETE /projects/:id - Delete a project by ID
router.delete("/:id", projectsController.deleteProjectById);

// GET /projects/manager/:manager_id - Get projects by manager ID
router.get("/manager/:manager_id", projectsController.getProjectsByManagerId);

export default router;
