"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Music, Mic, Keyboard, Check } from "lucide-react"
import { lyricQuestions } from "@/lib/lyric-data"
import { useToast } from "@/hooks/use-toast"

interface LyricGameProps {
  onComplete: (rating?: number) => void
}

export function LyricGame({ onComplete }: LyricGameProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [answered, setAnswered] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [isListening, setIsListening] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const genres = Object.keys(lyricQuestions)
  const questions = selectedGenre ? lyricQuestions[selectedGenre] : []

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setUserAnswer(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast({
        title: "Error",
        description: "Could not capture voice. Please try again.",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    setAnswered(true)
    const currentQ = questions[currentQuestion]
    const isCorrect = userAnswer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim()

    if (isCorrect) {
      setScore(score + 1)
      toast({
        title: "Correct! 🎵",
        description: "You got the lyrics right!",
      })
    } else {
      toast({
        title: "Not quite...",
        description: `The answer was: "${currentQ.answer}"`,
        variant: "destructive",
      })

      // Play the song snippet
      if (currentQ.audioUrl && audioRef.current) {
        audioRef.current.src = currentQ.audioUrl
        audioRef.current.play().catch((err) => console.log("Audio play error:", err))
      }
    }

    setTimeout(() => {
      // Stop audio before moving to next question
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      if (currentQuestion + 1 >= questions.length) {
        onComplete(score)
      } else {
        setCurrentQuestion(currentQuestion + 1)
        setUserAnswer("")
        setAnswered(false)
      }
    }, 3000)
  }

  if (!selectedGenre) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-balance flex items-center justify-center gap-3">
              <Music className="w-8 h-8 text-primary" />
              Guess the Lyric
            </CardTitle>
            <CardDescription className="text-lg">Choose your favorite genre</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {genres.map((genre) => (
              <Button
                key={genre}
                size="lg"
                variant="outline"
                className="w-full text-lg h-auto py-6 hover:scale-105 transition-transform bg-transparent"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentQuestion >= questions.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold mb-4">🎵 Game Complete!</CardTitle>
            <CardDescription className="text-xl">
              You scored {score} out of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => onComplete(score)} className="w-full">
              Back to Timer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto">
      <audio ref={audioRef} />

      <Card className="shadow-2xl border-2">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Score: {score}/{questions.length}
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-4" />
          <CardTitle className="text-2xl font-bold text-balance">Complete the lyric:</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-secondary/50 p-6 rounded-xl">
            <p className="text-xl font-medium text-center italic text-pretty leading-relaxed">"{question.lyric}"</p>
            <p className="text-sm text-center text-muted-foreground mt-2">- {question.song}</p>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={inputMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("text")}
              className="gap-2"
            >
              <Keyboard className="w-4 h-4" />
              Type
            </Button>
            <Button
              variant={inputMode === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("voice")}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Voice
            </Button>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            {inputMode === "text" ? (
              <Input
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={answered}
                className="text-lg h-14"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                }}
              />
            ) : (
              <div className="text-center">
                <Button size="lg" onClick={handleVoiceInput} disabled={isListening || answered} className="gap-2">
                  <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
                  {isListening ? "Listening..." : "Tap to Speak"}
                </Button>
                {userAnswer && (
                  <p className="mt-4 text-lg">
                    You said: <span className="font-semibold">"{userAnswer}"</span>
                  </p>
                )}
              </div>
            )}

            <Button size="lg" onClick={handleSubmit} disabled={!userAnswer.trim() || answered} className="w-full gap-2">
              {answered ? (
                <>
                  <Check className="w-5 h-5" />
                  Submitted
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
