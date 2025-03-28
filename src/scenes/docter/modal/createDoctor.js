import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import classNames from 'classnames/bind';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import Lightbox from 'react-image-lightbox';

//icon
import { BiLoaderAlt } from 'react-icons/bi';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import Button from '~/components/Button';
import Modal from '~/components/Modal';
import { ConvertBase64 } from '~/utils/common';
import { fetchCreateDoctor } from '~/redux/doctor/doctorSlice';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';

import styles from '../doctor.module.scss';
const cx = classNames.bind(styles);

function CreateDoctor({ editDoctor, specialtyOptions, setShowModalCreate, fetchDoctorData }) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.auth.user?.payload);
  const userId = userLogin?.userData?._id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImageURL, setpreViewImageURL] = useState();
  const [urlImage, setUrlImage] = useState();
  const [isOpenImage, setIsOpenImage] = useState();
  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(editDoctor?.address[0]?.provinceId || null);
  const [selectedDistrict, setSelectedDistrict] = useState(editDoctor?.address[0]?.districtId || null);

  const handleOnChangeImage = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    let file = e.target.files[0];
    console.log('check file ', file);
    if (file) {
      const objectURL = URL.createObjectURL(file);
      console.log('check objectURL', objectURL);
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
    setSelectedProvince(selectedOption.value);
    setSelectedDistrict(null); // Reset quận/huyện khi đổi tỉnh
    setWardOptions([]);
  };

  // Khi chọn quận/ huyện
  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption.value);
    setWardOptions([]);
  };

  const submitForm = async (data) => {
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
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await dispatch(fetchAllProvinces());
      const result = unwrapResult(res);
      const provinceOptions = result.data.map((provinces) => ({
        value: provinces.id,
        label: provinces.name,
      }));
      setProvinceOptions(provinceOptions);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        const res = await dispatch(fetchDistrictsByProvince(selectedProvince || selectedProvince?.value));
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
      const fetchWards = async () => {
        const res = await dispatch(fetchWardsByDistricts(selectedDistrict || selectedDistrict?.value));
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

  useEffect(() => {
    if (editDoctor) {
      reset({
        gender: editDoctor.gender || '',
        specialtyId: editDoctor.specialty?._id || '',
        positionId: editDoctor.positionId || '',
        province: {
          id: editDoctor?.address?.[0]?.provinceId || '',
          name: editDoctor?.address?.[0]?.provinceName || '',
        },
        district: {
          id: editDoctor?.address?.[0]?.districtId || '',
          name: editDoctor?.address?.[0]?.districtName || '',
        },
        ward: {
          id: editDoctor?.address?.[0]?.wardId || '',
          name: editDoctor?.address?.[0]?.wardName || '',
        },
      });
    }
  }, [editDoctor, reset]);
  return (
    <Modal isOpen={true} onClose={() => setShowModalCreate(false)} title="Thêm bác sĩ">
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
                  <Lightbox className="mb-10" mainSrc={previewImageURL} onCloseRequest={() => setIsOpenImage(false)} />
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="flex justify-end border-t py-2 pr-6 gap-4 pt-2">
          <Button className="text-[#2c3e50]" onClick={() => setShowModalCreate(false)}>
            Đóng
          </Button>
          <Button
            className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
            onClick={() => handleSubmit(submitForm)()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <BiLoaderAlt className="animate-spin mr-2" />
                Đang xử lý...
              </div>
            ) : (
              'Thêm mới'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateDoctor;
