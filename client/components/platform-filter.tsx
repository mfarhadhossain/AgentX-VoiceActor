"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

const platforms = [
  { value: "all", label: "All Platforms", count: 11 },
  { value: "voices", label: "Voices.com", count: 3 },
  { value: "fiverr", label: "Fiverr", count: 2 },
  { value: "upwork", label: "Upwork", count: 5 },
  { value: "acx", label: "ACX", count: 1 },
  { value: "voice123", label: "Voice123", count: 0 },
]

export function PlatformFilter() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("all")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between text-white hover:bg-white/10"
        >
          {value === "all" ? (
            "All Platforms"
          ) : (
            <>
              {platforms.find((platform) => platform.value === value)?.label}
              <Badge variant="outline" className="ml-2 bg-white/10 text-xs">
                {platforms.find((platform) => platform.value === value)?.count}
              </Badge>
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search platform..." />
          <CommandList>
            <CommandEmpty>No platform found.</CommandEmpty>
            <CommandGroup>
              {platforms.map((platform) => (
                <CommandItem
                  key={platform.value}
                  value={platform.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === platform.value ? "opacity-100" : "opacity-0"}`} />
                  <span className="flex-1">{platform.label}</span>
                  {platform.count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {platform.count}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
