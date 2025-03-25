import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar, { formatDate } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Typography, useTheme, Box, Paper } from '@mui/material';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import classNames from 'classnames/bind';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { BiLoaderAlt } from 'react-icons/bi';

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
  const isDarkMode = theme.palette.mode === 'dark';
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isModalCreate, setIsModalCreate] = useState(false);
  const [isModalDetail, setIsModalDetail] = useState(false);
  const [doctorOption, setDoctorOption] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const userLogin = useSelector((state) => state.auth.user?.payload);
  const hospitalId = userLogin?.userData?._id;
  const userRole = token ? jwtDecode(token).role : 'guest';

  const handleEventClick = (selected) => {
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
      setEvents(scheduleData);
    } catch (error) {}
  };

  const submitForm = async (data) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
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
    }finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchScheduleByHospital();
    fetchDoctor();
  }, [dispatch]);

  // Custom styles for Select component based on theme
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? colors.blueAccent[300] : colors.grey[300],
      backgroundColor: isDarkMode ? colors.primary[400] : '#fff',
      height: '48px',
      boxShadow: state.isFocused ? `0 0 0 0.2rem ${colors.blueAccent[100]}` : '',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? isDarkMode ? colors.blueAccent[700] : colors.blueAccent[400]
        : state.isFocused
        ? isDarkMode ? colors.primary[500] : colors.grey[100]
        : isDarkMode ? colors.primary[400] : '#fff',
      color: state.isSelected 
        ? '#fff'
        : isDarkMode ? '#fff' : '#000',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? colors.primary[400] : '#fff',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#000',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? colors.grey[300] : colors.grey[500],
    }),
  };

  //Enhanced input class with theme support
  const inputClass = classNames(
    cx('customInput'),
    'w-full px-3 py-2 rounded-md bg-white text-black border-gray-300',
    'focus:outline-none focus:ring-2',
    isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-cyan-500'
  );
  return (
    <Box className="mx-6">
      <Header title="Lịch làm việc" subtitle="Làm việc hiệu quả" />
      
      {userRole === 'hospital_admin' && (
        <Box className="flex justify-end mb-4">
          <button
            onClick={() => setIsModalCreate(true)}
            className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
          >
            Thêm lịch hẹn
          </button>
        </Box>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          backgroundColor: isDarkMode ? colors.primary[400] : '#fff',
          borderRadius: '8px',
          mb: 3
        }}
      >
        {/* Main calendar area */}
        <Box sx={{ flex: '1 1 auto' }}>
          <div className="fc-theme-standard">
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
                  <Box sx={{
                    backgroundColor: isDarkMode ? colors.blueAccent[700] : colors.blueAccent[400],
                    borderRadius: '4px',
                    p: 0.5,
                    width: '100%',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <Typography
                      variant="caption"
                      sx={{ 
                        color: '#fff',
                        display: 'block',
                        fontSize: '0.7rem'
                      }}
                    >
                      {start} - {end}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: '#fff',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {arg.event.title}
                    </Typography>
                  </Box>
                );
              }}
            />
          </div>
        </Box>
      </Paper>

      {/* Create Modal */}
      <Modal isOpen={isModalCreate} onClose={() => setIsModalCreate(false)} title="Lịch làm việc">
        <form onSubmit={handleSubmit(submitForm)}>
          <Box className="mx-6">
            <Box className="pb-3">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 mt-4">
                <Box className="col-span-1">
                  <Box className="flex">
                    <Typography 
                      className="font-semibold"
                      sx={{ color: 'black' }}
                    >
                      Bác sĩ
                    </Typography>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </Box>

                  <Box className="mt-2">
                    <Controller
                      name="doctor"
                      control={control}
                      rules={{ required: 'required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          styles={{
                            ...selectStyles,
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: 'white',
                              color: 'black'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              color: 'black'
                            })
                          }}
                          options={[{ value: '', label: '--- Bác sĩ', isDisabled: true }, ...doctorOption]}
                          placeholder="Chọn bác sĩ ..."
                        />
                      )}
                    />

                    {errors.doctor && errors.doctor.type === 'required' && (
                      <Typography className="text-red-500 text-sm mt-1">
                        Chọn bác sĩ
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box className="col-span-1">
                  <Box className="flex">
                    <Typography 
                      className="font-semibold"
                      sx={{ color: 'black' }}
                    >
                      Ngày
                    </Typography>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </Box>
                  <Box className="mt-2">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      data-date=""
                      data-date-format="DD MMMM YYYY"
                      className={`${inputClass} text-black`}
                      {...register('date', { required: 'Vui lòng Chọn ngày' })}
                    />

                    {errors.date && (
                      <Typography className="text-red-500 text-sm mt-1">
                        {errors.date.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 mt-4">
                <Box className="col-span-1">
                  <Box className="flex">
                    <Typography 
                      className="font-semibold"
                      sx={{ color: 'black' }}
                    >
                      Bắt đầu
                    </Typography>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </Box>

                  <Box className="mt-2">
                    <input
                      type="time"
                      name="start"
                      id="start"
                      className={`${inputClass} text-black`}
                      {...register('start', { required: 'Vui lòng Chọn giờ' })}
                    />

                    {errors.start && (
                      <Typography className="text-red-500 text-sm mt-1">
                        {errors.start.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box className="col-span-1">
                  <Box className="flex">
                    <Typography 
                      className="font-semibold"
                      sx={{ color: 'black' }}
                    >
                      Kết thúc
                    </Typography>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </Box>

                  <Box className="mt-2">
                    <input
                      type="time"
                      name="end"
                      id="end"
                      className={`${inputClass} text-black`}
                      {...register('end', { required: 'Vui lòng Chọn giờ' })}
                    />

                    {errors.end && (
                      <Typography className="text-red-500 text-sm mt-1">
                        {errors.end.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box className="col-span-1">
                  <Box className="flex">
                    <Typography 
                      className="font-semibold"
                      sx={{ color: 'black' }}
                    >
                      Giá
                    </Typography>
                    <span className="text-rose-600 font-bold pl-2">*</span>
                  </Box>
                  <Box className="mt-2">
                    <input
                      type="text"
                      name="price"
                      id="price"
                      className={`${inputClass} text-black`}
                      placeholder="Giá khám ..."
                      {...register('price', { required: 'Vui lòng nhập giá' })}
                    />

                    {errors.price && (
                      <Typography className="text-red-500 text-sm mt-1">
                        {errors.price.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box className="flex border-t justify-end gap-5 md:gap-10 pt-3 pb-6">
              <button 
                type="button"
                className={`px-6 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-yellow-400 hover:bg-yellow-500'
                } text-white`}
              >
                Nhập lại
              </button>
              <button 
                type="submit" 
                className={`px-10 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-cyan-600 hover:bg-cyan-700' 
                    : 'bg-cyan-400 hover:bg-cyan-500'
                } text-white`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <BiLoaderAlt className="animate-spin mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Tạo mới'
                )}
              </button>
            </Box>
          </Box>
        </form>
      </Modal>
      
      {/* Detail Modal */}
      <Modal isOpen={isModalDetail} onClose={() => setIsModalDetail(false)} title="Chi tiết lịch làm việc">
        <Box sx={{ p: 2, color: isDarkMode ? '#fff' : '#000' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Xem chi tiết lịch làm việc</Typography>
          <Typography className="text-red-500">hoàn thiện trong sau</Typography>
        </Box>
      </Modal>
      
      {/* Add global styles for FullCalendar theming */}
      {/* Add global styles for FullCalendar theming */}
    <style jsx global>{`
      .fc-theme-standard .fc-scrollgrid {
        border-color: ${isDarkMode ? colors.grey[700] : colors.grey[300]};
      }
      
      .fc-theme-standard th {
        background-color: ${isDarkMode ? colors.primary[500] : colors.grey[100]};
        border-color: ${isDarkMode ? colors.grey[700] : colors.grey[300]};
      }
      
      .fc-theme-standard td {
        border-color: ${isDarkMode ? colors.grey[700] : colors.grey[300]};
      }
      
      .fc .fc-daygrid-day-number {
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      /* Luôn hiển thị màu trắng cho tiêu đề cột (thứ) */
      .fc .fc-col-header-cell-cushion {
        color: #fff !important;
      }
      
      .fc .fc-button-primary {
        background-color: ${isDarkMode ? colors.blueAccent[700] : colors.blueAccent[500]};
        border-color: ${isDarkMode ? colors.blueAccent[800] : colors.blueAccent[600]};
      }
      
      .fc .fc-button-primary:hover {
        background-color: ${isDarkMode ? colors.blueAccent[800] : colors.blueAccent[600]};
      }
      
      .fc .fc-button-primary:disabled {
        background-color: ${isDarkMode ? colors.grey[600] : colors.grey[400]};
      }
      
      .fc .fc-toolbar-title {
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      .fc-event {
        cursor: pointer;
      }
      
      .fc-day {
        background-color: ${isDarkMode ? colors.primary[400] : '#fff'};
      }
      
      /* Cập nhật style cho ngày hiện tại */
      .fc-day-today {
        background-color: ${isDarkMode ? colors.primary[600] + '!important' : colors.grey[100] + '!important'};
      }
      
      /* Đảm bảo màu chữ của ngày hiện tại luôn trắng */
      .fc-day-today .fc-daygrid-day-number {
        color: #fff !important;
        font-weight: bold;
      }
      
      /* Sửa màu nền cho phần header (các ô thứ) */
      .fc-col-header-cell {
        background-color: ${isDarkMode ? colors.blueAccent[700] : colors.blueAccent[500]} !important;
      }
      
      .fc .fc-list-sticky .fc-list-day > * {
        background-color: ${isDarkMode ? colors.primary[500] : colors.grey[100]};
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      .fc-timegrid-slot, .fc-timegrid-axis {
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      .fc-timegrid-slot-label-cushion {
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      .fc-list-day-cushion {
        background-color: ${isDarkMode ? colors.primary[500] : colors.grey[100]} !important;
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      /* Ensure text color is correct in both themes */
      .fc .fc-list-event-title a {
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      .fc .fc-list-event-time {
        color: ${isDarkMode ? '#fff' : '#000'} !important;
      }
      
      .fc-direction-ltr .fc-daygrid-event.fc-event-end {
        margin-right: 2px;
      }
      
      .fc-direction-ltr .fc-daygrid-event.fc-event-start {
        margin-left: 2px;
      }
    `}</style>
    </Box>
  );
};

export default Calendar;