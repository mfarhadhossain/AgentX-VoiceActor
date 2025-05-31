import { FileText } from "lucide-react"

export function ProjectHeader() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clontract</h1>
              <p className="text-sm text-gray-500">AI-Powered Contract Analysis Platform</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
