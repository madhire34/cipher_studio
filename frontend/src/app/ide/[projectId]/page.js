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
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function IDEPage() {
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
      // Save all modified files
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

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileTree = (parentId = null, level = 0) => {
    const items = files.filter(f => f.parentId === parentId)
    
    return items.map(item => {
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(item._id)
        return (
          <div key={item._id}>
            <div
              className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolder(item._id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{item.name}</span>
            </div>
            {isExpanded && renderFileTree(item._id, level + 1)}
          </div>
        )
      } else {
        return (
          <div
            key={item._id}
            className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded ${
              activeFile === item._id ? 'bg-blue-50 dark:bg-blue-900' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 24}px` }}
            onClick={() => setActiveFile(item._id)}
          >
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{item.name}</span>
          </div>
        )
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading project...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">{project?.name}</span>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                FILES
              </h3>
            </div>
            <div className="space-y-1">
              {renderFileTree()}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
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
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No files to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
