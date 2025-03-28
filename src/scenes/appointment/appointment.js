import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { unwrapResult } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
//import Select from 'react-select';
import { BiLoaderAlt } from 'react-icons/bi';

//icon
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';

import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import {
  fetchAllAppointmentByhospital,
  fetchUpdateStatus,
  fetchDeleteAppointment,
} from '~/redux/appointment/appointmentSlice';
import { formatDate, extractTime } from '~/utils/time';
import Modal from '~/components/Modal';
import Button from '~/components/Button';

const Appointment = () => {
  const dispatch = useDispatch();
  const token = Cookies.get('login');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [statusAppointmentt, setStatusAppointment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);

  console.log('check appointment', appointmentData);

  const [localLoading, setLocalLoading] = useState(true);

  const reduxLoading = useSelector((state) => state.appointment.loading);

  //const isLoading = useSelector((state) => state.appointment.loading);
  const userLogin = useSelector((state) => state.auth.user?.payload);
  const userRole = token ? jwtDecode(token).role : 'guest';
  const hospitalId = userLogin?.userData?._id;
  console.log('check hospitalId', hospitalId);

  // Hàm chuyển đổi chuỗi thành không dấu
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  // const filteredUsers =
  //   appointmentData?.filter((user) => {
  //     if (!searchTerm) return true;

  //     const searchValue = removeAccents(searchTerm.toLowerCase().trim());

  //     // Xử lý trường hợp giá trị null/undefined
  //     const patientName = removeAccents(user?.record?.fullName?.toLowerCase() || '');
  //     const doctorName = removeAccents(user?.doctor?.fullName?.toLowerCase() || '');
  //     const phoneNumber = removeAccents(user?.record?.phoneNumber?.toLowerCase() || '');

  //     return patientName.includes(searchValue) || phoneNumber.includes(searchValue) || doctorName.includes(searchValue);

  //   }) || [];
  const filteredUsers =
    appointmentData?.filter((user) => {
      // Filter by search term
      const searchMatch = !searchTerm
        ? true
        : (() => {
            const searchValue = removeAccents(searchTerm.toLowerCase().trim());
            const patientName = removeAccents(user?.record?.fullName?.toLowerCase() || '');
            const doctorName = removeAccents(user?.doctor?.fullName?.toLowerCase() || '');
            const phoneNumber = removeAccents(user?.record?.phoneNumber?.toLowerCase() || '');
            return (
              patientName.includes(searchValue) || phoneNumber.includes(searchValue) || doctorName.includes(searchValue)
            );
          })();

      // Filter by status
      const statusMatch =
        statusFilter === 'all'
          ? true
          : statusFilter === 'Booked'
          ? user.status === 'Booked'
          : statusFilter === 'Completed'
          ? user.status === 'Completed'
          : statusFilter === 'canceled'
          ? user.status === 'canceled'
          : true;

      return searchMatch && statusMatch;
    }) || [];

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle filter selection
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setShowDropdown(false);
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allUserIds = filteredUsers.map((user) => user._id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteAppointment = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await dispatch(fetchDeleteAppointment(selectedAppointmentId));
      const result = unwrapResult(res);
      setShowModalDelete(false);

      if (result?.status) {
        toast.success(result?.message || 'Xóa lịch khám thành công');
        setSelectedUsers((prev) => prev.filter((id) => id !== selectedAppointmentId));

        // Cập nhật lại danh sách lịch hẹn
        try {
          const appointmentRes = await dispatch(fetchAllAppointmentByhospital());
          const appointmentResult = unwrapResult(appointmentRes);
          const scheduleSort = appointmentResult?.data?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
          setAppointmentData(scheduleSort);
          setStatusAppointment(scheduleSort);
        } catch (error) {
          console.error('Error refreshing appointments:', error);
          toast.error('Đã xóa lịch hẹn, nhưng không thể tải lại danh sách');
        }
      } else {
        toast.warning(result?.message);
      }
    } catch (error) {
      toast.error('Xóa lịch hẹn thất bại');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatusAppointment = async (id, status) => {
    try {
      const res = await dispatch(fetchUpdateStatus({ id, status }));
      const result = unwrapResult(res);

      if (result.status) {
        // Cập nhật lại danh sách sau khi thay đổi
        setAppointmentData((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
        toast.success(result.message);
      }

      console.log('check res', result);
    } catch (error) {}
  };

  // Handle individual checkbox
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Check if all filtered users are selected
  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedUsers.includes(user._id));

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset selected users when search term changes
    setSelectedUsers([]);
  };

  // useEffect(() => {
  //   const fetchAppointment = async () => {
  //     const res = await dispatch(fetchAllAppointmentByhospital());
  //     const result = unwrapResult(res);
  //     const scheduleSort = result?.data?.sort((a, b) => new Date(b.date) - new Date(a.date));
  //     console.log('check result', scheduleSort);
  //     setAppointmentData(scheduleSort);
  //     setStatusAppointment(scheduleSort);
  //   };
  //   fetchAppointment();
  // }, []);
  useEffect(() => {
    const fetchAppointment = async () => {
      setLocalLoading(true);
      try {
        const res = await dispatch(fetchAllAppointmentByhospital());
        const result = unwrapResult(res);
        const scheduleSort = result?.data?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
        console.log('check result', scheduleSort);
        setAppointmentData(scheduleSort);
        setStatusAppointment(scheduleSort);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Không thể tải dữ liệu lịch hẹn');
      } finally {
        setLocalLoading(false);
      }
    };
    fetchAppointment();
  }, []);

  const isLoading = localLoading || reduxLoading;

  // Get status filter label
  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case 'Booked':
        return 'Đã đặt';
      case 'Completed':
        return 'Đã khám';
      case 'canceled':
        return 'Đã hủy';
      default:
        return 'Tất cả trạng thái';
    }
  };

  return (
    <div className="p-2 -mr-8 sm:p-4 md:p-6">
      <Header title="Quản lý lịch khám bệnh" subtitle="Bác sĩ người tận tâm vì nghề nghiệp" />

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mr-4">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div>
            <button
              id="dropdownActionButton"
              data-dropdown-toggle="dropdownAction"
              className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              type="button"
              onClick={toggleDropdown}
            >
              <span className="sr-only">Action button</span>
              {getStatusFilterLabel()}
              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {/* Dropdown menu */}
            {showDropdown && (
              <div
                id="dropdownAction"
                className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 mt-1"
              >
                <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
                  <li>
                    <a
                      href="/#"
                      className="block px-4 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterChange('all');
                      }}
                    >
                      Tất cả trạng thái
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#"
                      className="block px-4 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterChange('Booked');
                      }}
                    >
                      Đã đặt
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#"
                      className="block px-4 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterChange('Completed');
                      }}
                    >
                      Đã khám
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#"
                      className="block px-4 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterChange('canceled');
                      }}
                    >
                      Đã hủy
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="w-full sm:w-auto relative">
              <input
                type="text"
                className="w-full sm:w-80 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto relative shadow-md">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  STT
                </th>
                <th scope="col" className="px-6 py-3">
                  Tên bệnh nhân
                </th>

                <th scope="col" className="px-6 py-3">
                  Giới tính
                </th>
                <th scope="col" className="px-6 py-3">
                  Ngày khám
                </th>
                <th scope="col" className="px-6 py-3">
                  Giờ khám
                </th>
                <th scope="col" className="px-6 py-3">
                  Giá
                </th>
                <th scope="col" className="px-6 py-3">
                  Bác sĩ phụ trách
                </th>
                <th scope="col" className="px-6 py-3">
                  Thanh tóan
                </th>
                <th scope="col" className="px-6 py-3">
                  trạng thái
                </th>
                <th scope="col" className="px-6 py-3">
                  Ngày đặt
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Action
                </th> */}
              </tr>
            </thead>
            {isLoading ? (
              <LoadingSkeleton columns={10} />
            ) : (
              <tbody>
                {appointmentData.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-4 text-center">
                      Hiện tại không có dữ liệu nào
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 && searchTerm !== '' ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-4 text-center">
                      Không tìm thấy kết quả cho "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <th
                        scope="row"
                        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div className="ps-3">
                          <div className="text-base font-semibold mt-4">{item?.record?.fullName}</div>
                          <div className="font-normal text-gray-500">{item?.record?.phoneNumber}</div>
                        </div>
                      </th>
                      <td className="px-6 py-4">{item?.record?.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                      <td className="px-6 py-4">{formatDate(item?.date)}</td>
                      <td className="px-6 py-4">
                        {extractTime(item?.hours[0].start)} - {extractTime(item?.hours[0].end)}
                      </td>
                      <td className="px-6 py-4">{Number(item?.price).toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4">{item?.doctor?.fullName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item?.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <select
                            value={item?.status}
                            onChange={(e) => updateStatusAppointment(item?._id, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              fontSize: '16px',
                              borderRadius: '5px',
                              border: '1px solid #ccc',
                              backgroundColor: '#fff',
                              cursor: 'pointer',
                            }}
                            disabled={item?.status === 'Completed' || item?.status === 'Cancelled'}
                          >
                            <option value="Booked">Đã đặt</option>
                            <option value="Completed">Đã khám</option>
                            <option value="canceled">Đã hủy</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">{item.createdAt}</div>
                      </td>
                      {/* <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setShowModalEdit(true);
                              // setSelectedAppointmentId(item?._id);
                            }}
                          >
                            <CiEdit size={20} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              setShowModalDelete(true);
                              setSelectedAppointmentId(item?._id);
                            }}
                          >
                            <AiOutlineDelete size={20} />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa lịch hẹn">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa lịch hẹn này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteAppointment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <BiLoaderAlt className="animate-spin mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Đồng ý'
                )}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showModalEdit} onClose={() => setShowModalEdit(false)} title="Sửa lịch hẹn">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa lịch hẹn này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteAppointment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <BiLoaderAlt className="animate-spin mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Đồng ý'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Appointment;
