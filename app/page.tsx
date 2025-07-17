"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
} from "lucide-react"

// Update CalendarEvent to use hex color
interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string; // hex color
  date: string; // YYYY-MM-DD
  description: string;
  location: string;
  attendees: string[];
  organizer: string;
}

// Helper: get start of week (Sunday)
function getStartOfWeek(date: Date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper: format date as YYYY-MM-DD (local, no timezone shift)
function formatDate(date: Date) {
  // Get local date parts
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: get week days as Date[]
function getWeekDates(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

// Helper: get month name
function getMonthName(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

// Helper: get events from localStorage
function loadEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('calendar-events')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Helper: save events to localStorage
function saveEvents(events: CalendarEvent[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('calendar-events', JSON.stringify(events))
  }
}

// Helper: check if color is light
function isColorLight(hex: string) {
  if (!hex) return false;
  const c = hex.substring(1); // strip #
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  // Perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "LLooks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  // Calendar state
  const today = new Date()
  const [weekStart, setWeekStart] = useState(getStartOfWeek(today))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventFormData, setEventFormData] = useState<Partial<CalendarEvent>>({})

  // Add currentView state for calendar view switching
  const [currentView, setCurrentView] = useState("week")

  // Load events from localStorage on mount
  useEffect(() => {
    setEvents(loadEvents())
  }, [])

  // Save events to localStorage when changed
  useEffect(() => {
    saveEvents(events)
  }, [events])

  // Navigation handlers
  const goToPrevWeek = () => setWeekStart(prev => {
    const d = new Date(prev)
    d.setDate(d.getDate() - 7)
    return getStartOfWeek(d)
  })
  const goToNextWeek = () => setWeekStart(prev => {
    const d = new Date(prev)
    d.setDate(d.getDate() + 7)
    return getStartOfWeek(d)
  })
  const goToToday = () => setWeekStart(getStartOfWeek(new Date()))

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => setSelectedEvent(event)
  // Update handleAddEvent to accept a date string
  const handleAddEvent = (date: string) => {
    setEventFormData({
      date,
      startTime: '09:00',
      endTime: '10:00',
      color: '#3b82f6', // default to blue-500 hex
      title: '',
      description: '',
      location: '',
      attendees: [],
      organizer: '',
    })
    setShowEventForm(true)
  }
  const handleEditEvent = (event: CalendarEvent) => {
    setEventFormData(event)
    setShowEventForm(true)
  }
  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id))
    setSelectedEvent(null)
  }
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventFormData.title || !eventFormData.startTime || !eventFormData.endTime || !eventFormData.date) return
    if (eventFormData.id) {
      setEvents(events.map(ev => ev.id === eventFormData.id ? { ...ev, ...eventFormData } as CalendarEvent : ev))
    } else {
      setEvents([
        ...events,
        {
          ...eventFormData,
          id: Date.now(),
          attendees: eventFormData.attendees || [],
          organizer: eventFormData.organizer || '',
          color: eventFormData.color || '#3b82f6',
        } as CalendarEvent
      ])
    }
    setShowEventForm(false)
    setEventFormData({})
  }
  const handleFormCancel = () => {
    setShowEventForm(false)
    setEventFormData({})
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically also control the actual audio playback
  }

  // Sample calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample calendar for mini calendar
  const daysInMonth = 31
  const firstDayOffset = 5 // Friday is the first day of the month in this example
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  // Sample my calendars
  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
              onClick={() => {
                // Default to today if in current week, else first day of week
                const weekDates = getWeekDates(weekStart)
                const todayStr = formatDate(new Date())
                const found = weekDates.find(d => formatDate(d) === todayStr)
                handleAddEvent(found ? todayStr : formatDate(weekDates[0]))
              }}>
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{getMonthName(weekStart)}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20" onClick={goToPrevWeek}>
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {getWeekDates(weekStart).map((date, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer ${
                      date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"
                    } ${new Date() > date ? "line-through text-white/50" : ""}`}
                    onClick={() => handleAddEvent(formatDate(date))}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New position for the big plus button */}
          <button className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start">
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button onClick={goToToday} className="px-4 py-2 text-white bg-blue-500 rounded-md">Today</button>
              <div className="flex">
                <button onClick={goToPrevWeek} className="p-2 text-white hover:bg-white/10 rounded-l-md">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={goToNextWeek} className="p-2 text-white hover:bg-white/10 rounded-r-md">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">{getMonthName(weekStart)}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
              {/* Week Header */}
              <div className="grid grid-cols-8 border-b border-white/20">
                <div className="p-2 text-center text-white/50 text-xs"></div>
                {getWeekDates(weekStart).map((date, i) => (
                  <div key={i} className="p-2 text-center border-l border-white/20">
                    <div className="text-xs text-white/70 font-medium">{weekDays[date.getDay()]}</div>
                    <div className={`text-lg font-medium mt-1 text-white ${date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear() ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Labels */}
                <div className="text-white/70">
                  {timeSlots.map((time, i) => (
                    <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                      {time > 12 ? `${time - 12} PM` : `${time} AM`}
                    </div>
                  ))}
                </div>
                {/* Days Columns */}
                {getWeekDates(weekStart).map((date, dayIndex) => (
                  <div key={dayIndex} className="border-l border-white/20 relative">
                    {timeSlots.map((_, timeIndex) => (
                      <div key={timeIndex} className="h-20 border-b border-white/10"></div>
                    ))}
                    {/* Events for this date */}
                    {events
                      .filter(event => event.date === formatDate(date))
                      .map((event, i) => {
                        const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                        const textColor = isColorLight(event.color) ? '#222' : '#fff';
                        return (
                          <div
                            key={i}
                            className={`absolute rounded-md p-2 text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                            style={{
                              ...eventStyle,
                              left: "4px",
                              right: "4px",
                              backgroundColor: event.color || '#3b82f6',
                              color: textColor,
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-medium flex justify-between items-center gap-2">
                              <span>{event.title}</span>
                              <span className="flex gap-1 ml-2">
                                <button
                                  className="hover:bg-white/20 rounded p-1"
                                  title="Edit"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleEditEvent(event);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
                                </button>
                                <button
                                  className="hover:bg-white/20 rounded p-1"
                                  title="Delete"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event.id);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </span>
                            </div>
                            <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {selectedEvent.date}
                </p>
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.join(", ") || "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Form - New Feature */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-0 flex flex-col rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden border-2 border-blue-300 relative animate-fade-in">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-blue-500 transition-colors text-xl z-10"
                onClick={handleFormCancel}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2 px-8 pt-8">
                <Calendar className="h-6 w-6 text-blue-400" />
                Event Details
              </h3>
              <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-y-auto space-y-5 px-8 pb-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={eventFormData.title}
                    onChange={handleFormChange}
                    className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900 placeholder:text-blue-300"
                    required
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={eventFormData.description}
                    onChange={handleFormChange}
                    className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900 placeholder:text-blue-300"
                    rows={2}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={eventFormData.startTime}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={eventFormData.endTime}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={eventFormData.date || ''}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Color</label>
                    <input
                      type="color"
                      name="color"
                      value={eventFormData.color}
                      onChange={handleFormChange}
                      className="block w-12 h-10 rounded-lg border-2 border-blue-200 bg-blue-50 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={eventFormData.location}
                    onChange={handleFormChange}
                    className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900 placeholder:text-blue-300"
                    placeholder="Event location"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Attendees</label>
                    <input
                      type="text"
                      name="attendees"
                      value={eventFormData.attendees?.join(", ")}
                      onChange={(e) => setEventFormData({ ...eventFormData, attendees: e.target.value.split(", ") })}
                      className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900 placeholder:text-blue-300"
                      placeholder="Enter emails separated by commas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Organizer</label>
                    <input
                      type="text"
                      name="organizer"
                      value={eventFormData.organizer}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 bg-blue-50 text-blue-900 placeholder:text-blue-300"
                      placeholder="Organizer name"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6 bg-white pt-4 sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={handleFormCancel}
                    className="px-5 py-2 rounded-lg bg-gray-100 text-blue-700 font-semibold hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors shadow-md"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Action Button - Removed */}
      </main>
    </div>
  )
}
