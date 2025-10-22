import File from '../models/File.js';
import Project from '../models/Project.js';
import { uploadToS3, getFromS3, deleteFromS3 } from '../config/s3.js';

export const createFile = async (req, res) => {
  try {
    const { projectId, parentId, name, type, content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project',
      });
    }

    if (parentId) {
      const parentFolder = await File.findById(parentId);
      if (!parentFolder || parentFolder.type !== 'folder') {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent folder',
        });
      }
    }

    const fileData = {
      projectId,
      parentId: parentId || null,
      name,
      type,
      content: content || '',
    };

    if (type === 'file') {
      const parts = name.split('.');
      fileData.extension = parts.length > 1 ? parts[parts.length - 1] : '';
      fileData.size = content ? content.length : 0;

      if (content) {
        const s3Key = `projects/${projectId}/${Date.now()}_${name}`;
        await uploadToS3(s3Key, content);
        fileData.s3Key = s3Key;
        fileData.content = '';
      }
    }

    const file = await File.create(fileData);

    res.status(201).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating file',
    });
  }
};

export const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const project = await Project.findById(file.projectId);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file',
      });
    }

    if (file.s3Key && !file.content) {
      try {
        file.content = await getFromS3(file.s3Key);
      } catch (error) {
        console.error('Error fetching from S3:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching file',
    });
  }
};

export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
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

    const files = await File.find({ projectId }).sort({ type: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching files',
    });
  }
};

export const updateFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const project = await Project.findById(file.projectId);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this file',
      });
    }

    const { name, content } = req.body;

    if (name) {
      file.name = name;
      if (file.type === 'file') {
        const parts = name.split('.');
        file.extension = parts.length > 1 ? parts[parts.length - 1] : '';
      }
    }

    if (content !== undefined && file.type === 'file') {
      file.content = content;
      file.size = content.length;

      if (file.s3Key) {
        await uploadToS3(file.s3Key, content);
      }
    }

    await file.save();

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating file',
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const project = await Project.findById(file.projectId);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file',
      });
    }

    if (file.type === 'folder') {
      await deleteFolder(file._id);
    } else {
      if (file.s3Key) {
        try {
          await deleteFromS3(file.s3Key);
        } catch (error) {
          console.error('Error deleting from S3:', error);
        }
      }
    }

    await file.deleteOne();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting file',
    });
  }
};

async function deleteFolder(folderId) {
  const children = await File.find({ parentId: folderId });

  for (const child of children) {
    if (child.type === 'folder') {
      await deleteFolder(child._id);
    } else if (child.s3Key) {
      try {
        await deleteFromS3(child.s3Key);
      } catch (error) {
        console.error('Error deleting from S3:', error);
      }
    }
    await child.deleteOne();
  }
}
