import { useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm, Controller } from 'react-hook-form';
import Lightbox from 'react-image-lightbox';
import Select from 'react-select';
import classNames from 'classnames/bind';
import styles from './hospital.module.scss';

import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import { removeAccents } from '~/utils/string';
import EditHospital from './modal/editHospital';
import { ConvertBase64 } from '~/utils/common';

import { fetchAllHospital, fetchDeleteHospital, fetchCreateHospital } from '~/redux/hospital/hospitalSlice';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
const cx = classNames.bind(styles);

const Hospital = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const colors = tokens(theme.palette.mode);
  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editHospital, setEditHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [previewImageURL, setpreViewImageURL] = useState();
  const [isOpenImage, setIsOpenImage] = useState();
  const [urlImage, setUrlImage] = useState(null);

  const hospitalData = useSelector((state) => state.hospital.hospitalData);
  const isLoading = useSelector((state) => state.hospital.loading);

  console.log('check hospitalData', hospitalData);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

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

  const confirmDeleteHospital = (hospitalId) => {
    setSelectedUserId(hospitalId); // Set the ID to be deleted
    setShowModalDelete(true);
  };

  const handleDeleteHospital = async () => {
    try {
      if (!selectedUserId) {
        toast.error('Không tìm thấy ID bệnh viện để xóa');
        return;
      }

      const res = await dispatch(fetchDeleteHospital(selectedUserId));
      const result = unwrapResult(res);

      if (result?.status) {
        toast.success(result?.message || 'Xóa bệnh viện thành công');
        setSelectedUsers((prev) => prev.filter((id) => id !== selectedUserId));
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
    setSelectedUsers([]);
  };

  const submitForm = async (data) => {
    const {
      email,
      fullName,
      district,
      hospitalType,
      password,
      phoneNumber,
      positionId,
      province,
      reEnterPassword,
      street,
      ward,
      monthlyFee,
      renewalStatus,
    } = data;
    const formData = {
      email,
      fullName,
      hospitalType: hospitalType?.value,
      password,
      phoneNumber,
      reEnterPassword,
      monthlyFee,
      street,
      renewalStatus: renewalStatus?.value,
      districtId: district?.value,
      districtName: district?.label,
      positionId: positionId?.value,
      provinceId: province?.value,
      provinceName: province?.label,
      wardId: ward?.value,
      wardName: ward?.label,
      image: urlImage,
    };
    console.log('check formData', formData);
    try {
      const response = await dispatch(fetchCreateHospital(formData));
      const result = await unwrapResult(response);
      console.log('check result', result);
      if (result?.status) {
        toast.success(result?.message);
        setShowModalCreate(false);
        fetchHospitalData();
      } else {
        toast.warning(result?.message);
        setShowModalCreate(true);
      }
    } catch (error) {
      return error;
    }
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
          <div></div>
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
                <th scope="col" className="px-6 py-3">
                  STT
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
                      <td className="w-4 p-4">{index + 1}</td>
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
                          <div className="font-normal text-gray-500">{item?.accountId?.email}</div>
                        </div>
                      </th>
                      <td className="px-6 py-4">{item?.accountId?.phoneNumber}</td>
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

        {/* modal delete */}
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

        {/*  modal create */}
        <Modal isOpen={showModalCreate} onClose={() => setShowModalCreate(false)} title="Thêm bệnh viện">
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
                        <h2 className="font-semibold text-black">Loại bệnh viện</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="hospitalType"
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
                                { value: 'benh-vien-cong', label: 'Bệnh viện công' },
                                { value: 'benh-vien-tu', label: 'Bệnh viện tư' },
                                { value: 'phong-kham', label: 'Phòng khám' },
                                { value: 'phong-mach', label: 'Phòng mạch' },
                                { value: 'xet-nghiem', label: 'Xét nghiệm' },
                              ]}
                              placeholder="Loại bệnh viện ..."
                            />
                          )}
                        />

                        {errors.hospitalType && errors.hospitalType.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Chọn loại bệnh viện'}</span>
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
                        <h2 className="font-semibold text-black">Phí dịch vụ/ tháng</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="monthlyFee"
                          id="monthlyFee"
                          className={cx('customInput', 'text-black')}
                          placeholder="Phí dịch vụ ..."
                          {...register('monthlyFee', { required: 'Phí dịch vụ' })}
                        />

                        {errors.monthlyFee && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.monthlyFee.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Trạng thái gia hạn</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>

                      <div className="mt-2">
                        <Controller
                          name="renewalStatus"
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
                                { value: 'true', label: 'Đã gia hạn' },
                                { value: 'false', label: 'Chưa gia hạn' },
                              ]}
                              placeholder="Trạng thái gia hạn ..."
                            />
                          )}
                        />

                        {errors.renewalStatus && errors.renewalStatus.type === 'required' ? (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{'Trạng thái gia hạn'}</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                    <div className="col-span-2">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Mô tả</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="description"
                          id="description"
                          className={cx('customInput', 'text-black')}
                          placeholder="mô tả ..."
                          {...register('description', { required: 'Vui lòng nhập mô tả' })}
                        />

                        {errors.description && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.description.message}</span>
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
        <div>
          {/* {showModalCreate && (
            <CreateHospital
              setShowModalCreate={setShowModalCreate}
              handleGetAllDocter={() => dispatch(fetchAllHospital())}
            />
          )} */}
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
