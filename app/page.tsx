'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Project {
  id: number
  contract_id: string
  description: string
  category: string
  status: string
  budget: number
  province: string
  region: string
  progress: number
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('dpwh_projects')
          .select('*')
          .limit(10)
        
        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DPWH Infrastructure Projects Dashboard
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-xl text-gray-600">Loading projects...</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.description || 'No description'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Contract ID:</span> {project.contract_id}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Category:</span> {project.category}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Location:</span> {project.province}, {project.region}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ₱{project.budget?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: {project.status}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  {project.progress?.toFixed(1) || 0}% complete
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
