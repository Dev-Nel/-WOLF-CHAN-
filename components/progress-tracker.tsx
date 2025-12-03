"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Gamepad2, X, Star } from "lucide-react"

interface ProgressTrackerProps {
  pomodorosCompleted: number
  gamesPlayed: number
  onClose: () => void
}

export function ProgressTracker({ pomodorosCompleted, gamesPlayed, onClose }: ProgressTrackerProps) {
  const totalMinutes = pomodorosCompleted * 25
  const hoursWorked = Math.floor(totalMinutes / 60)
  const minutesWorked = totalMinutes % 60

  const achievements = [
    { name: "First Session", icon: Star, unlocked: pomodorosCompleted >= 1 },
    { name: "Game Master", icon: Gamepad2, unlocked: gamesPlayed >= 5 },
    { name: "Focus Warrior", icon: Trophy, unlocked: pomodorosCompleted >= 5 },
    { name: "Productivity Pro", icon: Clock, unlocked: pomodorosCompleted >= 10 },
  ]

  return (
    <Card className="mb-6 shadow-xl border-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-accent" />
          Your Progress
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{pomodorosCompleted}</p>
            <p className="text-sm text-muted-foreground">Pomodoros</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{gamesPlayed}</p>
            <p className="text-sm text-muted-foreground">Games Played</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">
              {hoursWorked}h {minutesWorked}m
            </p>
            <p className="text-sm text-muted-foreground">Time Focused</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{achievements.filter((a) => a.unlocked).length}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <div
                  key={achievement.name}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    achievement.unlocked ? "bg-accent/10 border-accent" : "bg-muted border-border opacity-50"
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{achievement.name}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Weekly Goal</h3>
            <span className="text-sm text-muted-foreground">{pomodorosCompleted}/20 sessions</span>
          </div>
          <Progress value={(pomodorosCompleted / 20) * 100} className="h-3" />
        </div>
      </CardContent>
    </Card>
  )
}
