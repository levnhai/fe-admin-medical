import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { unwrapResult } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import Select from 'react-select';

//icon
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';

import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import { fetchAllAppointmentByhospital, fetchUpdateStatus } from '~/redux/appointment/appointmentSlice';
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
  const filteredUsers =
    appointmentData?.filter((user) => {
      if (!searchTerm) return true;

      const searchValue = removeAccents(searchTerm.toLowerCase().trim());

      // Xử lý trường hợp giá trị null/undefined
      const patientName = removeAccents(user?.record?.fullName?.toLowerCase() || '');
      const doctorName = removeAccents(user?.doctor?.fullName?.toLowerCase() || '');
      const phoneNumber = removeAccents(user?.record?.phoneNumber?.toLowerCase() || '');

      return patientName.includes(searchValue) || phoneNumber.includes(searchValue) || doctorName.includes(searchValue);
    }) || [];

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
    // const res = await dispatch(fetchDeleteUser(selectedAppointmentId));
    // const userDelete = unwrapResult(res);
    // setShowModalDelete(false);
    // if (userDelete?.status) {
    //   toast.success(userDelete?.message);
    //   fetchPatientData();
    // } else {
    //   toast.warning(userDelete?.message);
    // }
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
        console.error("Error fetching appointments:", error);
        toast.error("Không thể tải dữ liệu lịch hẹn");
      } finally {
        setLocalLoading(false);
      }
    };
    fetchAppointment();
  }, []);

  const isLoading = localLoading || reduxLoading;

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Header title="Quản lý lịch khám bệnh" subtitle="Bác sĩ người tận tâm vì nghề nghiệp" />

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div></div>
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
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input
                      id="checkbox-all-search"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="checkbox-all-search" className="sr-only">
                      checkbox
                    </label>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">
                  Tên bệnh nhân
                </th>
                <th scope="col" className="px-6 py-3">
                  Số điện thoại
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
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <LoadingSkeleton columns={11} />
            ) : (
              <tbody>
                {appointmentData.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-4 text-center">
                      Hiện tại không có dữ liệu nào
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 && searchTerm !== "" ? (
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
                      <td className="w-4 p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-table-search-${index}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedUsers.includes(item._id)}
                            onChange={() => handleSelectUser(item._id)}
                          />
                          <label htmlFor={`checkbox-table-search-${index}`} className="sr-only">
                            checkbox
                          </label>
                        </div>
                      </td>
                      <th
                        scope="row"
                        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div className="ps-3">
                          <div className="text-base font-semibold">{item?.record?.fullName}</div>
                          <div className="font-normal text-gray-500">{item?.email}</div>
                        </div>
                      </th>
                      <td className="px-6 py-4">{item?.record?.phoneNumber}</td>
                      <td className="px-6 py-4">{item?.record?.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                      <td className="px-6 py-4">{formatDate(item?.date)}</td>
                      <td className="px-6 py-4">
                        {extractTime(item?.hours[0].start)} - {extractTime(item?.hours[0].end)}
                      </td>
                      <td className="px-6 py-4">{Number(item?.price).toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4">{item?.doctor?.fullName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item?.status === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}
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
                            <option value="Cancelled">Đã hủy</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">{item.createdAt}</div>
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
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
              <Button className="bg-red-400 text-white" onClick={handleDeleteAppointment}>
                Đồng ý
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
              <Button className="bg-red-400 text-white" onClick={handleDeleteAppointment}>
                Đồng ý
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Appointment;
