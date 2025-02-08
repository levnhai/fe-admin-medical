import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar, { formatDate } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Typography, useTheme } from '@mui/material';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import { fetchAllScheduleByHospital } from '~/redux/schedule/scheduleSlice';
import { unwrapResult } from '@reduxjs/toolkit';

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);

  const handleDateClick = (selected) => {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    if (window.confirm(`Are you sure you want to delete the event '${selected.event.title}'`)) {
      selected.event.remove();
    }
  };

  useEffect(() => {
    const fetchScheduleByHospital = async () => {
      try {
        const response = await dispatch(fetchAllScheduleByHospital());
        const result = unwrapResult(response);
        console.log('check result:', result);

        const scheduleData = result?.data?.flatMap((schedule) =>
          schedule.hours.map((hour) => ({
            title: schedule.doctor.fullName || 'No Doctor Info',
            position: schedule.doctor.positionId || 'No Doctor Info',
            start: `${hour.start}`,
            end: `${hour.end}`,
          })),
        );
        console.log('schedule data:', scheduleData);
        setEvents(scheduleData);
      } catch (error) {}
    };
    fetchScheduleByHospital();
  }, [dispatch]);

  return (
    <div className="m-6">
      <Header title="Lịch làm việc" subtitle="Làm việc hiệu quả" />

      <div display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <div flex="1 1 20%" backgroundColor={colors.primary[400]} p="15px" borderRadius="4px">
          <div>
            {currentEvents.map((event) => (
              <div
                key={event.id}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: '10px 0',
                  borderRadius: '2px',
                }}
              >
                <div
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* CALENDAR */}
        <div flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
            }}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={2}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: true, // 24h
            }}
            // hiển thị thêm giờ kết thúc
            eventContent={(arg) => {
              console.log('checl arg', arg);
              const start = arg.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = arg.event.end
                ? arg.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : null;
              return (
                <div>
                  <div>
                    {start} - {end ? end : 'N/A'}
                  </div>
                  <b>{arg.event.title}</b>
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
