// components/api-config.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Key, Database, Globe, Check } from "lucide-react"
import type { ApiConfig } from "@/lib/types"

interface ApiConfigProps {
    onConfigChange: (config: ApiConfig) => void
}

export function ApiConfigComponent({ onConfigChange }: ApiConfigProps) {
    const [config, setConfig] = useState<ApiConfig>({
        openaiApiKey: "",
        qdrantApiKey: "",
        qdrantUrl: "",
    })
    const [isConfigured, setIsConfigured] = useState(false)

    useEffect(() => {
        // Load from localStorage if available
        const saved = localStorage.getItem("apiConfig")
        if (saved) {
            const savedConfig = JSON.parse(saved)
            setConfig(savedConfig)
            onConfigChange(savedConfig)
            setIsConfigured(true)
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem("apiConfig", JSON.stringify(config))
        onConfigChange(config)
        setIsConfigured(true)
    }

    const isValid = config.openaiApiKey && config.qdrantApiKey && config.qdrantUrl

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="relative">
                        <Input
                            id="openai-key"
                            type="password"
                            value={config.openaiApiKey}
                            onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                            placeholder="sk-..."
                            className="pl-10"
                        />
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="qdrant-key">Qdrant API Key</Label>
                    <div className="relative">
                        <Input
                            id="qdrant-key"
                            type="password"
                            value={config.qdrantApiKey}
                            onChange={(e) => setConfig({ ...config, qdrantApiKey: e.target.value })}
                            placeholder="Enter your Qdrant API key"
                            className="pl-10"
                        />
                        <Database className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="qdrant-url">Qdrant URL</Label>
                    <div className="relative">
                        <Input
                            id="qdrant-url"
                            type="url"
                            value={config.qdrantUrl}
                            onChange={(e) => setConfig({ ...config, qdrantUrl: e.target.value })}
                            placeholder="https://your-qdrant-instance.com"
                            className="pl-10"
                        />
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!isValid}
                    className="w-full"
                >
                    {isConfigured ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Configuration Saved
                        </>
                    ) : (
                        "Save Configuration"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}