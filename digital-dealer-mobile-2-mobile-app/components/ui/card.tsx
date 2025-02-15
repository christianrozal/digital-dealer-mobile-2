import { View, ViewProps } from 'react-native'
import React from 'react'

interface CardProps extends ViewProps {
  children: React.ReactNode
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <View 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </View>
  )
} 