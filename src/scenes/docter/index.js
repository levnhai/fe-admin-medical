import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm } from 'react-hook-form';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { BiLoaderAlt } from 'react-icons/bi';

import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';

import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import EditDoctor from './modal/editdoctor';
import { removeAccents } from '~/utils/string';
import CreateDoctor from './modal/createDoctor';

import { fetchDoctorByHospital, fetchDeleteDoctor } from '~/redux/doctor/doctorSlice';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchAllSpecialty } from '~/redux/specialty/specialtySlice';

const Doctor = () => {
  const dispatch = useDispatch();
  const { reset } = useForm();

  const [doctorData, setDoctorData] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);

  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);

  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyOptions, setSpecialtyOptions] = useState([]);

  const [localLoading, setLocalLoading] = useState(true);

  const reduxLoading = useSelector((state) => state.appointment.loading);
  const userLogin = useSelector((state) => state.auth.user?.payload);
  const userId = userLogin?.userData?._id;
  const isLoading = localLoading || reduxLoading;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers =
    (doctorData?.length > 0 &&
      doctorData?.filter((user) => {
        if (!searchTerm) return true;

        const searchValue = removeAccents(searchTerm.toLowerCase().trim());

        // Xử lý trường hợp giá trị null/undefined
        const fullName = removeAccents(user.fullName?.toLowerCase() || '');
        const phoneNumber = removeAccents(user.phoneNumber?.toLowerCase() || '');

        return fullName.includes(searchValue) || phoneNumber.includes(searchValue);
      })) ||
    [];
  // Check if all filtered users are selected

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteDoctor = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await dispatch(fetchDeleteDoctor(selectedDoctorId));
    const result = unwrapResult(res);
    setShowModalDelete(false);
    if (result?.status) {
      toast.success(result.message);
      setDoctorData((prev) =>
        prev.filter((doctor) => {
          return doctor._id !== selectedDoctorId;
        }),
      );
      // fetchDoctorData();
    } else {
      toast.warning(result.message);
    }
    setIsSubmitting(false);
  };

  const fetchDoctorData = async () => {
    setLocalLoading(true);
    try {
      const res = await dispatch(fetchDoctorByHospital(userId));
      const result = unwrapResult(res);
      console.log('check result', result?.data);
      setDoctorData(result?.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Không thể tải dữ liệu bác sĩ');
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  useEffect(() => {
    if (showModalCreate || showModalEdit) {
      const fetchSpecialty = async () => {
        const res = await dispatch(fetchAllSpecialty());
        const result = unwrapResult(res);
        const specialtyData = result.data.map((specialty) => ({
          value: specialty._id,
          label: specialty.fullName,
        }));
        setSpecialtyOptions(specialtyData);
      };
      fetchSpecialty();
    }
  }, [showModalCreate, showModalEdit]);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Header title="Quản lý bác sĩ" subtitle="Bác sĩ người tận tâm vì nghề nghiệp" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          type="button"
          className=" text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
          onClick={() => {
            reset();
            // setUrlImage();
            setShowModalCreate(true);
          }}
        >
          Thêm bác sĩ
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
          </div>
          <div>
            <label htmlFor="table-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="w-full sm:w-auto relative">
                <input
                  type="text"
                  className="w-full sm:w-80 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Tìm kiếm bác sĩ..."
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
        </div>
        <div className="overflow-y-auto relative shadow-md">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  STT
                </th>
                {/* <th scope="col" className="p-4">
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
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Họ và tên
                </th>
                <th scope="col" className="px-6 py-3">
                  Số điện thoại
                </th>
                <th scope="col" className="px-6 py-3">
                  Giới tính
                </th>
                <th scope="col" className="px-6 py-3">
                  Chức vụ
                </th>
                <th scope="col" className="px-6 py-3">
                  Chuyên khoa
                </th>
                <th scope="col" className="px-6 py-3">
                  Đánh giá
                </th>
                <th scope="col" className="px-6 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3">
                  Hoạt động
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <LoadingSkeleton columns={9} />
            ) : (
              <tbody>
                {doctorData?.length === 0 ? (
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
                  filteredUsers.map((item, index) => {
                    let image = '';
                    if (item.image) {
                      image = Buffer.from(item?.image, 'base64').toString('binary');
                    }
                    return (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4">{index + 1}</td>
                        {/* <td className="w-4 p-4">
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
                        </td> */}
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
                        <td className="px-6 py-4">{item?.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                        <td className="px-6 py-4">
                          {item.positionId === 'doctor'
                            ? 'Bác sĩ'
                            : item.positionId === 'mater'
                            ? 'Thạc sĩ'
                            : item.positionId === 'associate professor'
                            ? 'Phó giáo sư'
                            : 'Giáo sư'}
                        </td>
                        <td className="px-6 py-4">{item?.specialty?.fullName}</td>
                        <td className="px-6 py-4">{item?.rating}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-normal text-gray-500">{item.createdAt}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                reset();
                                setEditDoctor(item);
                                setShowModalEdit(true);
                              }}
                            >
                              <CiEdit size={20} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setShowModalDelete(true);
                                setSelectedDoctorId(item?._id);
                              }}
                            >
                              <AiOutlineDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
        {/*  modal delete */}
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa bác sĩ">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa bác sĩ này nó không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteDoctor} disabled={isSubmitting}>
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
            <CreateDoctor
              setShowModalCreate={setShowModalCreate}
              fetchDoctorData={fetchDoctorData}
              specialtyOptions={specialtyOptions}
            />
          )}
          {showModalEdit && (
            <EditDoctor
              setShowModalEdit={setShowModalEdit}
              editDoctor={editDoctor}
              specialtyOptions={specialtyOptions}
              fetchDoctorData={fetchDoctorData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctor;
