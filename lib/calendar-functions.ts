// Google Calendar function definitions for the AI agent
export const calendarFunctions = [
  {
    type: "function",
    name: "search_events",
    description: "Search for calendar events within a time range. Use this to check availability or find existing events.",
    parameters: {
      type: "object",
      properties: {
        timeMin: {
          type: "string",
          description: "Lower bound (exclusive) for an event's end time to filter by. Must be an RFC3339 timestamp with mandatory time zone offset, e.g., 2011-06-03T10:00:00-07:00"
        },
        timeMax: {
          type: "string", 
          description: "Upper bound (exclusive) for an event's start time to filter by. Must be an RFC3339 timestamp with mandatory time zone offset, e.g., 2011-06-03T10:00:00-07:00"
        },
        query: {
          type: "string",
          description: "Free text search terms to find events that match these terms in any field, except for extended properties. Optional."
        }
      },
      required: [],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function", 
    name: "create_event",
    description: "Create a new calendar event. Use this to schedule meetings, appointments, or any calendar event.",
    parameters: {
      type: "object",
      properties: {
        eventData: {
          type: "object",
          description: "The event data object",
          properties: {
            summary: {
              type: "string",
              description: "The event title/summary"
            },
            description: {
              type: "string", 
              description: "Description of the event. Optional."
            },
            start: {
              type: "object",
              description: "The start time of the event",
              properties: {
                dateTime: {
                  type: "string",
                  description: "The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone."
                },
                timeZone: {
                  type: "string",
                  description: "The time zone in which the time is specified. Optional, defaults to the calendar's timezone."
                }
              },
              required: ["dateTime"],
              additionalProperties: false
            },
            end: {
              type: "object", 
              description: "The end time of the event",
              properties: {
                dateTime: {
                  type: "string",
                  description: "The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone."
                },
                timeZone: {
                  type: "string",
                  description: "The time zone in which the time is specified. Optional, defaults to the calendar's timezone."
                }
              },
              required: ["dateTime"],
              additionalProperties: false
            },
            attendees: {
              type: "array",
              description: "List of attendees for the event. Optional.",
              items: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    description: "The attendee's email address"
                  },
                  displayName: {
                    type: "string",
                    description: "The attendee's display name. Optional."
                  }
                },
                required: ["email"],
                additionalProperties: false
              }
            },
            location: {
              type: "string",
              description: "Geographic location of the event as free-form text. Optional."
            }
          },
          required: ["summary", "start", "end"],
          additionalProperties: false
        }
      },
      required: ["eventData"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "update_event", 
    description: "Update an existing calendar event. Use this to modify event details like time, title, or attendees.",
    parameters: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "The ID of the event to update"
        },
        eventData: {
          type: "object",
          description: "The updated event data object (same structure as create_event)",
          properties: {
            summary: {
              type: "string",
              description: "The event title/summary"
            },
            description: {
              type: "string",
              description: "Description of the event. Optional."
            },
            start: {
              type: "object",
              description: "The start time of the event",
              properties: {
                dateTime: {
                  type: "string",
                  description: "The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone."
                },
                timeZone: {
                  type: "string",
                  description: "The time zone in which the time is specified. Optional, defaults to the calendar's timezone."
                }
              },
              required: ["dateTime"],
              additionalProperties: false
            },
            end: {
              type: "object",
              description: "The end time of the event", 
              properties: {
                dateTime: {
                  type: "string",
                  description: "The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone."
                },
                timeZone: {
                  type: "string",
                  description: "The time zone in which the time is specified. Optional, defaults to the calendar's timezone."
                }
              },
              required: ["dateTime"],
              additionalProperties: false
            },
            attendees: {
              type: "array",
              description: "List of attendees for the event. Optional.",
              items: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    description: "The attendee's email address"
                  },
                  displayName: {
                    type: "string",
                    description: "The attendee's display name. Optional."
                  }
                },
                required: ["email"],
                additionalProperties: false
              }
            },
            location: {
              type: "string",
              description: "Geographic location of the event as free-form text. Optional."
            }
          },
          required: ["summary", "start", "end"],
          additionalProperties: false
        }
      },
      required: ["eventId", "eventData"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "delete_event",
    description: "Delete a calendar event. Use this to cancel or remove events.",
    parameters: {
      type: "object", 
      properties: {
        eventId: {
          type: "string",
          description: "The ID of the event to delete"
        }
      },
      required: ["eventId"],
      additionalProperties: false
    },
    strict: true
  }
]

// Function to execute calendar functions
export async function executeCalendarFunction(functionName: string, args: any) {
  const response = await fetch('/api/calendar/functions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      function_name: functionName,
      arguments: args
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Calendar function failed')
  }

  const result = await response.json()
  return result.result
}
