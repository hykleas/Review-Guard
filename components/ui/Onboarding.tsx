'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { X, CheckCircle2, ArrowRight } from 'lucide-react'

interface OnboardingStep {
  title: string
  description: string
  image?: string
}

interface OnboardingProps {
  steps: OnboardingStep[]
  onComplete: () => void
}

export function Onboarding({ steps, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const current = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      setIsVisible(false)
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="max-w-2xl w-full p-8 relative animate-fade-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${index <= currentStep ? 'bg-primary-600 w-8' : 'bg-gray-200 w-2'}
                `}
              />
            ))}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-gray-600 text-lg">{current.description}</p>
        </div>

        {current.image && (
          <div className="mb-8 flex justify-center">
            <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl flex items-center justify-center">
              <div className="text-6xl">{current.image}</div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Atla
          </Button>
          <Button onClick={handleNext} className="flex-1" rightIcon={isLast ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}>
            {isLast ? 'Tamamla' : 'Devam Et'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
