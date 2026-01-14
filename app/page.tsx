"use client"
import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronUp, Share2, Calendar, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
const MIN_EVENT_SPACING = 140
const BASE_YEAR_PADDING = 60
const CATEGORY_COLORS = {
  injury: { color: "hsl(var(--injury))", label: "Injury" },
  diagnostic: { color: "hsl(var(--diagnostic))", label: "Diagnostic Tests" },
  injection: { color: "hsl(var(--injection))", label: "Injection" },
  therapy: { color: "hsl(var(--therapy))", label: "Physical Therapy" },
  holistic: { color: "hsl(var(--holistic))", label: "Holistic Therapy" },
  medication: { color: "hsl(var(--medication))", label: "Medication" },
  surgery: { color: "hsl(var(--surgery))", label: "Surgery" },
}
const matchCategory = (value: string): keyof typeof CATEGORY_COLORS => {
  const lowerValue = value.toLowerCase()
  const categories = Object.keys(CATEGORY_COLORS) as (keyof typeof CATEGORY_COLORS)[]
  for (const category of categories) {
    if (lowerValue.includes(category)) return category
  }
  return "injury"
}
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
interface TimelineEvent {
  date: string
  title: string
  description: string
  category: keyof typeof CATEGORY_COLORS
  url?: string
  side?: "left" | "right"
}
const Legend = ({ activeCategories, onToggleCategory, onRefresh, isLoading }: { activeCategories: string[]; onToggleCategory: (category: string) => void; onRefresh: () => void; isLoading: boolean }) => (
  <header className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md shadow-md border-b border-border z-50">
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Medical Timeline (2019-2027)</h1>
        <Button onClick={onRefresh} disabled={isLoading} size="sm" className="gap-2" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
        {Object.entries(CATEGORY_COLORS).map(([category, config]) => (
          <button key={category} onClick={() => onToggleCategory(category)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs sm:text-sm font-medium ${activeCategories.includes(category) ? "bg-accent shadow-sm border border-border" : "bg-muted/50 opacity-50 hover:opacity-70"}`}>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: config.color }} />
            <span>{config.label}</span>
          </button>
        ))}
      </div>
    </div>
  </header>
)
const TimelineEvent = ({ event, eventIndex, onEventClick, isExpanded, isOnTop }: { event: TimelineEvent; eventIndex: number; onEventClick: (index: number) => void; isExpanded: boolean; isOnTop: boolean }) => {
  const color = CATEGORY_COLORS[event.category].color
  const { toast } = useToast()
  const positionClasses = event.side === "left" ? "left-4 right-4 md:right-1/2 md:left-auto md:mr-8" : "left-4 right-4 md:left-1/2 md:right-auto md:ml-8"
  const zIndex = isOnTop ? 100 : isExpanded ? 50 : 10
  return (
    <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${positionClasses} md:w-80 lg:w-96`} style={{ zIndex }}>
      <div className={`hidden md:block absolute top-1/2 translate-y-[0.35rem] ${event.side === "left" ? "-right-8" : "-left-8"} w-8 border-t-2 opacity-40`} style={{ borderColor: color }} />
      <div className={`relative bg-white p-3 md:p-4 rounded-xl shadow-sm border-2 cursor-pointer hover:shadow-md transition-all duration-300 ${isExpanded ? "shadow-lg" : ""} ${isOnTop ? "shadow-xl ring-2 ring-primary/20" : ""}`} style={{ borderColor: color, backgroundColor: "white" }} onClick={() => onEventClick(eventIndex)}>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-foreground leading-tight pr-2">{event.title}</h3>
              <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1">{formatDate(event.date)}</div>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {isExpanded ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />}
            </div>
          </div>
          {isExpanded && (
            <div className="mt-3 border-t border-border pt-3">
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${color}15`, color: color, borderWidth: "1px", borderStyle: "solid", borderColor: color }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {CATEGORY_COLORS[event.category].label}
                </span>
              </div>
              <div className="text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{event.description}</div>
              {event.url && (
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(event.url!); toast({ title: "Link copied to clipboard" }) }} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors">
                    <Share2 className="w-3 h-3" />
                    <span>Copy detailed medical record link</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
const YearMarker = ({ year, top }: { year: number; top: number }) => (
  <div className="absolute left-1/2 transform -translate-x-1/2 z-20" style={{ top: `${top}px` }}>
    <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-border shadow-sm" style={{ backgroundColor: "#e8eef4" }}>{year}</div>
  </div>
)
export default function MedicalTimeline() {
  const [expandedEvents, setExpandedEvents] = useState(new Set<number>())
  const [topEvent, setTopEvent] = useState<number | null>(null)
  const [activeCategories, setActiveCategories] = useState(Object.keys(CATEGORY_COLORS))
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const { toast } = useToast()
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027]
  const { spacedEvents, yearPositions, totalHeight } = useMemo(() => {
    const filtered = events.filter((event) => activeCategories.includes(event.category))
    const withDates = filtered.map((event, index) => ({
      ...event,
      originalIndex: index,
      timestamp: new Date(event.date).getTime(),
      year: new Date(event.date).getFullYear()
    }))
    withDates.sort((a, b) => a.timestamp - b.timestamp)
    const positioned: Array<typeof withDates[0] & { position: number }> = []
    let currentPosition = BASE_YEAR_PADDING
    const yearStarts = new Map<number, number>()
    for (const event of withDates) {
      if (!yearStarts.has(event.year)) {
        currentPosition = Math.max(currentPosition, currentPosition + BASE_YEAR_PADDING)
        yearStarts.set(event.year, currentPosition)
      }
      positioned.push({ ...event, position: currentPosition })
      currentPosition += MIN_EVENT_SPACING
    }
    const yearPos = new Map<number, number>()
    years.forEach(year => {
      const yearStart = yearStarts.get(year)
      if (yearStart !== undefined) {
        yearPos.set(year, yearStart - 30)
      } else {
        const prevYears = years.filter(y => y < year && yearStarts.has(y))
        if (prevYears.length > 0) {
          const lastYear = Math.max(...prevYears)
          const lastYearEvents = positioned.filter(e => e.year === lastYear)
          const lastEventPos = lastYearEvents.length > 0 ? Math.max(...lastYearEvents.map(e => e.position)) : yearStarts.get(lastYear) || 0
          yearPos.set(year, lastEventPos + MIN_EVENT_SPACING)
        } else {
          yearPos.set(year, BASE_YEAR_PADDING)
        }
      }
    })
    const height = positioned.length > 0 ? Math.max(...positioned.map(e => e.position)) + 200 : 1000
    return { spacedEvents: positioned, yearPositions: yearPos, totalHeight: height }
  }, [events, activeCategories, years])
  const fetchDataFromSheet = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwUXAGyM3GDE7OaQmnpdmpgXW08rggFwq6on4WhWH2v05JWhnCV9zcUTgmL9D4pUGfbjQ/exec")
      const data = await response.json()
      const parsedEvents: TimelineEvent[] = []
      let side: "left" | "right" = "left"
      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        if (row.length < 3) continue
        const categoryValue = (row[4] || "injury").toString().trim()
        const event: TimelineEvent = { date: row[0] || "", title: row[1] || "", description: row[2] || "", category: matchCategory(categoryValue), url: row[5] || "", side: side }
        side = side === "left" ? "right" : "left"
        if (!event.date || !event.title) continue
        parsedEvents.push(event)
      }
      setEvents(parsedEvents)
      toast({ title: `Timeline refreshed! ${parsedEvents.length} events loaded` })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({ title: "Error loading data", description: "Please try again", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => { fetchDataFromSheet() }, [])
  const toggleCategory = (category: string) => { setActiveCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category])) }
  const handleEventClick = (eventIndex: number) => { setTopEvent(eventIndex); const newExpandedEvents = new Set(expandedEvents); if (expandedEvents.has(eventIndex)) { newExpandedEvents.delete(eventIndex) } else { newExpandedEvents.add(eventIndex) }; setExpandedEvents(newExpandedEvents) }
  const handleWelcomeRefresh = () => { setShowWelcomeModal(false); fetchDataFromSheet() }
  return (
    <div className="min-h-screen bg-background">
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-foreground mb-3">Medical Timeline</h2>
            <p className="text-muted-foreground mb-6">This is a comprehensive timeline documenting a chronic low back pain journey from 2019 to 2027. Click refresh to load the latest data from the medical records.</p>
            <Button onClick={handleWelcomeRefresh} disabled={isLoading} className="w-full gap-2" size="lg" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Loading...</>) : (<><RefreshCw className="w-4 h-4" />Refresh Timeline</>)}
            </Button>
          </div>
        </div>
      )}
      <Legend activeCategories={activeCategories} onToggleCategory={toggleCategory} onRefresh={fetchDataFromSheet} isLoading={isLoading} />
      <main className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-44 sm:pt-36" style={{ zIndex: 1 }}>
        <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-card rounded-xl shadow-sm border border-border">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">Timeline Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div><span className="font-medium text-foreground">Total Events:</span> <span className="text-muted-foreground">{events.length}</span></div>
            <div><span className="font-medium text-foreground">Time Span:</span> <span className="text-muted-foreground">9+ years</span></div>
            <div><span className="font-medium text-foreground">Categories:</span> <span className="text-muted-foreground">{Object.keys(CATEGORY_COLORS).length}</span></div>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">This timeline represents a comprehensive medical journey from initial injury through various treatments, setbacks, and ongoing management. Events are automatically spaced for clarity, and same-date events are grouped together.</p>
        </section>
        <div className="relative" style={{ height: `${totalHeight + 300}px`, overflow: "visible" }}>
          {years.map((year) => { const yearTop = yearPositions.get(year) || 0; return <YearMarker key={year} year={year} top={yearTop} /> })}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 rounded-full" style={{ height: `${totalHeight}px`, background: "linear-gradient(180deg, hsl(var(--border)) 0%, hsl(var(--primary)) 50%, hsl(var(--border)) 100%)" }} />
          {spacedEvents.map((event, index) => (
            <div key={index} className="absolute w-full" style={{ top: `${event.position}px` }}>
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 z-[5]">
                  <div className="w-3.5 h-3.5 rounded-full shadow-md border-2 border-card" style={{ backgroundColor: CATEGORY_COLORS[event.category].color }} />
                </div>
                <TimelineEvent event={event} eventIndex={index} onEventClick={handleEventClick} isExpanded={expandedEvents.has(index)} isOnTop={topEvent === index} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
