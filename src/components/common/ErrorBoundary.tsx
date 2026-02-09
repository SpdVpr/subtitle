import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('UI ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border rounded-md bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300">
          <div className="font-semibold">Something went wrong.</div>
          <div className="text-sm mt-1">Please reload the page or try again.</div>
        </div>
      )
    }
    return this.props.children
  }
}

