import { useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';

import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import Modal from '~/components/Modal';
import Button from '~/components/Button';

import { fetchAllHospital, fetchDeleteHospital } from '~/redux/hospital/hospitalSlice';
// Removed the unused import
import CreateHospital from './modal/createHospital';
import EditHospital from './modal/editHospital';

const Hospital = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const colors = tokens(theme.palette.mode);

  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [deleteHospital, setDeleteHospital] = useState();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editHospital, setEditHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const hospitalData = useSelector((state) => state.hospital.hospitalData);

  const isLoading = useSelector((state) => state.hospital.loading);

  // Hàm chuyển đổi chuỗi thành không dấu
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers =
    hospitalData?.data?.filter((user) => {
      if (!searchTerm) return true;

      const searchValue = removeAccents(searchTerm.toLowerCase().trim());

      // Xử lý trường hợp giá trị null/undefined
      const fullName = removeAccents(user.fullName?.toLowerCase() || '');
      const phoneNumber = removeAccents(user.phoneNumber?.toLowerCase() || '');

      return fullName.includes(searchValue) || phoneNumber.includes(searchValue);
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
  
  const fetchHospitalData = async () => {
    try {
      await dispatch(fetchAllHospital()).unwrap();
    } catch (error) {
      console.error('Error fetching hospital:', error);
      toast.error('Không thể tải dữ liệu bệnh viện. Vui lòng thử lại sau.');
    }
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

  // Fix: Set the selectedUserId when confirming delete
  const confirmDeleteHospital = (hospitalId) => {
    setSelectedUserId(hospitalId); // Set the ID to be deleted
    setShowModalDelete(true);
  };
  
  const handleDeleteHospital = async () => {
    try {
      // Make sure we have a selectedUserId
      if (!selectedUserId) {
        toast.error('Không tìm thấy ID bệnh viện để xóa');
        return;
      }
      
      const res = await dispatch(fetchDeleteHospital(selectedUserId));
      const result = unwrapResult(res);
      
      if (result?.status) {
        toast.success(result?.message || 'Xóa bệnh viện thành công');
        setSelectedUsers(prev => prev.filter(id => id !== selectedUserId));
        fetchHospitalData();
      } else {
        toast.warning(result?.message || 'Không thể xóa bệnh viện');
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast.error('Đã xảy ra lỗi khi xóa bệnh viện');
    } finally {
      setShowModalDelete(false);
      setSelectedUserId(null);
    }
  };
  
  const handleEditHospital = (hospitalId) => {
    const hospitalEdit = hospitalData?.data?.find((hospital) => hospital._id === hospitalId);
    if (hospitalEdit) {
      setEditHospital(hospitalEdit);
      setShowModalEdit(true);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset selected users when search term changes
    setSelectedUsers([]);
  };
  
  useEffect(() => {
    dispatch(fetchAllHospital());
  }, []);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Header title="Quản lý Bệnh viện" subtitle="Tận tâm vì sức khỏe cộng đồng" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          type="button"
          className=" text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
          onClick={() => setShowModalCreate(true)}
        >
          Thêm bệnh viện
        </button>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div>
            <button
              id="dropdownActionButton"
              data-dropdown-toggle="dropdownAction"
              className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              type="button"
            >
              <span className="sr-only">Action button</span>
              Action
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
            <div
              id="dropdownAction"
              className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
                <li>
                  <a
                    href="/#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Reward
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Promote
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Activate account
                  </a>
                </li>
              </ul>
              <div className="py-1">
                <a
                  href="/#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                  Delete User
                </a>
              </div>
            </div>
          </div>
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="w-full sm:w-auto relative">
              <input
                type="text"
                className="w-full sm:w-80 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Tìm kiếm bệnh viện..."
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
        <div
          className="overflow-x-auto relative shadow-md"
          style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0' }}
        >
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
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone number
                </th>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  CreatedAt
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            {isLoading === true ? (
              <LoadingSkeleton columns={7} />
            ) : hospitalData && hospitalData?.data.length > 0 ? (
              <tbody>
                {filteredUsers.map((item, index) => {
                  let image = '';
                  if (item.image) {
                    image = Buffer.from(item?.image, 'base64').toString('binary');
                  }
                  return (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="w-4 p-4">
                        <div className="flex items-center">
                          <input
                            id="checkbox-table-search-1"
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedUsers.includes(item._id)}
                            onChange={() => handleSelectUser(item._id)}
                          />
                          <label htmlFor="checkbox-table-search-1" className="sr-only">
                            checkbox
                          </label>
                        </div>
                      </td>
                      <th
                        scope="row"
                        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div
                          className="w-10 h-10 rounded-full bg-contain bg-no-repeat"
                          style={{
                            backgroundImage: image
                              ? `url(${image})`
                              : `url(${require('../../assets/images/empty.png')})`,
                          }}
                        ></div>
                        <div className="ps-3">
                          <div className="text-base font-semibold">{item.fullName}</div>
                          <div className="font-normal text-gray-500">{item?.email}</div>
                        </div>
                      </th>
                      <td className="px-6 py-4">{item?.phoneNumber}</td>
                      <td className="ps-3">
                        {item?.address?.map((addr, i) => (
                          <div key={i}>
                            {`${addr.street}, ${addr.wardName}, ${addr.districtName}, ${addr.provinceName}`}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4">{item?.rating}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href="/#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                          {item.createdAt}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              handleEditHospital(item?._id);
                            }}
                          >
                            <CiEdit size={20} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              confirmDeleteHospital(item?._id);
                            }}
                          >
                            <AiOutlineDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <div>
                <span className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  Hiện tại không có dữ liệu nào
                </span>
              </div>
            )}
          </table>
        </div>
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa bệnh viện">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa bệnh viện này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteHospital}>
                Đồng ý
              </Button>
            </div>
          </div>
        </Modal>
        <div>
          {showModalCreate && (
            <CreateHospital
              setShowModalCreate={setShowModalCreate}
              handleGetAllDocter={() => dispatch(fetchAllHospital())}
            />
          )}
          {showModalEdit && (
            <EditHospital
              setShowModalEdit={setShowModalEdit}
              handleGetAllHospital={() => dispatch(fetchAllHospital())}
              hospital={editHospital}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Hospital;