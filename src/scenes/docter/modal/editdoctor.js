import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import classNames from 'classnames/bind';
import Select from 'react-select';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { BiLoaderAlt } from 'react-icons/bi';
import Lightbox from 'react-image-lightbox';
import { Buffer } from 'buffer';

import Button from '~/components/Button';
import Modal from '~/components/Modal';
import { ConvertBase64 } from '~/utils/common';
import { fetchUpdateDoctor } from '~/redux/doctor/doctorSlice';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';

import styles from '../doctor.module.scss';
const cx = classNames.bind(styles);

function EditDoctor({ editDoctor, specialtyOptions, setShowModalEdit, fetchDoctorData }) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImageURL, setpreViewImageURL] = useState(Buffer.from(editDoctor.image, 'base64').toString('binary'));
  const [urlImage, setUrlImage] = useState();
  const [isOpenImage, setIsOpenImage] = useState();

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

  const handleEditDoctor = async (doctor) => {
    if (isSubmitting) return;

    try {
      const formData = { ...doctor, image: urlImage };
      setIsSubmitting(true);
      const response = await dispatch(
        fetchUpdateDoctor({
          doctorId: editDoctor?._id,
          formData: formData,
        }),
      );
      const result = unwrapResult(response);
      if (result?.status) {
        setShowModalEdit(false);
        toast.success(result?.message);
        fetchDoctorData();
      } else {
        toast.warning(result?.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
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
    <Modal isOpen={true} onClose={() => setShowModalEdit(false)} title="Sửa thông tin bác sĩ">
      <div>
        <div className="max-h-80 overflow-auto">
          <form onSubmit={handleSubmit(handleEditDoctor)}>
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
                      defaultValue={editDoctor?.fullName}
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
                      defaultValue={editDoctor?.email}
                      className={cx('customInput', 'text-black')}
                      placeholder="Email ..."
                      {...register('email', {
                        required: 'Vui lòng nhập email',
                      })}
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
                      defaultValue={editDoctor?.phoneNumber}
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
                          ].find((option) => option.value === field.value) || null
                        }
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption.value);
                          setValue('gender', selectedOption.value);
                        }}
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
                            specialtyOptions?.find((option) => option.value === field.value) ||
                            specialtyOptions?.find((option) => option.value === editDoctor?.specialty?._id)
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
                    <h2 className="font-semibold text-black">Tỉnh thành</h2>
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
                            (provinceOptions?.length > 0 &&
                              provinceOptions.find((option) => option.value === field.value)) ||
                            (provinceOptions?.length > 0 &&
                              provinceOptions.find((option) => option.value === editDoctor?.address[0]?.provinceId))
                          }
                          onChange={(selectedOption) => {
                            field.onChange(selectedOption);
                            handleProvinceChange(selectedOption);
                          }}
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
                          options={[{ value: '', label: 'Tỉnh thành', isDisabled: true }, ...provinceOptions]}
                          placeholder="Tỉnh thành..."
                        />
                      )}
                    />

                    {errors.province && errors.province.type === 'required' ? (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{'Chọn tỉnh thành'}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Quận huyện</h2>
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
                          value={
                            (districtOptions?.length > 0 &&
                              districtOptions.find((option) => option.value === field.value)) ||
                            (districtOptions?.length > 0 &&
                              districtOptions.find((option) => option.value === editDoctor?.address[0]?.districtId))
                          }
                          onChange={(selectedOption) => {
                            field.onChange(selectedOption);
                            handleDistrictChange(selectedOption);
                          }}
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
                          options={[{ value: '', label: 'Quận huyện', isDisabled: true }, ...districtOptions]}
                          placeholder="Chọn quận / huyện ...."
                        />
                      )}
                    />

                    {errors.district && errors.district.type === 'required' ? (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{'Chọn quận huyện'}</span>
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
                          value={
                            (wardOptions?.length > 0 && wardOptions.find((option) => option.value === field.value)) ||
                            (wardOptions?.length > 0 &&
                              wardOptions.find((option) => option.value === editDoctor?.address[0]?.wardId))
                          }
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
                          options={[{ value: '', label: 'Phường xã', isDisabled: true }, ...wardOptions]}
                          placeholder="Phường / xã ..."
                        />
                      )}
                    />

                    {errors.ward && errors.ward.type === 'required' ? (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{'Chọn phường xã'}</span>
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
                      defaultValue={editDoctor?.address[0]?.street}
                      className={cx('customInput', 'text-black')}
                      placeholder="Địa chỉ ..."
                      {...register('street', { required: 'Vui lòng nhập địa chỉ' })}
                    />

                    {errors.street && (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{errors.street.message}</span>
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
          <Button className="text-[#2c3e50]" onClick={() => setShowModalEdit(false)}>
            Đóng
          </Button>
          <Button
            className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
            onClick={() => {
              console.log('Submit clicked!');
              handleSubmit(handleEditDoctor)();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <BiLoaderAlt className="animate-spin mr-2" />
                Đang xử lý...
              </div>
            ) : (
              'Sửa hồ sơ'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default EditDoctor;
