import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm } from 'react-hook-form';

import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiLoaderAlt } from 'react-icons/bi';

import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import { removeAccents } from '~/utils/string';
import EditHospital from './modal/editHospital';
import CreateHospital from './modal/createHospital';

import { fetchAllHospital, fetchDeleteHospital } from '~/redux/hospital/hospitalSlice';

const Hospital = () => {
  const dispatch = useDispatch();
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editHospital, setEditHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospitalType, setSelectedHospitalType] = useState('all');
  const [selectedRenewalStatus, setSelectedRenewalStatus] = useState('all');
  const [showHospitalTypeDropdown, setShowHospitalTypeDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showRenewalStatusDropdown, setShowRenewalStatusDropdown] = useState(false);

  const hospitalData = useSelector((state) => state.hospital.hospitalData);
  const isLoading = useSelector((state) => state.hospital.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { reset } = useForm();

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers =
    hospitalData?.data?.filter((user) => {
      // Hospital type filter
      if (selectedHospitalType !== 'all' && user.hospitalType !== selectedHospitalType) return false;

      // Renewal status filter
      if (selectedRenewalStatus !== 'all') {
        const renewalStatus = user.renewalStatus?.toString();
        if (renewalStatus !== selectedRenewalStatus) return false;
      }

      // Search term filter
      if (!searchTerm) return true;

      const searchValue = removeAccents(searchTerm.toLowerCase().trim());
      const fullName = removeAccents(user.fullName?.toLowerCase() || '');
      const phoneNumber = removeAccents(user.phoneNumber?.toLowerCase() || '');

      return fullName.includes(searchValue) || phoneNumber.includes(searchValue);
    }) || [];

  // Hospital type options
  const hospitalTypeOptions = [
    { value: 'all', label: 'Tất cả loại bệnh viện' },
    { value: 'benh-vien-cong', label: 'Bệnh viện công' },
    { value: 'benh-vien-tu', label: 'Bệnh viện tư' },
    { value: 'phong-kham', label: 'Phòng khám' },
    { value: 'phong-mach', label: 'Phòng mạch' },
    { value: 'xet-nghiem', label: 'Xét nghiệm' },
  ];

  const renewalStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái gia hạn' },
    { value: 'true', label: 'Đã gia hạn' },
    { value: 'false', label: 'Chưa gia hạn' },
  ];

  const confirmDeleteHospital = (hospitalId) => {
    setSelectedUserId(hospitalId);
    setShowModalDelete(true);
  };

  const handleDeleteHospital = async () => {
    if (isSubmitting) return;
    try {
      if (!selectedUserId) {
        toast.error('Không tìm thấy ID bệnh viện để xóa');
        return;
      }
      setIsSubmitting(true);
      const res = await dispatch(fetchDeleteHospital(selectedUserId));
      const result = unwrapResult(res);

      if (result?.status) {
        toast.success(result?.message || 'Xóa bệnh viện thành công');
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
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchHospitalData = async () => {
    try {
      await dispatch(fetchAllHospital()).unwrap();
    } catch (error) {
      toast.error('Không thể tải dữ liệu bệnh viện. Vui lòng thử lại sau.');
    }
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
          onClick={() => {
            reset();
            setShowModalCreate(true);
          }}
        >
          Thêm bệnh viện
        </button>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowHospitalTypeDropdown(!showHospitalTypeDropdown)}
                className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                {hospitalTypeOptions.find((option) => option.value === selectedHospitalType)?.label ||
                  'Lọc theo loại bệnh viện'}
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

              {showHospitalTypeDropdown && (
                <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                  <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                    {hospitalTypeOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          onClick={() => {
                            setSelectedHospitalType(option.value);
                            setShowHospitalTypeDropdown(false);
                            setSelectedUsers([]);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowRenewalStatusDropdown(!showRenewalStatusDropdown)}
                className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                {renewalStatusOptions.find((option) => option.value === selectedRenewalStatus)?.label ||
                  'Lọc theo trạng thái gia hạn'}
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

              {showRenewalStatusDropdown && (
                <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                  <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                    {renewalStatusOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          onClick={() => {
                            setSelectedRenewalStatus(option.value);
                            setShowRenewalStatusDropdown(false);
                            setSelectedUsers([]);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
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
        <div
          className="overflow-x-auto relative shadow-md max-h-[400px]"
          style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0', scrollbarWidth: 'none' }}
        >
          <table className="w-full overflow-y-auto text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs sticky top-0  text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  STT
                </th>
                <th scope="col" className="px-6 py-3">
                  Họ và tên
                </th>
                <th scope="col" className="px-6 py-3">
                  Số điện thoại
                </th>
                <th scope="col" className="px-6 py-3">
                  Loại bệnh viện
                </th>
                <th scope="col" className="px-6 py-3">
                  Phí dịch vụ
                </th>
                <th scope="col" className="px-6 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3">
                  Địa chỉ
                </th>
                <th scope="col" className="px-6 py-3">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3">
                  Hành động
                </th>
              </tr>
            </thead>
            {isLoading === true ? (
              <LoadingSkeleton columns={8} />
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
                      <td className="w-4 p-4">{index + 1}</td>
                      <th scope="row" className="flex items-center px-6 py-4 text-gray-900  dark:text-white">
                        <div
                          className="w-10 h-10 rounded-full bg-contain bg-no-repeat"
                          style={{
                            backgroundImage: image
                              ? `url(${image})`
                              : `url(${require('../../assets/images/empty.png')})`,
                          }}
                        ></div>
                        <div className="px-3">
                          <div className="text-base font-semibold">{item.fullName}</div>
                          <div className="font-normal text-gray-500">{item?.accountId?.email}</div>
                        </div>
                      </th>
                      <td className="px-6 py-4">{item?.accountId?.phoneNumber}</td>
                      <td className="px-6 py-4">
                        {item?.hospitalType === 'benh-vien-cong'
                          ? 'Bệnh viện công'
                          : item?.hospitalType === 'benh-vien-tu'
                          ? 'Bệnh viện tư'
                          : item?.hospitalType === 'phong-kham'
                          ? 'Phòng khám'
                          : item?.hospitalType === 'phong-mach'
                          ? 'Phòng mạch'
                          : 'Xét nghiệm'}
                      </td>
                      <td className="px-6 py-4">{Number(item?.monthlyFee).toLocaleString('vi-VN')}</td>

                      <td className="px-6 py-4">{item?.renewalStatus === true ? 'Đã gia hạn' : 'Chưa gia hạn '} </td>

                      <td className="ps-3">
                        {item?.address?.map((addr, i) => (
                          <div key={i}>
                            {`${addr.street}, ${addr.wardName}, ${addr.districtName}, ${addr.provinceName}`}
                          </div>
                        ))}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-normal text-gray-500">{item.createdAt}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setShowModalEdit(true);
                              setEditHospital(item);
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

        {/* modal delete */}
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa bệnh viện">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa bệnh viện này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteHospital} disabled={isSubmitting}>
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
        <div>
          {showModalCreate && (
            <CreateHospital setShowModalCreate={setShowModalCreate} fetchHospitalData={fetchHospitalData} />
          )}
          {showModalEdit && (
            <EditHospital
              setShowModalEdit={setShowModalEdit}
              fetchHospitalData={fetchHospitalData}
              editHospital={editHospital}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Hospital;
