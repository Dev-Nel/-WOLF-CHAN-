"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Check, XIcon, PartyPopper } from "lucide-react"
import { triviaQuestions } from "@/lib/trivia-data"
import { createConfetti } from "@/lib/confetti"

interface TriviaGameProps {
  onComplete: (rating?: number) => void
}

export function TriviaGame({ onComplete }: TriviaGameProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const topics = Object.keys(triviaQuestions)
  const questions = selectedTopic ? triviaQuestions[selectedTopic] : []

  useEffect(() => {
    if (selectedTopic && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !answered) {
      handleTimeUp()
    }
  }, [timeLeft, selectedTopic, answered])

  const handleTimeUp = () => {
    setAnswered(true)
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const handleAnswer = (answerIndex: number) => {
    if (answered) return

    setSelectedAnswer(answerIndex)
    setAnswered(true)

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer

    if (isCorrect) {
      setScore(score + 1)
      triggerCelebration()
    }

    setTimeout(
      () => {
        nextQuestion()
      },
      isCorrect ? 6000 : 2000,
    )
  }

  const triggerCelebration = () => {
    setShowCelebration(true)
    createConfetti()
    playMusic()

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }, 5000)
  }

  const playMusic = () => {
    setAudioPlaying(true)
    // Note: YouTube links can't be played directly. Using placeholder audio.
    // In production, you would need to download/convert the YouTube audio
    if (audioRef.current) {
      audioRef.current.src = "/audio/celebration.mp3" // This should be the chorus from the YouTube song
      audioRef.current.currentTime = 0
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(() => {})
    }
  }

  const nextQuestion = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setShowCelebration(false)
    setAudioPlaying(false)
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(10)

    if (currentQuestion + 1 >= questions.length) {
      setTimeout(() => {
        onComplete(score)
      }, 500)
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleLeaveCelebration = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setShowCelebration(false)
    setAudioPlaying(false)
    nextQuestion()
  }

  if (!selectedTopic) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-balance flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-accent" />
              Trivia Quiz
            </CardTitle>
            <CardDescription className="text-lg">Choose a topic to test your knowledge</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {topics.map((topic) => (
              <Button
                key={topic}
                size="lg"
                variant="outline"
                className="w-full text-lg h-auto py-6 hover:scale-105 transition-transform bg-transparent"
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
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
            <CardTitle className="text-4xl font-bold mb-4">Quiz Complete!</CardTitle>
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

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-3xl p-12 text-center shadow-2xl animate-bounce">
            <PartyPopper className="w-24 h-24 mx-auto mb-4 text-accent" />
            <h2 className="text-4xl font-bold mb-2">Correct!</h2>
            <p className="text-lg text-muted-foreground">Amazing work!</p>
            <Button className="mt-6" size="lg" onClick={handleLeaveCelebration}>
              Continue
            </Button>
          </div>
        </div>
      )}

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
          <CardTitle className="text-2xl font-bold text-balance mb-4">{question.question}</CardTitle>
          <div className="flex items-center gap-4">
            <Progress value={(timeLeft / 10) * 100} className="flex-1" />
            <span className="text-2xl font-bold font-mono w-12 text-center">{timeLeft}s</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === question.correctAnswer
            const showResult = answered

            return (
              <Button
                key={index}
                variant={showResult ? (isCorrect ? "default" : isSelected ? "destructive" : "outline") : "outline"}
                size="lg"
                className="w-full justify-start text-left h-auto py-4 text-base"
                onClick={() => handleAnswer(index)}
                disabled={answered}
              >
                <span className="flex-1">{answer}</span>
                {showResult && isCorrect && <Check className="w-5 h-5 ml-2" />}
                {showResult && isSelected && !isCorrect && <XIcon className="w-5 h-5 ml-2" />}
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
