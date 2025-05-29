// components/api-config.tsx
"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Check, Key, Edit2} from "lucide-react"
import type {ApiConfig} from "@/lib/types"

interface ApiConfigProps {
    onConfigChange: (config: ApiConfig) => void
    existingConfig?: ApiConfig | null
}

export function ApiConfigComponent({onConfigChange, existingConfig}: ApiConfigProps) {
    const [config, setConfig] = useState<ApiConfig>({
        openaiApiKey: "",
    })
    const [isConfigured, setIsConfigured] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        if (existingConfig?.openaiApiKey) {
            setConfig(existingConfig)
            setIsConfigured(true)
        } else {
            // Load from localStorage if available
            const saved = localStorage.getItem("apiConfig")
            if (saved) {
                const savedConfig = JSON.parse(saved)
                // Only use openaiApiKey from saved config
                const cleanConfig = {
                    openaiApiKey: savedConfig.openaiApiKey || ""
                }
                setConfig(cleanConfig)
                onConfigChange(cleanConfig)
                setIsConfigured(!!cleanConfig.openaiApiKey)
            }
        }
    }, [existingConfig])

    const handleSave = () => {
        const cleanConfig = {
            openaiApiKey: config.openaiApiKey
        }
        localStorage.setItem("apiConfig", JSON.stringify(cleanConfig))
        onConfigChange(cleanConfig)
        setIsConfigured(true)
        setIsEditing(false)
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        // Reset to previous config
        if (existingConfig?.openaiApiKey) {
            setConfig(existingConfig)
        }
        setIsEditing(false)
    }

    const isValid = config.openaiApiKey.trim().length > 0

    // Show compact view if configured and not editing
    if (isConfigured && !isEditing) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key className="h-5 w-5"/>
                            API Configuration
                        </div>
                        <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                        >
                            <Edit2 className="h-4 w-4 mr-2"/>
                            Edit Key
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4"/>
                        OpenAI API key configured
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5"/>
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
                            onChange={(e) => setConfig({...config, openaiApiKey: e.target.value})}
                            placeholder="sk-..."
                            className="pl-10"
                        />
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                    </div>
                    <p className="text-xs text-gray-500">
                        Your API key is stored locally and never shared with third parties
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!isValid}
                        className="flex-1"
                    >
                        {isConfigured ? (
                            <>
                                <Check className="h-4 w-4 mr-2"/>
                                Update Configuration
                            </>
                        ) : (
                            "Save Configuration"
                        )}
                    </Button>
                    {isEditing && (
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}