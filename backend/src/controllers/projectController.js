import Project from '../models/Project.js';
import File from '../models/File.js';
import { deleteFromS3 } from '../config/s3.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, template } = req.body;

    const project = await Project.create({
      userId: req.user._id,
      name,
      description,
      template: template || 'react',
    });

    const rootFolder = await File.create({
      projectId: project._id,
      parentId: null,
      name: name,
      type: 'folder',
    });

    const srcFolder = await File.create({
      projectId: project._id,
      parentId: rootFolder._id,
      name: 'src',
      type: 'folder',
    });

    await File.create([
      {
        projectId: project._id,
        parentId: srcFolder._id,
        name: 'App.js',
        type: 'file',
        content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Welcome to CipherStudio</h1>\n      <p>Start coding your React app!</p>\n    </div>\n  );\n}\n\nexport default App;`,
        extension: 'js',
      },
      {
        projectId: project._id,
        parentId: srcFolder._id,
        name: 'index.js',
        type: 'file',
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
        extension: 'js',
      },
    ]);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating project',
    });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching projects',
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    const files = await File.find({ projectId: project._id });

    project.lastOpenedAt = Date.now();
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        project,
        files,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching project',
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    const { name, description, isPublic } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (isPublic !== undefined) project.isPublic = isPublic;

    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating project',
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    const files = await File.find({ projectId: project._id });

    for (const file of files) {
      if (file.s3Key) {
        try {
          await deleteFromS3(file.s3Key);
        } catch (error) {
          console.error(`Error deleting S3 file: ${file.s3Key}`, error);
        }
      }
    }

    await File.deleteMany({ projectId: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting project',
    });
  }
};
