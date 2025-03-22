import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import classNames from 'classnames/bind';
import Select from 'react-select';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { BiLoaderAlt } from 'react-icons/bi';

import Button from '~/components/Button';
import Modal from '~/components/Modal';
import { fetchEditHospital } from '~/redux/hospital/hospitalSlice';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';

import styles from '../hospital.module.scss';
const cx = classNames.bind(styles);

function EditHospital({ editHospital, setShowModalEdit, fetchHospitalData }) {
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


  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(editHospital?.address[0]?.provinceId || null);
  const [selectedDistrict, setSelectedDistrict] = useState(editHospital?.address[0]?.districtId || null);

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

  const handleEditHospital = async (hospital) => {
    if (isSubmitting) return; 
    try {
      setIsSubmitting(true);
      console.log('check hospital', hospital);
      const response = await dispatch(
        fetchEditHospital({
          hospitalId: editHospital?._id,
          formData: hospital,
        }),
      );
      const result = unwrapResult(response);
      if (result?.status) {
        setShowModalEdit(false);
        toast.success(result?.message);
        fetchHospitalData();
      } else {
        toast.warning(result?.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
    }finally {
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
    if (editHospital) {
      reset({
        hospitalType: editHospital?.hospitalType || '',
        image: editHospital?.image || '',
        specialtyId: editHospital.specialty?._id || '',
        renewalStatus: editHospital?.renewalStatus || '',
        province: {
          id: editHospital?.address?.[0]?.provinceId || '',
          name: editHospital?.address?.[0]?.provinceName || '',
        },
        district: {
          id: editHospital?.address?.[0]?.districtId || '',
          name: editHospital?.address?.[0]?.districtName || '',
        },
        ward: {
          id: editHospital?.address?.[0]?.wardId || '',
          name: editHospital?.address?.[0]?.wardName || '',
        },
      });
    }
  }, [editHospital, reset]);
  return (
    <Modal isOpen={true} onClose={() => setShowModalEdit(false)} title="Sửa thông tin bệnh viện">
      <div>
        <div className="max-h-80 overflow-auto">
          <form onSubmit={handleSubmit(handleEditHospital)}>
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
                      defaultValue={editHospital?.fullName}
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
                      defaultValue={editHospital?.accountId?.email}
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
                      defaultValue={editHospital?.accountId?.phoneNumber}
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

                  <Controller
                    name="hospitalType"
                    control={control}
                    rules={{ required: 'Vui lòng chọn loại bệnh viện' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={
                          [
                            { value: 'benh-vien-cong', label: 'Bệnh viện công' },
                            { value: 'benh-vien-tu', label: 'Bệnh viện tư' },
                            { value: 'phong-kham', label: 'Phòng khám' },
                            { value: 'phong-mach', label: 'Phòng mạch' },
                            { value: 'xet-nghiem', label: 'Xét nghiệm' },
                          ].find((option) => option.value === field.value) ||
                          [
                            { value: 'benh-vien-cong', label: 'Bệnh viện công' },
                            { value: 'benh-vien-tu', label: 'Bệnh viện tư' },
                            { value: 'phong-kham', label: 'Phòng khám' },
                            { value: 'phong-mach', label: 'Phòng mạch' },
                            { value: 'xet-nghiem', label: 'Xét nghiệm' },
                          ].find((option) => option.value === editHospital?.hospitalType)
                        }
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption.value);
                          setValue('hospitalType', selectedOption.value);
                        }}
                        options={[
                          { value: 'benh-vien-cong', label: 'Bệnh viện công' },
                          { value: 'benh-vien-tu', label: 'Bệnh viện tư' },
                          { value: 'phong-kham', label: 'Phòng khám' },
                          { value: 'phong-mach', label: 'Phòng mạch' },
                          { value: 'xet-nghiem', label: 'Xét nghiệm' },
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
                        placeholder="Loại bệnh viện ..."
                      />
                    )}
                  />

                  {errors.hospitalType && (
                    <div>
                      <span className="text-danger text-red-500 text-sm">{errors.hospitalType.message}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Phí dịch vụ</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>

                  <div className="mt-2">
                    <input
                      type="text"
                      name="monthlyFee"
                      id="monthlyFee"
                      defaultValue={editHospital?.monthlyFee}
                      className={cx('customInput', 'text-black')}
                      placeholder="Phí dịch vụ ..."
                      {...register('monthlyFee', { required: 'Vui lòng nhập phí dịch vụ' })}
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
                          value={
                            [
                              { value: 'true', label: 'Đã gia hạn' },
                              { value: 'false', label: 'Chưa gia hạn' },
                            ].find((option) => option.value === field.value) ||
                            [
                              { value: 'true', label: 'Đã gia hạn' },
                              { value: 'false', label: 'Chưa gia hạn' },
                            ].find((option) => option.value === editHospital?.renewalStatus)
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
                            { value: 'true', label: 'Đã gia hạn' },
                            { value: 'false', label: 'Chưa gia hạn' },
                          ]}
                          placeholder="Trạng thái gia hạn ..."
                        />
                      )}
                    />

                    {errors.renewalStatus && errors.renewalStatus.type === 'required' ? (
                      <div>
                        <span className="text-danger text-red-500 text-sm">{'Chọn trạng thái gia hạn'}</span>
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
                              provinceOptions.find((option) => option.value === editHospital?.address[0]?.provinceId))
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
                              districtOptions.find((option) => option.value === editHospital?.address[0]?.districtId))
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
                              wardOptions.find((option) => option.value === editHospital?.address[0]?.wardId))
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
                      defaultValue={editHospital?.address[0]?.street}
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
                      defaultValue={editHospital?.description}
                      placeholder="mô tả ..."
                      {...register('description')}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="mt-4 mb-10 px-8">
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
            </div> */}
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
              handleSubmit(handleEditHospital)();
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

export default EditHospital;
