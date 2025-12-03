export function createConfetti() {
  const colors = ["#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"]
  const confettiCount = 50

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div")
    confetti.className = "confetti"
    confetti.style.left = `${Math.random() * 100}vw`
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDelay = `${Math.random() * 0.5}s`
    confetti.style.animationDuration = `${2 + Math.random() * 2}s`

    document.body.appendChild(confetti)

    setTimeout(() => {
      confetti.remove()
    }, 4000)
  }
}
