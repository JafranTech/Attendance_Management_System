import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, subMonths, addDays, subDays } from 'date-fns'
import {
  Users, UserCheck, UserX, Calendar, AlertTriangle,
  BookOpen, User, CheckCircle2, XCircle, Clock, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react'

import { HodLayout } from '../../components/hod/HodLayout'
import { useHodDailyAttendance, useHodStudentsWithPercentage, useHodCourseAttendanceSummary } from '../../hooks/useHod'
import { LOW_ATTENDANCE_THRESHOLD } from '../../services/hodService'
import { supabase } from '../../lib/supabase'
import { useQuery } from '@tanstack/react-query'

const TABS = [
  { id: 'daily', label: 'Daily Attendance' },
  { id: 'low', label: 'Low Attendance' },
  { id: 'all', label: 'All Students %' },
]

export default function HodCourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')
  const defaultStartDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  
  const [selectedDate, setSelectedDate] = useState(today)
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(today)
  const [activeTab, setActiveTab] = useState('daily')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handlePrevDate = () => {
    const prevDate = subDays(new Date(selectedDate), 1)
    setSelectedDate(format(prevDate, 'yyyy-MM-dd'))
  }

  const handleNextDate = () => {
    if (selectedDate < today) {
      const nextDate = addDays(new Date(selectedDate), 1)
      setSelectedDate(format(nextDate, 'yyyy-MM-dd'))
    }
  }

  // Fetch course info
  const { data: course } = useQuery({
    queryKey: ['hod', 'course-info', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, course_code, course_name, semester, faculty:faculty_id(name), target_class_id, classes:target_class_id(id, name)')
        .eq('id', courseId)
        .single()
      if (error) throw new Error('Course not found')
      return data
    },
    enabled: !!courseId,
  })

  const { data: sessions, isLoading: sessionsLoading } = useHodDailyAttendance(courseId, selectedDate)
  const { data: studentsWithPct, isLoading: pctLoading } = useHodStudentsWithPercentage(courseId, startDate, endDate)
  const { data: summary } = useHodCourseAttendanceSummary(courseId, startDate, endDate)

  const classId = course?.target_class_id

  // Aggregate daily stats across all hours
  const allDetails = sessions?.flatMap(s => s.attendance_details ?? []) ?? []
  const uniqueStudentMap = {}
  allDetails.forEach(d => {
    if (!uniqueStudentMap[d.student_id]) {
      uniqueStudentMap[d.student_id] = { ...d.students, statuses: [] }
    }
    uniqueStudentMap[d.student_id].statuses.push(d.status)
  })
  const uniqueStudents = Object.values(uniqueStudentMap)
  const totalStudents = uniqueStudents.length
  const totalSessions = sessions?.length ?? 0

  // Per-hour stats
  const hourStats = sessions?.map(s => {
    const present = s.attendance_details?.filter(d => d.status === 'Present').length ?? 0
    const total = s.attendance_details?.length ?? 0
    return { hour: s.hour, present, absent: total - present, total, isHoliday: s.is_holiday, holidayReason: s.holiday_reason }
  }) ?? []

  const totalPresent = allDetails.filter(d => d.status === 'Present').length
  const totalAbsent = allDetails.filter(d => d.status === 'Absent').length

  // Absentees for daily view: students who were absent in ANY hour
  const absentStudents = uniqueStudents.filter(s => s.statuses.includes('Absent'))
  const lowAttStudents = studentsWithPct?.filter(s => s.isLow) ?? []

  const isToday = selectedDate === today

  return (
    <HodLayout backTo={classId ? `/hod/class/${classId}` : '/hod/dashboard'} backLabel={course?.classes?.name || 'Back'}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3 flex-wrap font-medium">
          <button onClick={() => navigate('/hod/dashboard')} className="hover:text-indigo-600 transition-colors">Classes</button>
          {classId && (
            <>
              <span>/</span>
              <button onClick={() => navigate(`/hod/class/${classId}`)} className="hover:text-indigo-600 transition-colors uppercase tracking-wide">
                {course?.classes?.name}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-indigo-600 font-bold">{course?.course_name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <p className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest mb-1">{course?.course_code}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{course?.course_name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap font-medium">
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                {course?.faculty?.name ?? 'Unknown Faculty'}
              </div>
              {course?.semester && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500">{course.semester}</span>
                </>
              )}
              {summary?.overall != null && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className={`text-sm font-bold ${summary.overall < LOW_ATTENDANCE_THRESHOLD ? 'text-red-600' : 'text-emerald-600'}`}>
                    {summary.overall}% overall
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Date / Range Picker */}
          {activeTab === 'daily' ? (
            <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2">
              <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 mb-0.5 font-medium">Viewing date</p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handlePrevDate} 
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-slate-900 text-sm font-bold focus:outline-none cursor-pointer"
                  />
                  <button 
                    onClick={handleNextDate} 
                    disabled={selectedDate >= today}
                    className={`p-0.5 rounded transition-colors focus:outline-none ${selectedDate >= today ? 'opacity-30 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {isToday ? (
                <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full ml-1">TODAY</span>
              ) : (
                <button 
                  onClick={() => setSelectedDate(today)}
                  className="text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors ml-1 cursor-pointer focus:outline-none"
                >
                  GO TO TODAY
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Range:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MiniStat label="Hours Today" value={totalSessions} icon={Clock} color="slate" />
          <MiniStat label="Total Entries" value={totalStudents} icon={Users} color="blue" />
          <MiniStat label="Present" value={totalPresent} icon={UserCheck} color="emerald" />
          <MiniStat label="Absent" value={totalAbsent} icon={UserX} color="red" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-slate-200 shadow-sm w-full sm:w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            {tab.id === 'low' && lowAttStudents.length > 0 && (
              <span className="ml-1.5 text-xs bg-red-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center">
                {lowAttStudents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search / Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full font-medium"
          />
        </div>
        
        {activeTab === 'daily' && (
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Present', 'Absent'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab: Daily Attendance */}
      {activeTab === 'daily' && (
        <div>
          {sessionsLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white border border-slate-100 animate-pulse shadow-sm" />)}
            </div>
          )}

          {!sessionsLoading && sessions?.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl border-dashed">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No attendance marked</p>
              <p className="text-sm mt-1 text-slate-500">No attendance has been recorded for this subject on {format(new Date(selectedDate + 'T00:00:00'), 'dd MMM yyyy')}.</p>
            </div>
          )}

          {/* Per-hour breakdown */}
          {!sessionsLoading && hourStats.length > 0 && (
            <div className="space-y-4">
              {hourStats.map((h, idx) => {
                const hourDetails = sessions?.[idx]?.attendance_details ?? []
                const filteredDetails = hourDetails
                  .filter(d => {
                    const matchesSearch = !searchQuery || 
                      d.students?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      d.students?.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
                    const matchesStatus = statusFilter === 'all' || d.status === statusFilter
                    return matchesSearch && matchesStatus
                  })
                  .sort((a,b) => (a.students?.roll_number || '').localeCompare(b.students?.roll_number || ''))

                return (
                  <div key={h.hour} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    {/* Hour header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 border border-indigo-200 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-700">
                          H{h.hour}
                        </div>
                        <span className="text-sm font-bold text-slate-900">Hour {h.hour}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <UserCheck className="w-4 h-4" /> {h.present} Present
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-bold">
                          <UserX className="w-4 h-4" /> {h.absent} Absent
                        </span>
                      </div>
                    </div>

                    {/* Student list */}
                    <div className="divide-y divide-slate-100">
                      {filteredDetails.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-medium">
                          No students matching filters.
                        </div>
                      ) : (
                        filteredDetails.map(d => (
                          <div key={d.student_id} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{d.students?.name}</p>
                              <p className="text-xs font-medium text-slate-500">{d.students?.roll_number}</p>
                            </div>
                            <StatusBadge status={d.status} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Low Attendance */}
      {activeTab === 'low' && (
        <div>
          {pctLoading && (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-white border border-slate-100 animate-pulse shadow-sm" />)}
            </div>
          )}

          {!pctLoading && lowAttStudents.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl border-dashed">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="font-bold text-slate-700">All students are above {LOW_ATTENDANCE_THRESHOLD}%</p>
              <p className="text-sm text-slate-500 mt-1">Great attendance across this subject!</p>
            </div>
          )}

          {!pctLoading && lowAttStudents.length > 0 && (
            (() => {
              const filteredLow = lowAttStudents.filter(s =>
                !searchQuery || 
                s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              if (filteredLow.length === 0) {
                return (
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl border-dashed">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-700">No students matching search</p>
                  </div>
                )
              }
              return (
                <div className="bg-white border border-red-200 shadow-sm rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-red-100 bg-red-50 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-bold text-red-700">{filteredLow.length} student{filteredLow.length !== 1 ? 's' : ''} below {LOW_ATTENDANCE_THRESHOLD}%</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filteredLow.map(s => (
                      <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs font-medium text-slate-500">{s.roll_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                          </div>
                          <span className="text-sm font-bold text-red-600 w-10 text-right">{s.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()
          )}
        </div>
      )}

      {/* Tab: All Students */}
      {activeTab === 'all' && (
        <div>
          {pctLoading && (
            <div className="space-y-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-14 rounded-xl bg-white border border-slate-100 animate-pulse shadow-sm" />)}
            </div>
          )}

          {!pctLoading && studentsWithPct?.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl border-dashed">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No students enrolled</p>
            </div>
          )}

          {!pctLoading && studentsWithPct && studentsWithPct.length > 0 && (
            (() => {
              const filteredAll = studentsWithPct.filter(s =>
                !searchQuery || 
                s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              if (filteredAll.length === 0) {
                return (
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl border-dashed">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-700">No students matching search</p>
                  </div>
                )
              }
              return (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No.</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAll.map(s => (
                        <tr key={s.id} className={`transition-colors ${s.isLow ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                          <td className="px-5 py-3 text-sm font-mono font-medium text-slate-500">{s.roll_number}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{s.name}</span>
                              {s.isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {s.percentage != null ? (
                              <span className={`text-sm font-bold ${s.isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                                {s.percentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-xs">No data</span>
                            )}
                          </td>
                          <td className="px-5 py-3 hidden sm:table-cell">
                            {s.percentage != null && (
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${s.isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${s.percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()
          )}
        </div>
      )}
    </HodLayout>
  )
}

function StatusBadge({ status }) {
  return status === 'Present' ? (
    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700">
      <CheckCircle2 className="w-3 h-3" /> Present
    </div>
  ) : (
    <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
      <XCircle className="w-3 h-3" /> Absent
    </div>
  )
}

function MiniStat({ label, value, icon: Icon, color }) {
  const map = {
    slate: 'bg-white border-slate-200 text-slate-700 shadow-sm',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  }
  const iconColor = {
    slate: 'text-slate-500',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
  }
  
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-3 ${map[color]}`}>
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor[color]}`} />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">{label}</p>
        <p className={`text-2xl font-black leading-none ${color === 'slate' ? 'text-slate-900' : ''}`}>{value}</p>
      </div>
    </div>
  )
}
