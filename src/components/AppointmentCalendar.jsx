import React, { useState, useEffect, useCallback } from 'react';
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Phone, MapPin, XCircle, AlertCircle } from 'lucide-react';
import useQueue from '../hooks/useAppointments';
import { showToast } from './Toast';
import '../styles/calendar.css';

const AppointmentCalendar = () => {
    const { fetchAppointmentsRange, cancelAppointment, allQueue } = useQueue();
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dbAppointments, setDbAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const start = React.useMemo(() => startOfWeek(anchorDate, { weekStartsOn: 1 }), [anchorDate]);
    const end   = React.useMemo(() => endOfWeek(anchorDate, { weekStartsOn: 1 }), [anchorDate]);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr   = end.toISOString().split('T')[0];

    const loadRangeData = useCallback(async () => {
        setLoading(true);
        const data = await fetchAppointmentsRange(startDateStr, endDateStr);
        setDbAppointments(data);
        setLoading(false);
    }, [startDateStr, endDateStr, fetchAppointmentsRange]);

    useEffect(() => {
        loadRangeData();
    }, [loadRangeData]); // Only fetch when date range or callback stability changes

    const weekDays = [];
    let day = start;
    while (day <= end) {
        weekDays.push(day);
        day = addDays(day, 1);
    }

    const appointmentsForSelectedDate = dbAppointments.filter(app => 
        app.date === selectedDate.toISOString().split('T')[0]
    );

    const handleCancel = async (token, date, name) => {
        if (!window.confirm(`Are you sure you want to cancel the appointment for ${name}?`)) return;
        
        try {
            await cancelAppointment(token, date);
            showToast(`Appointment for ${name} cancelled`, 'info');
            loadRangeData(); // Refresh list
        } catch (err) {
            showToast('Failed to cancel appointment', 'error');
        }
    };

    return (
        <div className="appointment-calendar-container card appointment-calendar-elevated">
            <div className="appointment-calendar-hero">
                <div className="appointment-calendar-overlay">
                    <div className="hero-tag">Live schedule</div>
                    <h3 className="hero-title">
                        {isSameDay(selectedDate, new Date()) ? "Today's" : "Scheduled"} appointments overview
                    </h3>
                    <p className="hero-subtitle">
                        Real-time synchronization with the clinic database. 
                        View and manage patient flow across the week.
                    </p>
                    <div className="hero-meta">
                        <span>{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
                        <span>SmartClinic OPD</span>
                    </div>
                </div>
            </div>

            <div className="appointment-calendar-body">
                {/* Left: simple week strip */}
                <div className="week-strip">
                    <div className="week-strip-header">
                        <button
                            className="icon-btn-sm"
                            onClick={() => {
                                const prev = addDays(anchorDate, -7);
                                setAnchorDate(prev);
                                setSelectedDate(prev);
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="week-range">
                            {format(start, 'dd MMM')} – {format(end, 'dd MMM')}
                        </div>
                        <button
                            className="icon-btn-sm"
                            onClick={() => {
                                const next = addDays(anchorDate, 7);
                                setAnchorDate(next);
                                setSelectedDate(next);
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="week-days">
                        {weekDays.map(d => {
                            const isToday = isSameDay(d, new Date());
                            const isSelected = isSameDay(d, selectedDate);
                            const dateStr = d.toISOString().split('T')[0];
                            const count = dbAppointments.filter(a => a.date === dateStr).length;

                            return (
                                <button
                                    key={d.toString()}
                                    className={`week-day-pill ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                    onClick={() => setSelectedDate(d)}
                                >
                                    <span className="week-day-name">{format(d, 'EEE')}</span>
                                    <span className="week-day-date">{format(d, 'dd')}</span>
                                    {count > 0 && (
                                        <span className="week-day-count">
                                            {count} appt
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: appointments list with richer UI */}
                <div className="appointments-panel">
                    <div className="appointments-panel-header">
                        <div>
                            <span className="panel-label">{format(selectedDate, 'EEEE')}</span>
                            <h4 className="panel-title">{format(selectedDate, 'dd MMMM')}</h4>
                        </div>
                        <div className="panel-meta">
                            <span className="pill pill-soft">
                                <Clock size={14} />
                                {appointmentsForSelectedDate.length} appointments
                            </span>
                        </div>
                    </div>

                    <div className="appointments-panel-list">
                        {loading ? (
                            <div className="p-10 text-center text-faint animate-pulse">
                                Loading schedule...
                            </div>
                        ) : appointmentsForSelectedDate.length === 0 ? (
                            <div className="empty-appointments-state">
                                <p>No appointments on this day.</p>
                                <span>Choose another date or register a new appointment above.</span>
                            </div>
                        ) : (
                            appointmentsForSelectedDate.map(app => (
                                <div key={app.token + app.date} className="appointment-card group">
                                    <div className="appointment-time">
                                        <Clock size={16} />
                                        <span>{app.time}</span>
                                    </div>
                                    <div className="appointment-main">
                                        <div className="appointment-avatar">
                                            {app.name.charAt(0)}
                                        </div>
                                        <div className="appointment-text">
                                            <div className="flex justify-between items-start">
                                                <h5>{app.name}</h5>
                                                <button 
                                                    className="cancel-action-btn opacity-0 group-hover:opacity-100 transition-opacity text-danger hover:bg-danger/10 p-1 rounded"
                                                    onClick={() => handleCancel(app.token, app.date, app.name)}
                                                    title="Cancel Appointment"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                            <p>{app.type} • <span className="font-bold text-primary">{app.token}</span></p>
                                            <div className="appointment-meta-row">
                                                <span><Phone size={12} /> {app.mobile || 'No contact'}</span>
                                                <span className={`status-tag-mini ${app.status?.toLowerCase()}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCalendar;
