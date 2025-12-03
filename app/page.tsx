"use client"

import { useState } from "react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { MiniGameSelector } from "@/components/mini-game-selector"
import { PhotoCaptureGame } from "@/components/photo-capture-game"
import { TriviaGame } from "@/components/trivia-game"
import { LyricGame } from "@/components/lyric-game"
import { DoodleJumpGame } from "@/components/doodle-jump-game"
import { CameraFilterGame } from "@/components/camera-filter-game"
import { ProgressTracker } from "@/components/progress-tracker"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type GameType = "selector" | "photo" | "trivia" | "lyric" | "doodle" | "filter" | null

export default function Home() {
  const [currentGame, setCurrentGame] = useState<GameType>(null)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [showTracker, setShowTracker] = useState(false)

  const handleGameTrigger = () => {
    setCurrentGame("selector")
  }

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game)
  }

  const handleGameComplete = (rating?: number) => {
    setGamesPlayed((prev) => prev + 1)
    setCurrentGame(null)
  }

  const handlePomodoroComplete = () => {
    setPomodorosCompleted((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="text-5xl">🐺</div>
            <div>
              <h1 className="text-3xl font-bold text-balance">🐺WOLF CHAN🐺</h1>
              <p className="text-sm text-muted-foreground">Work smart, play smarter</p>
            </div>
          </div>
          <Button variant="outline" size="lg" onClick={() => setShowTracker(!showTracker)} className="gap-2">
            <Trophy className="w-5 h-5" />
            <span className="hidden sm:inline">Progress</span>
          </Button>
        </div>

        {/* Progress Tracker */}
        {showTracker && (
          <ProgressTracker
            pomodorosCompleted={pomodorosCompleted}
            gamesPlayed={gamesPlayed}
            onClose={() => setShowTracker(false)}
          />
        )}

        {/* Main Content - Timer always visible */}
        <PomodoroTimer onGameTrigger={handleGameTrigger} onPomodoroComplete={handlePomodoroComplete} />

        <Dialog open={currentGame !== null} onOpenChange={(open) => !open && setCurrentGame(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {currentGame === "selector" && <MiniGameSelector onGameSelect={handleGameSelect} />}
            {currentGame === "photo" && <PhotoCaptureGame onComplete={handleGameComplete} />}
            {currentGame === "trivia" && <TriviaGame onComplete={handleGameComplete} />}
            {currentGame === "lyric" && <LyricGame onComplete={handleGameComplete} />}
            {currentGame === "doodle" && <DoodleJumpGame onComplete={handleGameComplete} />}
            {currentGame === "filter" && <CameraFilterGame onComplete={handleGameComplete} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
