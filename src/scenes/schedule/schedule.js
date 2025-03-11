import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar, { formatDate } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Typography, useTheme } from '@mui/material';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import classNames from 'classnames/bind';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

import Header from '../../components/Header';
import { tokens } from '../../theme';
import Modal from '~/components/Modal';
import { fetchAllScheduleByHospital, fetchCreateSchedule } from '~/redux/schedule/scheduleSlice';
import { fetchDoctorByHospital } from '~/redux/doctor/doctorSlice';

import styles from './schedule.module.scss';
import { toast } from 'react-toastify';
const cx = classNames.bind(styles);

const Calendar = () => {
  const theme = useTheme();
  const token = Cookies.get('login');
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isModalCreate, setIsModalCreate] = useState(false);
  const [isModalDetail, setIsModalDetail] = useState(false);
  const [doctorOption, setDoctorOption] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const userLogin = useSelector((state) => state.auth.user?.payload);
  const hospitalId = userLogin?.userData?._id;
  const userRole = token ? jwtDecode(token).role : 'guest';

  console.log('check userRole', userRole);

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
    // if (window.confirm(`Are you sure you want to delete the event '${selected.event.title}'`)) {
    //   selected.event.remove();
    // }
    setIsModalDetail(true);
  };

  const fetchDoctor = async () => {
    try {
      const res = await dispatch(fetchDoctorByHospital(hospitalId));
      const result = unwrapResult(res);
      const doctor = result.data.map((doctor) => ({
        value: doctor._id,
        label: doctor.fullName,
      }));
      setDoctorOption(doctor);
    } catch (error) {}
  };

  const fetchScheduleByHospital = async () => {
    try {
      const response = await dispatch(fetchAllScheduleByHospital());
      const result = unwrapResult(response);
      const scheduleData = result?.data?.flatMap((schedule) =>
        schedule.hours.map((hour) => ({
          title: schedule.doctor.fullName || 'No Doctor Info',
          position: schedule.doctor.positionId || 'No Doctor Info',
          start: `${hour.start}`,
          end: `${hour.end}`,
        })),
      );
      console.log('check scheduleData', scheduleData);
      setEvents(scheduleData);
    } catch (error) {}
  };

  const submitForm = async (data) => {
    try {
      let hours = [{ start: data.start, end: data.end, price: data.price }];
      const formData = {
        date: data.date,
        doctorId: data.doctor.value,
        hospitalId: hospitalId,
        hours,
      };

      const res = await dispatch(fetchCreateSchedule(formData));
      const result = unwrapResult(res);
      if (result.status) {
        fetchScheduleByHospital();
        setIsModalCreate(false);
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    fetchScheduleByHospital();
    fetchDoctor();
  }, [dispatch]);

  return (
    <div className="mx-6">
      <Header title="Lịch làm việc" subtitle="Làm việc hiệu quả" />
      <div className="flex justify-end ">
        <button
          onClick={() => setIsModalCreate(true)}
          className=" text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
        >
          Thêm lịch hẹn
        </button>
      </div>
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
            timeZone="Asia/Ho_Chi_Minh"
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            eventContent={(arg) => {
              const startUTC = arg.event.start;
              const endUTC = arg.event.end;
              const start =
                new Date(startUTC).getUTCHours().toString().padStart(2, '0') +
                ':' +
                new Date(startUTC).getUTCMinutes().toString().padStart(2, '0');

              const end = endUTC
                ? new Date(endUTC).getUTCHours().toString().padStart(2, '0') +
                  ':' +
                  new Date(endUTC).getUTCMinutes().toString().padStart(2, '0')
                : 'N/A';

              return (
                <div>
                  <div className="text-white">
                    {start} - {end ? end : 'N/A'}
                  </div>
                  <b className="text-white">{arg.event.title}</b>
                </div>
              );
            }}
          />
        </div>
      </div>
      <Modal isOpen={isModalCreate} onClose={() => setIsModalCreate(false)} title="Lịch làm việc">
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="mx-6">
            <div className="pb-3">
              <div className="grid grid-cols-2 gap-10 mt-4">
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="text-black font-semibold">Bác sĩ</h2>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </div>

                  <div className="mt-2">
                    <Controller
                      name="doctor"
                      as={Select}
                      control={control}
                      rules={{ required: 'required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: state.isFocused ? '#999' : '#999',
                              height: '48px',
                              boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                            }),
                          }}
                          className="text-black"
                          options={[{ value: '', label: '--- Bác sĩ', isDisabled: true }, ...doctorOption]}
                          placeholder="Chọn bác sĩ ..."
                        />
                      )}
                    />

                    {errors.doctor && errors.doctor.type === 'required' ? (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{'Chọn bác sĩ'}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="text-black font-semibold">Ngày</h2>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      data-date=""
                      data-date-format="DD MMMM YYYY"
                      className={cx('customInput', 'text-black')}
                      placeholder="Số điện thoại ..."
                      {...register('date', { required: 'Vui lòng Chọn ngày' })}
                    />

                    {errors.date && (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{errors.date.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-10 mt-4">
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="text-black font-semibold">Bắt đầu</h2>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </div>

                  <div className="mt-2">
                    <input
                      type="time"
                      name="start"
                      id="start"
                      className={cx('customInput', 'text-black')}
                      placeholder="chọn giờ ..."
                      {...register('start', { required: 'Vui lòng Chọn giờ' })}
                    />

                    {errors.start && (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{errors.start.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="text-black font-semibold">Kết thúc</h2>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </div>

                  <div className="mt-2">
                    <input
                      type="time"
                      name="end"
                      id="end"
                      className={cx('customInput', 'text-black')}
                      placeholder="chọn giờ ..."
                      {...register('end', { required: 'Vui lòng Chọn giờ' })}
                    />

                    {errors.end && (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{errors.end.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="text-black font-semibold">Giá</h2>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="price"
                      id="price"
                      className={cx('customInput', 'text-black')}
                      placeholder="Giá khám ..."
                      {...register('price', { required: 'Vui lòng nhập giá' })}
                    />

                    {errors.price && (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{errors.price.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-t justify-end gap-10 pt-3 pb-6">
              <button className="bg-yellow-400 text-white px-6 rounded-md hover:bg-yellow-500 ">Nhập lại</button>
              <button type="submit" className="bg-cyan-400 text-white rounded-md px-10 py-2 hover:bg-cyan-500">
                Tạo mới
              </button>
            </div>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isModalDetail} onClose={() => setIsModalDetail(false)} title="Chi tiết lịch làm việc">
        <h1 className="text-black">Xem chi tiết lịch làm việc</h1>
        <h1 className="text-red-500">hoàn thiện trong sau</h1>
      </Modal>
    </div>
  );
};

export default Calendar;
