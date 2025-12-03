"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, RotateCcw, Trophy } from "lucide-react"

interface DoodleJumpGameProps {
  onComplete: (rating?: number) => void
}

interface Platform {
  x: number
  y: number
  width: number
}

export function DoodleJumpGame({ onComplete }: DoodleJumpGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const playerRef = useRef({ x: 200, y: 300, velocityY: 0, width: 40, height: 60 })
  const platformsRef = useRef<Platform[]>([])
  const scoreRef = useRef(0)
  const animationRef = useRef<number>()

  const CANVAS_WIDTH = 400
  const CANVAS_HEIGHT = 600
  const GRAVITY = 0.5
  const JUMP_STRENGTH = -12
  const PLATFORM_WIDTH = 80
  const PLATFORM_HEIGHT = 15
  const MOVE_SPEED = 7

  useEffect(() => {
    if (gameStarted && !gameOver) {
      initGame()
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          playerRef.current.x -= MOVE_SPEED
        } else if (e.key === "ArrowRight") {
          playerRef.current.x += MOVE_SPEED
        }
      }

      window.addEventListener("keydown", handleKeyPress)

      return () => {
        window.removeEventListener("keydown", handleKeyPress)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [gameStarted, gameOver])

  const initGame = () => {
    const player = playerRef.current
    player.x = CANVAS_WIDTH / 2
    player.y = CANVAS_HEIGHT / 2
    player.velocityY = 0

    // Create initial platforms
    platformsRef.current = []
    for (let i = 0; i < 7; i++) {
      platformsRef.current.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: CANVAS_HEIGHT - i * 100,
        width: PLATFORM_WIDTH,
      })
    }

    scoreRef.current = 0
    setScore(0)
    gameLoop()
  }

  const gameLoop = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const player = playerRef.current
    const platforms = platformsRef.current

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Apply gravity
    player.velocityY += GRAVITY
    player.y += player.velocityY

    // Wrap player horizontally
    if (player.x < -player.width) player.x = CANVAS_WIDTH
    if (player.x > CANVAS_WIDTH) player.x = -player.width

    // Check platform collisions
    if (player.velocityY > 0) {
      platforms.forEach((platform) => {
        if (
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + PLATFORM_HEIGHT + 10
        ) {
          player.velocityY = JUMP_STRENGTH
          scoreRef.current += 10
          setScore(scoreRef.current)
        }
      })
    }

    // Move platforms down when player goes up
    if (player.y < CANVAS_HEIGHT / 3) {
      const offset = CANVAS_HEIGHT / 3 - player.y
      player.y = CANVAS_HEIGHT / 3

      platforms.forEach((platform) => {
        platform.y += offset
      })

      // Remove platforms that went off screen and add new ones
      platformsRef.current = platforms.filter((p) => p.y < CANVAS_HEIGHT)
      while (platformsRef.current.length < 7) {
        platformsRef.current.push({
          x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
          y: platformsRef.current[0].y - 100,
          width: PLATFORM_WIDTH,
        })
      }
    }

    // Check game over
    if (player.y > CANVAS_HEIGHT) {
      setGameOver(true)
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current)
      }
      return
    }

    // Draw platforms
    ctx.fillStyle = "#8b5cf6"
    platforms.forEach((platform) => {
      ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT)
    })

    // Draw player (stickman)
    ctx.fillStyle = "#000"
    // Head
    ctx.beginPath()
    ctx.arc(player.x + player.width / 2, player.y + 10, 8, 0, Math.PI * 2)
    ctx.fill()
    // Body
    ctx.beginPath()
    ctx.moveTo(player.x + player.width / 2, player.y + 18)
    ctx.lineTo(player.x + player.width / 2, player.y + 40)
    ctx.lineWidth = 3
    ctx.stroke()
    // Arms
    ctx.beginPath()
    ctx.moveTo(player.x + player.width / 2 - 10, player.y + 25)
    ctx.lineTo(player.x + player.width / 2 + 10, player.y + 25)
    ctx.stroke()
    // Legs
    ctx.beginPath()
    ctx.moveTo(player.x + player.width / 2, player.y + 40)
    ctx.lineTo(player.x + player.width / 2 - 8, player.y + 55)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(player.x + player.width / 2, player.y + 40)
    ctx.lineTo(player.x + player.width / 2 + 8, player.y + 55)
    ctx.stroke()

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const handleRestart = () => {
    setGameOver(false)
    setGameStarted(true)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touchX = touch.clientX - rect.left

    if (touchX < CANVAS_WIDTH / 2) {
      playerRef.current.x -= MOVE_SPEED
    } else {
      playerRef.current.x += MOVE_SPEED
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-balance flex items-center justify-center gap-3">
            <Gamepad2 className="w-8 h-8 text-destructive" />
            Doodle Jump
          </CardTitle>
          <CardDescription className="text-lg">Use arrow keys or tap screen to move</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                High Score
              </p>
              <p className="text-3xl font-bold text-accent">{highScore}</p>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-4 border-border rounded-xl bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900"
                onTouchMove={handleTouchMove}
              />
              {!gameStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <Button size="lg" onClick={() => setGameStarted(true)}>
                    Start Game
                  </Button>
                </div>
              )}
              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <div className="bg-card p-8 rounded-2xl text-center">
                    <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                    <p className="text-lg mb-4">Final Score: {score}</p>
                    <Button size="lg" onClick={handleRestart} className="gap-2 mb-2">
                      <RotateCcw className="w-5 h-5" />
                      Play Again
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => onComplete(score)} className="w-full">
                      Back to Timer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>🎮 Use ← → arrow keys to move left/right</p>
            <p>📱 On mobile: Tap left/right side of screen</p>
            <p>🎯 Jump on platforms to keep going higher!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
