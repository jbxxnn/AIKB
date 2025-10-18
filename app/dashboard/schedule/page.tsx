'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, CheckCircle, XCircle, Clock, User, ExternalLink } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CalendarIcon } from '@hugeicons/core-free-icons'

interface CalendarStatus {
  connected: boolean
  connectedBy?: {
    name: string
    email: string
  }
  connectedAt?: string
  lastUpdated?: string
  expiresAt?: string
  calendarId?: string
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Check for URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')

    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Google Calendar connected successfully!' })
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/schedule')
    } else if (error) {
      const errorMessages: { [key: string]: string } = {
        'oauth_denied': 'OAuth authorization was denied',
        'invalid_request': 'Invalid OAuth request',
        'unauthorized': 'You are not authorized to perform this action',
        'config_error': 'Google OAuth configuration error',
        'token_exchange_failed': 'Failed to exchange authorization code for tokens',
        'storage_failed': 'Failed to store calendar settings',
        'internal_error': 'An internal error occurred'
      }
      setMessage({ 
        type: 'error', 
        text: errorMessages[error] || 'An unknown error occurred' 
      })
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/schedule')
    }
  }, [])

  // Fetch calendar status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/calendar/status')
        if (response.ok) {
          const data = await response.json()
          setCalendarStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch calendar status:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStatus()
    }
  }, [status])

  const handleConnect = () => {
    setActionLoading(true)
    window.location.href = '/api/calendar/auth'
  }

  const handleDisconnect = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/calendar/status', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCalendarStatus({ connected: false })
        setMessage({ type: 'success', text: 'Google Calendar disconnected successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to disconnect calendar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect calendar' })
    } finally {
      setActionLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <HugeiconsIcon icon={CalendarIcon} className="h-10 w-10 animate-pulse mx-auto mb-4" />
          <p>Loading calendar settings...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
    return null
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HugeiconsIcon icon={CalendarIcon} className="h-8 w-8" />
          Calendar Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect a Google Calendar to enable scheduling features for all users through the AI agent.
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Current Google Calendar integration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Connected by:</span>
                    <span>{calendarStatus.connectedBy?.name} ({calendarStatus.connectedBy?.email})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Connected at:</span>
                    <span>{calendarStatus.connectedAt ? new Date(calendarStatus.connectedAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                  
                  {calendarStatus.expiresAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Expires at:</span>
                      <span>{new Date(calendarStatus.expiresAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {calendarStatus.calendarId && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Calendar ID:</span>
                      <span className="font-mono text-xs">{calendarStatus.calendarId}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleDisconnect}
                    disabled={actionLoading}
                    variant="destructive"
                    className="w-full md:w-auto"
                  >
                    {actionLoading ? 'Disconnecting...' : 'Disconnect Calendar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Not Connected
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">
                  No Google Calendar is currently connected. Connect one to enable scheduling features.
                </p>

                <Button 
                  onClick={handleConnect}
                  disabled={actionLoading}
                  className="w-full md:w-auto"
                >
                  {actionLoading ? 'Connecting...' : 'Connect Google Calendar'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              Understanding the calendar integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">For Admins:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Connect a Google Calendar using OAuth</li>
                <li>• Only one calendar can be connected at a time</li>
                <li>• The calendar will be available to all users through the AI agent</li>
                <li>• You can disconnect and reconnect as needed</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">For Users:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Ask the AI agent to schedule meetings or check availability</li>
                <li>• The agent can create, read, and manage calendar events</li>
                <li>• All calendar actions go through the connected Google Calendar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
