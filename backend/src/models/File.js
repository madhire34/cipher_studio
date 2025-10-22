import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'File/Folder name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['file', 'folder'],
      required: [true, 'Type is required'],
    },
    s3Key: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: '',
    },
    extension: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ projectId: 1, parentId: 1 });
fileSchema.index({ projectId: 1, type: 1 });

fileSchema.virtual('isFolder').get(function () {
  return this.type === 'folder';
});

const File = mongoose.model('File', fileSchema);

export default File;
