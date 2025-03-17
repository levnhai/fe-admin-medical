import { useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm, Controller } from 'react-hook-form';
import classNames from 'classnames/bind';
import Lightbox from 'react-image-lightbox';
import Select from 'react-select';
import { toast } from 'react-toastify';

import styles from './doctor.module.scss';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import { fetchDoctorByHospital, fetchDeleteDoctor } from '~/redux/doctor/doctorSlice';
import EditDocter from './modal/editDocter';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import { ConvertBase64 } from '~/utils/common';

import { fetchCreateDoctor } from '~/redux/doctor/doctorSlice';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchAllSpecialty } from '~/redux/specialty/specialtySlice';
const cx = classNames.bind(styles);

const Doctor = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const { t } = useTranslation();
  const colors = tokens(theme.palette.mode);

  const [doctorData, setDoctorData] = useState(false);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [previewImageURL, setpreViewImageURL] = useState();
  const [isOpenImage, setIsOpenImage] = useState();
  const [urlImage, setUrlImage] = useState(null);

  const [editDoctor, setEditDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [specialtyOptions, setSpecialtyOptions] = useState([]);

  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

  // const doctorData = useSelector((state) => state.doctor.doctorByHospitalData);
  const isLoading = useSelector((state) => state.doctor.loading);
  const userLogin = useSelector((state) => state.auth.user?.payload);
  const userId = userLogin?.userData?._id;

  console.log('check doctorData', editDoctor);

  const handleOnChangeImage = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    let file = e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setpreViewImageURL(objectURL);
    }

    const urlBase64 = await ConvertBase64(file);
    setUrlImage(urlBase64);
  };

  const handleOpenImage = () => {
    if (!previewImageURL) return;
    setIsOpenImage(true);
  };

  // Hàm chuyển đổi chuỗi thành không dấu
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

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

  const handleEditDoctor = (doctor) => {
    // const doctorEdit = doctorData?.find((doctor) => doctor._id === doctorId);
    // if (doctorEdit) {
    //   setEditDoctor(doctorEdit);
    //   setShowModalEdit(true);
    // }
    setEditDoctor(doctor);
    console.log('check doctor', doctor);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset selected users when search term changes
    setSelectedUsers([]);
  };

  const handleDeleteDoctor = async () => {
    const res = await dispatch(fetchDeleteDoctor(selectedDoctorId));
    const result = unwrapResult(res);
    setShowModalDelete(false);
    if (result?.status) {
      toast.success(result.message);
      setDoctorData((prev) =>
        prev.filter((doctor) => {
          console.log('hai lê', doctor);
          return doctor._id !== selectedDoctorId;
        }),
      );
      // fetchDoctorData();
    } else {
      toast.warning(result.message);
    }
  };

  // Khi chọn tỉnh/thành phố
  const handleProvinceChange = (selectedOption) => {
    console.log('check selectedOption', selectedOption);
    setSelectedProvince(selectedOption);
    setSelectedDistrict(null); // Reset quận/huyện khi đổi tỉnh
  };

  // Khi chọn quận/ huyện
  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
  };

  const fetchDoctorData = async () => {
    const res = await dispatch(fetchDoctorByHospital(userId));
    const result = unwrapResult(res);
    setDoctorData(result?.data);
  };

  const submitForm = async (data) => {
    console.log('check data', data);
    console.log('check imge', urlImage);
    const {
      email,
      fullName,
      district,
      gender,
      password,
      phoneNumber,
      positionId,
      province,
      reEnterPassword,
      specialtyId,
      street,
      ward,
    } = data;
    const formData = {
      email,
      fullName,
      gender: gender?.value,
      password,
      phoneNumber,
      reEnterPassword,
      street,
      districtId: district?.value,
      districtName: district?.label,
      positionId: positionId?.value,
      provinceId: province?.value,
      provinceName: province?.label,
      wardId: ward?.value,
      wardName: ward?.label,
      image: urlImage,
      hospitalId: userId,
      specialtyId: specialtyId?.value,
    };
    try {
      const response = await dispatch(fetchCreateDoctor(formData));
      const result = await unwrapResult(response);
      if (result?.status) {
        toast.success(result?.message);
        setShowModalCreate(false);
        fetchDoctorData();
      } else {
        toast.warning(result?.message);
        setShowModalCreate(true);
      }
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await dispatch(fetchAllProvinces());
      const result = unwrapResult(res);
      const provincesData = result.data.map((provinces) => ({
        value: provinces.id,
        label: provinces.name,
      }));
      setProvinceOptions(provincesData);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        const res = await dispatch(fetchDistrictsByProvince(selectedProvince.value));
        const result = unwrapResult(res);
        const districtData = result.data.map((district) => ({
          value: district.id,
          label: district.name,
        }));
        setDistrictOptions(districtData);
      };
      fetchDistricts();
    }
  }, [selectedProvince, dispatch]);

  useEffect(() => {
    if (selectedDistrict) {
      console.log('check quận huyện', selectedDistrict);
      const fetchWards = async () => {
        const res = await dispatch(fetchWardsByDistricts(selectedDistrict.value));
        const result = unwrapResult(res);
        const wardData = result.data.map((ward) => ({
          value: ward.id,
          label: ward.name,
        }));
        setWardOptions(wardData);
      };
      fetchWards();
    }
  }, [selectedDistrict, dispatch]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Header title="Quản lý bác sĩ" subtitle="Bác sĩ người tận tâm vì nghề nghiệp" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          type="button"
          className=" text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
          onClick={() => {
            reset();
            setShowModalCreate(true);
          }}
        >
          Thêm bác sĩ
        </button>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div>
            {/* <button
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
            </div> */}
          </div>
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
        <div className="overflow-x-auto relative shadow-md">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
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
                  STT
                </th>
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
            {isLoading === true ? (
              <LoadingSkeleton columns={9} />
            ) : doctorData && doctorData?.length > 0 ? (
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
                      <td className="px-6 py-4">{index + 1}</td>
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
                      <td className="px-6 py-4">{item?.positionId}</td>
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
                      <td className="px-4 py-3">
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
        {/*  modal delete */}
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa bác sĩ">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa bác sĩ này nó không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteDoctor}>
                Đồng ý
              </Button>
            </div>
          </div>
        </Modal>

        {/*  modal create */}
        <Modal isOpen={showModalCreate} onClose={() => setShowModalCreate(false)} title="Thêm bác sĩ">
          <div>
            <div className="max-h-80 overflow-auto">
              <form onSubmit={handleSubmit(submitForm)}>
                <div className="my-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Họ và tên (Có dấu)</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          className={cx('customInput', 'text-black')}
                          placeholder="Họ và tên ..."
                          {...register('fullName', { required: 'Vui lòng nhập họ và tên!' })}
                        />

                        {errors.fullName && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.fullName.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Địa chỉ email</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="email"
                          id="email"
                          className={cx('customInput', 'text-black')}
                          placeholder="Email ..."
                          {...register('email', { required: 'Vui lòng nhập email' })}
                        />

                        {errors.email && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.email.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Số điện thoại</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          className={cx('customInput', 'text-black')}
                          placeholder="Số điện thoại ..."
                          {...register('phoneNumber', { required: 'Vui lòng nhập số điện thoại' })}
                        />

                        {errors.phoneNumber && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.phoneNumber.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Giới tính</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="gender"
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
                                  color: 'red',
                                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              options={[
                                { value: 'male', label: 'Nam' },
                                { value: 'female', label: 'Nữ' },
                                { value: 'other', label: 'Khác' },
                              ]}
                              placeholder="Giới tính ..."
                            />
                          )}
                        />

                        {errors.gender && errors.gender.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn giới tính'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8 mt-4">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Mật khẩu</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="relative mt-2">
                        <input
                          type={showHidePassword ? 'password' : 'text'}
                          name="password"
                          id="password"
                          className={cx('customInput', 'text-black')}
                          placeholder="Nhập mật khẩu..."
                          {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                        />

                        <span
                          onMouseDown={() => setShowHidePassword(!showHidePassword)}
                          onMouseUp={() => setShowHidePassword(true)}
                          onMouseLeave={() => setShowHidePassword(true)}
                          className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 text-black"
                        >
                          {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>

                        {errors.password && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.password.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Nhập lại mật khẩu</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="relative mt-2">
                        <input
                          type={confirmPassword ? 'password' : 'text'}
                          name="reEnterPassword"
                          id="reEnterPassword"
                          className={cx('customInput', 'text-black')}
                          placeholder="xác thực mật khẩu ..."
                          {...register('reEnterPassword', { required: 'Vui lòng nhập lại mật khẩu' })}
                        />
                        <span
                          onMouseDown={() => setConfirmPassword(!confirmPassword)}
                          onMouseUp={() => setConfirmPassword(true)}
                          onMouseLeave={() => setConfirmPassword(true)}
                          className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 text-black"
                        >
                          {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>

                        {errors.reEnterPassword && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.reEnterPassword.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Trình độ</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="positionId"
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
                                  color: 'red',

                                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              options={[
                                { value: 'doctor', label: 'Bác sĩ' },
                                { value: 'mater', label: 'Thạc sĩ' },
                                { value: 'associate professor', label: 'PHó giáo sư' },
                                { value: 'professor', label: 'Giáo sư' },
                              ]}
                              placeholder="Trình độ ..."
                            />
                          )}
                        />

                        {errors.positionId && errors.positionId.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn trình độ'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Chuyên khoa</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="specialtyId"
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
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              options={[{ value: '', label: 'Chuyên khoa', isDisabled: true }, ...specialtyOptions]}
                              placeholder="Chuyên khoa ..."
                            />
                          )}
                        />

                        {errors.specialtyId && errors.specialtyId.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn chuyên khoa'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Tỉnh / Thành</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <Controller
                          name="province"
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
                                  color: 'black',
                                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              placeholder="Chọn tỉnh / thành...."
                              onChange={(selectedOption) => {
                                field.onChange(selectedOption);
                                handleProvinceChange(selectedOption);
                              }}
                              options={[{ value: '', label: 'Tỉnh / thành', isDisabled: true }, ...provinceOptions]}
                            />
                          )}
                        />

                        {errors.province && errors.province.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn tỉnh / thành'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Quận / Huyện</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="district"
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
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              onChange={(selectedOption) => {
                                field.onChange(selectedOption);
                                handleDistrictChange(selectedOption);
                              }}
                              placeholder="Chọn quận / huyện ...."
                              options={[{ value: '', label: 'Quận / huyện', isDisabled: true }, ...districtOptions]}
                            />
                          )}
                        />

                        {errors.district && errors.district.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn quận / huyện'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Phường/ Xã</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="ward"
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
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              // onChange={handleDistrictChange}
                              placeholder="Chọn phường / xã ...."
                              options={[{ value: '', label: 'Phường / xã', isDisabled: true }, ...wardOptions]}
                            />
                          )}
                        />

                        {errors.ward && errors.ward.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn phường / xã'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Địa chỉ (đường, số nhà)</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="street"
                          id="street"
                          className={cx('customInput', 'text-black')}
                          placeholder="Địa chỉ ..."
                          {...register('street', { required: 'Vui lòng nhập địa chỉ!' })}
                        />

                        {errors.address && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.address.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 mb-10 px-8">
                  <div>
                    <label className={cx('label-uploadImage')} htmlFor="upload-image">
                      Upload image
                    </label>
                    <input
                      className={cx('customInput', 'text-black')}
                      id="upload-image"
                      accept="image/*"
                      onChange={handleOnChangeImage}
                      type="file"
                      name="image"
                      hidden
                    ></input>
                    {previewImageURL ? (
                      <div
                        className={cx('upload-image')}
                        onClick={handleOpenImage}
                        style={{ backgroundImage: `url(${previewImageURL})` }}
                      ></div>
                    ) : (
                      ''
                    )}
                    {isOpenImage && (
                      <Lightbox
                        className="mb-10"
                        mainSrc={previewImageURL}
                        onCloseRequest={() => setIsOpenImage(false)}
                      />
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end border-t py-2 pr-6 gap-4 pt-2">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
                onClick={() => handleSubmit(submitForm)()}
              >
                Thêm mới
              </Button>
            </div>
          </div>
        </Modal>

        {/*  modal edit */}
        <Modal isOpen={showModalEdit} onClose={() => setShowModalEdit(false)} title="Sửa thông tin bác sĩ">
          <div>
            <div className="max-h-80 overflow-auto">
              <form onSubmit={handleSubmit(submitForm)}>
                <div className="my-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Họ và tên (Có dấu)</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={editDoctor?.fullName}
                          className={cx('customInput', 'text-black')}
                          placeholder="Họ và tên ..."
                          {...register('fullName', { required: 'Vui lòng nhập họ và tên!' })}
                        />

                        {errors.fullName && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.fullName.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Địa chỉ email</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="email"
                          id="email"
                          className={cx('customInput', 'text-black')}
                          placeholder="Email ..."
                          {...register('email', { required: 'Vui lòng nhập email' })}
                        />

                        {errors.email && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.email.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Số điện thoại</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          value={editDoctor?.phoneNumber}
                          className={cx('customInput', 'text-black')}
                          placeholder="Số điện thoại ..."
                          {...register('phoneNumber', { required: 'Vui lòng nhập số điện thoại' })}
                        />

                        {errors.phoneNumber && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.phoneNumber.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Giới tính</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      {/* <div className="mt-2">
                        <Controller
                          name="gender"
                          as={Select}
                          control={control}
                          rules={{ required: 'required' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              // value={editDoctor?.gender}
                              // onChange={(selectedOption) => field.onChange(selectedOption)}
                              options={[
                                { value: 'male', label: 'Nam' },
                                { value: 'female', label: 'Nữ' },
                                { value: 'other', label: 'Khác' },
                              ]}
                              value={editDoctor?.gender} // Cập nhật giá trị từ editDoctor
                              onChange={(selectedOption) => field.onChange(selectedOption)}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? '#999' : '#999',
                                  height: '48px',
                                  color: 'red',
                                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              placeholder="Giới tính ..."
                            />
                          )}
                        />

                        {errors.gender && errors.gender.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn giới tính'}</span>
                          </div>
                        ) : null}
                         */}

                      <Controller
                        name="gender"
                        control={control}
                        rules={{ required: 'Vui lòng chọn giới tính' }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={
                              [
                                { value: 'male', label: 'Nam' },
                                { value: 'female', label: 'Nữ' },
                                { value: 'other', label: 'Khác' },
                              ].find((option) => option.value === field.value) ||
                              [
                                { value: 'male', label: 'Nam' },
                                { value: 'female', label: 'Nữ' },
                                { value: 'other', label: 'Khác' },
                              ].find((option) => option.value === editDoctor?.gender)
                            }
                            onChange={(selectedOption) => field.onChange(selectedOption.value)}
                            options={[
                              { value: 'male', label: 'Nam' },
                              { value: 'female', label: 'Nữ' },
                              { value: 'other', label: 'Khác' },
                            ]}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                borderColor: state.isFocused ? '#999' : '#999',
                                height: '48px',
                                color: 'red',
                                boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                              }),
                              option: (base, { isFocused, isSelected }) => ({
                                ...base,
                                backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                color: isSelected ? 'white' : 'black',
                                padding: '10px',
                                cursor: 'pointer',
                              }),
                            }}
                            placeholder="Giới tính ..."
                          />
                        )}
                      />

                      {errors.gender && (
                        <div>
                          <span className="text-danger text-red-500 text-sm">{errors.gender.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Trình độ</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="positionId"
                          as={Select}
                          control={control}
                          rules={{ required: 'required' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={
                                [
                                  { value: 'doctor', label: 'Bác sĩ' },
                                  { value: 'mater', label: 'Thạc sĩ' },
                                  { value: 'associate professor', label: 'Phó giáo sư' },
                                  { value: 'professor', label: 'Giáo sư' },
                                ].find((option) => option.value === field.value) ||
                                [
                                  { value: 'doctor', label: 'Bác sĩ' },
                                  { value: 'mater', label: 'Thạc sĩ' },
                                  { value: 'associate professor', label: 'Phó giáo sư' },
                                  { value: 'professor', label: 'Giáo sư' },
                                ].find((option) => option.value === editDoctor?.positionId)
                              }
                              onChange={(selectedOption) => field.onChange(selectedOption.value)}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? '#999' : '#999',
                                  height: '48px',
                                  color: 'red',

                                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              options={[
                                { value: 'doctor', label: 'Bác sĩ' },
                                { value: 'mater', label: 'Thạc sĩ' },
                                { value: 'associate professor', label: 'Phó giáo sư' },
                                { value: 'professor', label: 'Giáo sư' },
                              ]}
                              placeholder="Trình độ ..."
                            />
                          )}
                        />

                        {errors.positionId && errors.positionId.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn trình độ'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Chuyên khoa</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="specialtyId"
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
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              value={
                                specialtyOptions.find((option) => option.value === field.value) ||
                                specialtyOptions.find((option) => option.value === editDoctor?.specialtyId)
                              }
                              onChange={(selectedOption) => field.onChange(selectedOption)}
                              options={[{ value: '', label: 'Chuyên khoa', isDisabled: true }, ...specialtyOptions]}
                              placeholder="Chuyên khoa ..."
                            />
                          )}
                        />

                        {errors.specialtyId && errors.specialtyId.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn chuyên khoa'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Tỉnh / Thành</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <Controller
                          name="province"
                          as={Select}
                          control={control}
                          rules={{ required: 'required' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={
                                provinceOptions.find((option) => option.value === field.value) ||
                                provinceOptions.find((option) => option.value === editDoctor?.address[0]?.provinceId)
                              }
                              onChange={(selectedOption) => field.onChange(selectedOption.value)}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? '#999' : '#999',
                                  height: '48px',
                                  color: 'black',
                                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                                }),
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              placeholder="Chọn tỉnh / thành...."
                              options={[{ value: '', label: 'Tỉnh / thành', isDisabled: true }, ...provinceOptions]}
                            />
                          )}
                        />

                        {errors.province && errors.province.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn tỉnh / thành'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Quận / Huyện</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="district"
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
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              value={
                                districtOptions.find((option) => option.value === field.value) ||
                                districtOptions.find((option) => option.value === editDoctor?.address[0]?.districtId)
                              }
                              onChange={(selectedOption) => field.onChange(selectedOption.value)}
                              placeholder="Chọn quận / huyện ...."
                              options={[{ value: '', label: 'Quận / huyện', isDisabled: true }, ...districtOptions]}
                            />
                          )}
                        />

                        {errors.district && errors.district.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn quận / huyện'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Phường/ Xã</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="ward"
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
                                option: (base, { isFocused, isSelected }) => ({
                                  ...base,
                                  backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                                  color: isSelected ? 'white' : 'black',
                                  padding: '10px',
                                  cursor: 'pointer',
                                }),
                              }}
                              value={
                                wardOptions.find((option) => option.value === field.value) ||
                                wardOptions.find((option) => option.value === editDoctor?.address[0]?.districtId)
                              }
                              onChange={(selectedOption) => field.onChange(selectedOption.value)}
                              placeholder="Chọn phường / xã ...."
                              options={[{ value: '', label: 'Phường / xã', isDisabled: true }, ...wardOptions]}
                            />
                          )}
                        />

                        {errors.ward && errors.ward.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn phường / xã'}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Địa chỉ (đường, số nhà)</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="street"
                          id="street"
                          value={editDoctor?.address[0]?.street}
                          className={cx('customInput', 'text-black')}
                          placeholder="Địa chỉ ..."
                          {...register('street', { required: 'Vui lòng nhập địa chỉ!' })}
                        />

                        {errors.address && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.address.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 mb-10 px-8">
                  <div>
                    <label className={cx('label-uploadImage')} htmlFor="upload-image">
                      Upload image
                    </label>
                    <input
                      className={cx('customInput', 'text-black')}
                      id="upload-image"
                      accept="image/*"
                      onChange={handleOnChangeImage}
                      type="file"
                      name="image"
                      hidden
                    ></input>
                    {previewImageURL ? (
                      <div
                        className={cx('upload-image')}
                        onClick={handleOpenImage}
                        style={{ backgroundImage: `url(${previewImageURL})` }}
                      ></div>
                    ) : (
                      ''
                    )}
                    {isOpenImage && (
                      <Lightbox
                        className="mb-10"
                        mainSrc={previewImageURL}
                        onCloseRequest={() => setIsOpenImage(false)}
                      />
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end border-t py-2 pr-6 gap-4 pt-2">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalEdit(false)}>
                Đóng
              </Button>
              <Button
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
                onClick={() => handleSubmit(submitForm)()}
              >
                Sửa hồ sơ
              </Button>
            </div>
          </div>
        </Modal>

        <div>
          {/* {showModalCreate && (
            <CreateDocter
              setShowModalCreate={setShowModalCreate}
              handleGetAllDocter={() => dispatch(fetchDoctorByHospital(userId))}
            />
          )} */}
          {/* {showModalEdit && (
            <EditDocter
              setShowModalEdit={setShowModalEdit}
              handleGetAllDocter={() => dispatch(fetchDoctorByHospital(userId))}
              docter={editDocter}
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Doctor;
