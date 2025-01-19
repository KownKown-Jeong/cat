// src/pages/admin/CreateMission.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface MissionForm {
  title: string
  isPublic: boolean
  introduction: string
  mainContent: string
  examples: string[]
  conclusion: string
}

export default function CreateMission() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<MissionForm>({
    title: '',
    isPublic: true,
    introduction: '',
    mainContent: '',
    examples: [''],
    conclusion: ''
  })

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...formData.examples]
    newExamples[index] = value
    setFormData({ ...formData, examples: newExamples })
  }

  const addExample = () => {
    setFormData({ 
      ...formData, 
      examples: [...formData.examples, ''] 
    })
  }

  const removeExample = (index: number) => {
    const newExamples = formData.examples.filter((_, i) => i !== index)
    setFormData({ ...formData, examples: newExamples })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: API 연동
      const response = await fetch('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        navigate('/admin/missions')
      }
    } catch (error) {
      console.error('Failed to create mission:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Mission</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* 제목 및 공개 설정 */}
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission Title
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.isPublic ? 'public' : 'private'}
                onChange={e => setFormData({ ...formData, isPublic: e.target.value === 'public' })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* 서론 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Introduction (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              value={formData.introduction}
              onChange={e => setFormData({ ...formData, introduction: e.target.value })}
              placeholder="Enter greeting or introduction message..."
            />
          </div>

          {/* 본론 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Content
            </label>
            <textarea
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              value={formData.mainContent}
              onChange={e => setFormData({ ...formData, mainContent: e.target.value })}
              placeholder="Enter main mission content..."
            />
          </div>

          {/* 예시/추가자료 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Examples/Additional Resources
              </label>
              <button
                type="button"
                onClick={addExample}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Example
              </button>
            </div>
            {formData.examples.map((example, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={example}
                  onChange={e => handleExampleChange(index, e.target.value)}
                  placeholder={`Example ${index + 1}`}
                />
                {formData.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 마무리말 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conclusion (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              value={formData.conclusion}
              onChange={e => setFormData({ ...formData, conclusion: e.target.value })}
              placeholder="Enter concluding message..."
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/missions')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}