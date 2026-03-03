import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

const app = new Hono();
const LEGACY_PREFIX = "/make-server-353144cd";
const FUNCTION_PREFIX = "/server";

const routeGet = (path: string, handler: any) => {
  app.get(path, handler);
  app.get(`${LEGACY_PREFIX}${path}`, handler);
  app.get(`${FUNCTION_PREFIX}${path}`, handler);
  app.get(`${FUNCTION_PREFIX}${LEGACY_PREFIX}${path}`, handler);
};

const routePost = (path: string, handler: any) => {
  app.post(path, handler);
  app.post(`${LEGACY_PREFIX}${path}`, handler);
  app.post(`${FUNCTION_PREFIX}${path}`, handler);
  app.post(`${FUNCTION_PREFIX}${LEGACY_PREFIX}${path}`, handler);
};

const routePut = (path: string, handler: any) => {
  app.put(path, handler);
  app.put(`${LEGACY_PREFIX}${path}`, handler);
  app.put(`${FUNCTION_PREFIX}${path}`, handler);
  app.put(`${FUNCTION_PREFIX}${LEGACY_PREFIX}${path}`, handler);
};

const routeDelete = (path: string, handler: any) => {
  app.delete(path, handler);
  app.delete(`${LEGACY_PREFIX}${path}`, handler);
  app.delete(`${FUNCTION_PREFIX}${path}`, handler);
  app.delete(`${FUNCTION_PREFIX}${LEGACY_PREFIX}${path}`, handler);
};

// Create Supabase clients
const getSupabaseAdmin = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
const BUCKET_NAME = "make-353144cd-portfolio";
(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error(`Error initializing bucket: ${error}`);
  }
})();

// Middleware to verify auth
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  const accessToken = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  return user;
}

// Health check endpoint
routeGet("/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTH ROUTES ==========

// Sign up
routePost("/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error(`Auth signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: data.user,
      message: "User created successfully"
    });
  } catch (error) {
    console.error(`Sign up error: ${error}`);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Sign in
routePost("/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`Auth signin error: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }

    return c.json({ 
      success: true,
      access_token: data.session?.access_token,
      user: data.user
    });
  } catch (error) {
    console.error(`Sign in error: ${error}`);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

// Get current session
routeGet("/auth/session", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    return c.json({ 
      success: true,
      user
    });
  } catch (error) {
    console.error(`Session check error: ${error}`);
    return c.json({ error: "Failed to check session" }, 500);
  }
});

// ========== PROFILE ROUTES ==========

// Get profile
routeGet("/profile", async (c) => {
  try {
    const profile = await kv.get('profile') || {
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      avatar: '',
      socials: {
        github: '',
        linkedin: '',
        twitter: '',
      },
      skills: [],
      resumeUrl: ''
    };
    return c.json({ success: true, profile });
  } catch (error) {
    console.error(`Get profile error: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Update profile (protected)
routePut("/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await c.req.json();
    await kv.set('profile', profile);
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.error(`Update profile error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// ========== PROJECTS ROUTES ==========

// Get all projects (public)
routeGet("/projects", async (c) => {
  try {
    const status = c.req.query('status');
    const projects = await kv.get('projects') || [];
    
    let filteredProjects = projects;
    if (status === 'active') {
      filteredProjects = projects.filter((p: any) => p.active);
    }
    
    return c.json({ success: true, projects: filteredProjects });
  } catch (error) {
    console.error(`Get projects error: ${error}`);
    return c.json({ error: "Failed to get projects" }, 500);
  }
});

// Get single project
routeGet("/projects/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const projects = await kv.get('projects') || [];
    const project = projects.find((p: any) => p.id === id);
    
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    return c.json({ success: true, project });
  } catch (error) {
    console.error(`Get project error: ${error}`);
    return c.json({ error: "Failed to get project" }, 500);
  }
});

// Create project (protected)
routePost("/projects", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = await c.req.json();
    const projects = await kv.get('projects') || [];
    
    const newProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    projects.push(newProject);
    await kv.set('projects', projects);
    
    return c.json({ success: true, project: newProject });
  } catch (error) {
    console.error(`Create project error: ${error}`);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

// Update project (protected)
routePut("/projects/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const projects = await kv.get('projects') || [];
    
    const index = projects.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    projects[index] = { ...projects[index], ...updates, id };
    await kv.set('projects', projects);
    
    return c.json({ success: true, project: projects[index] });
  } catch (error) {
    console.error(`Update project error: ${error}`);
    return c.json({ error: "Failed to update project" }, 500);
  }
});

// Delete project (protected)
routeDelete("/projects/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const projects = await kv.get('projects') || [];
    
    const filteredProjects = projects.filter((p: any) => p.id !== id);
    await kv.set('projects', filteredProjects);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Delete project error: ${error}`);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

// ========== EXPERIENCES ROUTES ==========

// Get all experiences (public)
routeGet("/experiences", async (c) => {
  try {
    const experiences = await kv.get('experiences') || [];
    return c.json({ success: true, experiences });
  } catch (error) {
    console.error(`Get experiences error: ${error}`);
    return c.json({ error: "Failed to get experiences" }, 500);
  }
});

// Create experience (protected)
routePost("/experiences", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const experience = await c.req.json();
    const experiences = await kv.get('experiences') || [];
    
    const newExperience = {
      ...experience,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    experiences.push(newExperience);
    await kv.set('experiences', experiences);
    
    return c.json({ success: true, experience: newExperience });
  } catch (error) {
    console.error(`Create experience error: ${error}`);
    return c.json({ error: "Failed to create experience" }, 500);
  }
});

// Update experience (protected)
routePut("/experiences/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const experiences = await kv.get('experiences') || [];
    
    const index = experiences.findIndex((e: any) => e.id === id);
    if (index === -1) {
      return c.json({ error: "Experience not found" }, 404);
    }
    
    experiences[index] = { ...experiences[index], ...updates, id };
    await kv.set('experiences', experiences);
    
    return c.json({ success: true, experience: experiences[index] });
  } catch (error) {
    console.error(`Update experience error: ${error}`);
    return c.json({ error: "Failed to update experience" }, 500);
  }
});

// Delete experience (protected)
routeDelete("/experiences/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const experiences = await kv.get('experiences') || [];
    
    const filteredExperiences = experiences.filter((e: any) => e.id !== id);
    await kv.set('experiences', filteredExperiences);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Delete experience error: ${error}`);
    return c.json({ error: "Failed to delete experience" }, 500);
  }
});

// ========== IMAGE UPLOAD ROUTES ==========

// Upload image (protected)
routePost("/upload", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const supabase = getSupabaseAdmin();
    
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(`Upload error: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000);

    if (signedUrlError) {
      console.error(`Signed URL error: ${signedUrlError.message}`);
      return c.json({ error: signedUrlError.message }, 500);
    }

    return c.json({ 
      success: true, 
      url: signedUrlData.signedUrl,
      path: filePath
    });
  } catch (error) {
    console.error(`Upload file error: ${error}`);
    return c.json({ error: "Failed to upload file" }, 500);
  }
});

// Get signed URL for existing file (protected)
routeGet("/files/:path", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const path = c.req.param('path');
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 31536000);

    if (error) {
      console.error(`Get signed URL error: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ 
      success: true, 
      url: data.signedUrl
    });
  } catch (error) {
    console.error(`Get file URL error: ${error}`);
    return c.json({ error: "Failed to get file URL" }, 500);
  }
});

Deno.serve(app.fetch);
