"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Brain, Music, Gamepad2, Sparkles } from "lucide-react"

interface MiniGameSelectorProps {
  onGameSelect: (game: "photo" | "trivia" | "lyric" | "doodle" | "filter") => void
}

export function MiniGameSelector({ onGameSelect }: MiniGameSelectorProps) {
  const games = [
    {
      id: "photo" as const,
      name: "Photo Capture",
      description: "Take a selfie with countdown",
      icon: Camera,
      color: "bg-primary",
    },
    {
      id: "trivia" as const,
      name: "Trivia Quiz",
      description: "5 questions to test your knowledge",
      icon: Brain,
      color: "bg-accent",
    },
    {
      id: "lyric" as const,
      name: "Guess the Lyric",
      description: "Complete the song lyrics",
      icon: Music,
      color: "bg-secondary",
    },
    {
      id: "doodle" as const,
      name: "Doodle Jump",
      description: "Jump as high as you can!",
      icon: Gamepad2,
      color: "bg-destructive",
    },
    {
      id: "filter" as const,
      name: "Filter Fun",
      description: "Try fun camera filters for 2 mins",
      icon: Sparkles,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-balance mb-2">Choose Your Mini-Game!</CardTitle>
          <CardDescription className="text-lg">Time for a quick break - pick a game to play</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
              const Icon = game.icon
              return (
                <Button
                  key={game.id}
                  onClick={() => onGameSelect(game.id)}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-4 hover:scale-105 transition-transform"
                >
                  <div
                    className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center rotate-6 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl mb-1">{game.name}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{game.description}</p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
