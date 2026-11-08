import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

import userRoutes from "./routes/users";
import projectRoutes from "./routes/projects";
import associateRoutes from "./routes/associates";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Create Express app
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  }),
);

app.use(express.json());

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/associates", associateRoutes);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase environment variables are not set properly.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log("Supabase client initialized successfully.");

// Start the server and listen on the specified port
app.listen(Number(process.env.BACKEND_PORT || 4000), "localhost", () => {
    console.log(`Server is running on port ${process.env.BACKEND_PORT || 4000}`);
});