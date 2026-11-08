import { Request, Response } from "express";
import { supabase } from "../app";

const checkUserExists = async (userId: number) => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
    if (error) {
        console.error("Error checking if user exists:", error);
        return false;
    }
    return !!data;
};

// GET /project/:id - Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
    if (error) {
        console.error("Error fetching project by ID:", error);
        return res.status(500).json({ error: "Failed to fetch project" });
    }
    return res.json(data);
};

// GET /project/all - Get all projects
export const getAllProjects = async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("projects")
        .select("*");
    if (error) {
        console.error("Error fetching all projects:", error);
        return res.status(500).json({ error: "Failed to fetch projects" });
    }
    return res.json(data);
};

// POST /project - Create a new project
export const createProject = async (req: Request, res: Response) => {
    const { project_name, project_manager_id, project_description } = req.body;
    // check if manager ID is in the users table
    const managerExists = await checkUserExists(parseInt(project_manager_id));
    if (!managerExists) {
        return res.status(400).json({ error: "Invalid project manager ID" });
    }
    const projectData = {
        ...(project_name !== undefined && { project_name }),
        ...(project_manager_id !== undefined && { project_manager_id }),
        ...(project_description !== undefined && { project_description }),
    };
    const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select("*")
        .single();
    if (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ error: "Failed to create project" });
    }
    return res.status(201).json(data);
};

// PUT /project/:id - Update a project by ID
export const updateProjectById = async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { project_name, project_manager_id, project_description } = req.body;
    if (project_manager_id !== undefined) {
        // check if manager ID is in the users table
        const managerExists = await checkUserExists(parseInt(project_manager_id));
        if (!managerExists) {
            return res.status(400).json({ error: "Invalid project manager ID" });
        }
    }
    const projectData = {
        ...(project_name !== undefined && { project_name }),
        ...(project_manager_id !== undefined && { project_manager_id }),
        ...(project_description !== undefined && { project_description }),
    };
    const { data, error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", projectId)
        .select("*")
        .single();
    if (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ error: "Failed to update project" });
    }
    return res.json(data);
};

// DELETE /project/:id - Delete a project by ID
export const deleteProjectById = async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { data, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .select("*")
        .single();
    if (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ error: "Failed to delete project" });
    }
    return res.json(data);
};

// GET /project/manager/:manager_id - Get projects by manager ID
export const getProjectsByManagerId = async (req: Request, res: Response) => {
    const managerId = req.params.manager_id;
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("project_manager_id", managerId);
    if (error) {
        console.error("Error fetching projects by manager ID:", error);
        return res.status(500).json({ error: "Failed to fetch projects" });
    }
    return res.json(data);
};