"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Coffee } from "lucide-react"
import { interestingFacts } from "@/lib/facts"

interface PomodoroTimerProps {
  onGameTrigger: () => void
  onPomodoroComplete: () => void
}

export function PomodoroTimer({ onGameTrigger, onPomodoroComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [currentFact, setCurrentFact] = useState("")
  const elapsedTimeRef = useRef(0)
  const shouldTriggerGameRef = useRef(false)

  const WORK_TIME = 25 * 60
  const BREAK_TIME = 5 * 60
  const GAME_INTERVAL = 2 * 60 // Trigger game every 2 minutes

  useEffect(() => {
    if (shouldTriggerGameRef.current) {
      console.log("[v0] Triggering game via effect")
      shouldTriggerGameRef.current = false
      onGameTrigger()
    }
  }, [timeLeft, onGameTrigger])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1

          // Check if we need to trigger a game (every 2 minutes during work sessions)
          if (!isBreak && newTime > 0) {
            elapsedTimeRef.current += 1

            // Trigger game every 2 minutes (120 seconds)
            if (elapsedTimeRef.current % GAME_INTERVAL === 0) {
              console.log("[v0] Setting game trigger flag at", elapsedTimeRef.current, "seconds")
              shouldTriggerGameRef.current = true
            }
          }

          if (newTime === 0) {
            playNotificationSound()
            if (isBreak) {
              // Break ended, start new work session
              setIsBreak(false)
              elapsedTimeRef.current = 0
              return WORK_TIME
            } else {
              // Work session ended
              onPomodoroComplete()
              setIsBreak(true)
              return BREAK_TIME
            }
          }

          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isBreak, onPomodoroComplete])

  // Show facts during break every 5 seconds
  useEffect(() => {
    if (isBreak && isRunning) {
      const showRandomFact = () => {
        const randomIndex = Math.floor(Math.random() * interestingFacts.length)
        setCurrentFact(interestingFacts[randomIndex])
      }

      showRandomFact()
      const factInterval = setInterval(showRandomFact, 5000)

      return () => clearInterval(factInterval)
    }
  }, [isBreak, isRunning])

  const playNotificationSound = () => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/notification.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {
        // Fallback if audio doesn't play
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME)
    elapsedTimeRef.current = 0
  }

  const progress = isBreak ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100 : ((WORK_TIME - timeLeft) / WORK_TIME) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-balance flex items-center justify-center gap-3">
            {isBreak ? (
              <>
                <Coffee className="w-8 h-8 text-accent" />
                <span className="text-accent">Break Time!</span>
              </>
            ) : (
              <>
                <span className="text-primary">Focus Time</span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-lg">
            {isBreak ? "Relax and learn something new" : "Stay focused, games coming soon!"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-8xl font-bold font-mono mb-4">{formatTime(timeLeft)}</div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Break Fact Display */}
          {isBreak && currentFact && (
            <Card className="bg-secondary/50 border-accent/30">
              <CardContent className="pt-6">
                <p className="text-lg text-center font-medium text-pretty leading-relaxed">💡 {currentFact}</p>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={toggleTimer} className="w-32 gap-2" variant={isRunning ? "outline" : "default"}>
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer} className="gap-2 bg-transparent">
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🎮 Mini-games will appear every 2 minutes during work sessions!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
