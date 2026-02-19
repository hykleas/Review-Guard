'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const getStarColor = (index: number) => {
    const effectiveRating = hoverRating || rating
    
    if (index <= effectiveRating) {
      if (effectiveRating <= 2) return 'fill-red-500 text-red-500'
      if (effectiveRating === 3) return 'fill-yellow-400 text-yellow-400'
      return 'fill-green-500 text-green-500'
    }
    
    return 'fill-gray-200 text-gray-200'
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={cn(
              'star-rating-star transition-all duration-200',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                getStarColor(index),
                'transition-all duration-200'
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-2 text-lg font-semibold text-gray-700">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  )
}

// Star Rating Display (Sadece gösterim için)
interface StarRatingDisplayProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function StarRatingDisplay({
  rating,
  size = 'md',
  showLabel = false,
  className,
}: StarRatingDisplayProps) {
  const getRatingLabel = (r: number) => {
    if (r <= 2) return { text: 'Olumsuz', color: 'text-red-500 bg-red-50' }
    if (r === 3) return { text: 'Orta', color: 'text-yellow-600 bg-yellow-50' }
    return { text: 'Olumlu', color: 'text-green-600 bg-green-50' }
  }

  const label = getRatingLabel(rating)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <StarRating rating={rating} size={size} />
      {showLabel && (
        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', label.color)}>
          {label.text}
        </span>
      )}
    </div>
  )
}

// Interactive Star Rating Input
interface StarRatingInputProps {
  value: number
  onChange: (rating: number) => void
  label?: string
  error?: string
  size?: 'md' | 'lg' | 'xl'
}

export function StarRatingInput({
  value,
  onChange,
  label,
  error,
  size = 'xl',
}: StarRatingInputProps) {
  const getRatingText = (r: number) => {
    switch (r) {
      case 1:
        return 'Çok Kötü'
      case 2:
        return 'Kötü'
      case 3:
        return 'Orta'
      case 4:
        return 'İyi'
      case 5:
        return 'Mükemmel'
      default:
        return 'Puanlayın'
    }
  }

  const getRatingColor = (r: number) => {
    if (r <= 2) return 'text-red-500'
    if (r === 3) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-lg font-medium text-gray-700 mb-4 text-center">
          {label}
        </label>
      )}
      <div className="flex flex-col items-center gap-4">
        <StarRating
          rating={value}
          size={size}
          interactive
          onRatingChange={onChange}
        />
        <span className={cn('text-2xl font-bold transition-colors duration-200', getRatingColor(value))}>
          {getRatingText(value)}
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-danger-500 text-center">{error}</p>}
    </div>
  )
}