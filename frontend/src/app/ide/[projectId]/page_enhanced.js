'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { projectAPI, fileAPI } from '@/lib/api'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Code2, 
  Save, 
  ArrowLeft, 
  FileText, 
  Folder, 
  FolderPlus,
  FilePlus,
  Trash2,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function IDEPageEnhanced() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [sandpackFiles, setSandpackFiles] = useState({})
  const [activeFile, setActiveFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  
  // New state for file management
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [selectedParent, setSelectedParent] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchProject()
  }, [user, router, params.projectId])

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getById(params.projectId)
      setProject(response.data.data.project)
      setFiles(response.data.data.files)
      
      // Convert files to Sandpack format
      const sandpackFilesObj = {}
      response.data.data.files.forEach(file => {
        if (file.type === 'file') {
          const path = getFilePath(file, response.data.data.files)
          sandpackFilesObj[path] = {
            code: file.content || ''
          }
        }
      })
      
      setSandpackFiles(sandpackFilesObj)
      
      // Set first file as active
      const firstFile = response.data.data.files.find(f => f.type === 'file')
      if (firstFile) {
        setActiveFile(firstFile._id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getFilePath = (file, allFiles) => {
    const parts = [file.name]
    let current = file
    
    while (current.parentId) {
      const parent = allFiles.find(f => f._id === current.parentId)
      if (parent && parent.name !== project?.name) {
        parts.unshift(parent.name)
      }
      current = parent || { parentId: null }
    }
    
    return '/' + parts.join('/')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const file of files) {
        if (file.type === 'file') {
          const path = getFilePath(file, files)
          const sandpackFile = sandpackFiles[path]
          
          if (sandpackFile && sandpackFile.code !== file.content) {
            await fileAPI.update(file._id, { content: sandpackFile.code })
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Project saved successfully",
      })
      fetchProject() // Refresh to get latest data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFile = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "File name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      await fileAPI.create({
        projectId: params.projectId,
        parentId: selectedParent,
        name: newItemName,
        type: 'file',
        content: '// New file\n'
      })
      
      toast({
        title: "Success",
        description: `File "${newItemName}" created`,
      })
      
      setShowNewFileModal(false)
      setNewItemName('')
      fetchProject()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create file",
        variant: "destructive",
      })
    }
  }

  const handleCreateFolder = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      await fileAPI.create({
        projectId: params.projectId,
        parentId: selectedParent,
        name: newItemName,
        type: 'folder'
      })
      
      toast({
        title: "Success",
        description: `Folder "${newItemName}" created`,
      })
      
      setShowNewFolderModal(false)
      setNewItemName('')
      fetchProject()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (itemId, itemName) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return

    try {
      await fileAPI.delete(itemId)
      toast({
        title: "Success",
        description: `"${itemName}" deleted`,
      })
      fetchProject()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()
    const iconClass = "h-4 w-4"
    
    switch(ext) {
      case 'js':
      case 'jsx':
        return <FileText className={`${iconClass} text-yellow-500`} />
      case 'css':
        return <FileText className={`${iconClass} text-blue-500`} />
      case 'json':
        return <FileText className={`${iconClass} text-green-500`} />
      case 'html':
        return <FileText className={`${iconClass} text-orange-500`} />
      default:
        return <FileText className={`${iconClass} text-gray-500`} />
    }
  }

  const renderFileTree = (parentId = null, level = 0) => {
    const items = files.filter(f => f.parentId === parentId)
    
    return items.map(item => {
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(item._id)
        return (
          <div key={item._id}>
            <div
              className="group flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded transition-colors"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <div 
                className="flex items-center space-x-2 flex-1"
                onClick={() => toggleFolder(item._id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
                <Folder className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedParent(item._id)
                    setShowNewFileModal(true)
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="New file"
                >
                  <FilePlus className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedParent(item._id)
                    setShowNewFolderModal(true)
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="New folder"
                >
                  <FolderPlus className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteItem(item._id, item.name)
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            {isExpanded && renderFileTree(item._id, level + 1)}
          </div>
        )
      } else {
        return (
          <div
            key={item._id}
            className={`group flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded transition-colors ${
              activeFile === item._id ? 'bg-blue-50 dark:bg-blue-900/50 border-l-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 24}px` }}
          >
            <div 
              className="flex items-center space-x-2 flex-1"
              onClick={() => setActiveFile(item._id)}
            >
              {getFileIcon(item.name)}
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteItem(item._id, item.name)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{project?.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Explorer
              </h3>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSelectedParent(null)
                    setShowNewFileModal(true)
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="New File"
                >
                  <FilePlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    setSelectedParent(null)
                    setShowNewFolderModal(true)
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="New Folder"
                >
                  <FolderPlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="space-y-0.5">
              {renderFileTree()}
            </div>
          </div>
        </div>

        {/* Code Editor & Preview */}
        <div className="flex-1 overflow-hidden bg-gray-900">
          {Object.keys(sandpackFiles).length > 0 ? (
            <Sandpack
              template="react"
              files={sandpackFiles}
              theme="dark"
              options={{
                showNavigator: true,
                showTabs: true,
                showLineNumbers: true,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: '100%',
                editorWidthPercentage: 60,
                closableTabs: true,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No files to display</p>
                <p className="text-gray-400 text-sm mt-2">Create a new file to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Create New File</h3>
            <Input
              placeholder="filename.js"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
              className="mb-4"
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewFileModal(false)
                  setNewItemName('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFile} className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Create New Folder</h3>
            <Input
              placeholder="folder-name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
              className="mb-4"
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewFolderModal(false)
                  setNewItemName('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
