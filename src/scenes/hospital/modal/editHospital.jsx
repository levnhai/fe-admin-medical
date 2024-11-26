import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

// icon
import { RiCloseLine } from 'react-icons/ri';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { Input } from '~/components/input/input';
import {
  password_validation,
  name_validation,
  phone_validation,
  email_validation,
  street_validation,
  desc_validation,
} from '~/utils/inputValidations';

import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchEditHospital } from '~/redux/hospital/hospitalSlice';
import { ConvertBase64 } from '~/utils/common';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function EditHospital({ setShowModalEdit, handleGetAllHospital, hospital }) {
  console.log('Hospital data:', hospital);
  const methods = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      street: '',
      description: '',
    },
  });
  const dispatch = useDispatch();

  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);
  const [previewImageURL, setpreViewImageURL] = useState('');
  const [isOpenImage, setIsOpenImage] = useState();
  const [form, setForm] = useState({
    hospitalType: '',
    provinceId: '',
    districtId: '',
    wardId: '',
    provinceName: '',
    districtName: '',
    wardName: '',
    image: '',
  });

  const provinceData = useSelector((state) => state.location.provinceData);
  const districtData = useSelector((state) => state.location.districtData);
  const wardData = useSelector((state) => state.location.wardData);

  const handleShowHidePassword = () => {
    setShowHidePassword(!showHidePassword);
  };

  const handleShowHideReEnterPassword = () => {
    setConfirmPassword(!confirmPassword);
  };

  const handleChangeProvince = (e) => {
    const select = e.target;
    const provinceId = select.value;
    const provinceName = select.options[select.selectedIndex].text;

    if (provinceId && provinceId !== 'Tỉnh/thành') {
      setForm((prev) => ({
        ...prev,
        provinceId: String(provinceId),
        provinceName,
        districtId: '',
        wardId: '',
        districtName: '',
        wardName: '',
      }));
      dispatch(fetchDistrictsByProvince(provinceId));
    }
  };

  const handleChangeDistrict = (e) => {
    const select = e.target;
    const districtId = select.value;
    const districtName = select.options[select.selectedIndex].text;

    if (districtId && districtId !== 'Huyện/ Thị xã') {
      setForm((prev) => ({
        ...prev,
        districtId: String(districtId),
        districtName,
        wardId: '',
        wardName: '',
      }));
      dispatch(fetchWardsByDistricts(districtId));
    }
  };

  const handleChangeWard = (e) => {
    const select = e.target;
    const wardId = select.value;
    const wardName = select.options[select.selectedIndex].text;

    if (wardId && wardId !== 'Phường/ xã') {
      setForm((prev) => ({
        ...prev,
        wardId: String(wardId),
        wardName,
      }));
    }
  };
  const handleOnchange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOnChangeImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectURL = URL.createObjectURL(file);
    setpreViewImageURL(objectURL);

    const base64 = await ConvertBase64(file);
    setForm((prev) => ({
      ...prev,
      image: base64,
    }));
  };

  const handleOpenImage = () => {
    if (!previewImageURL) return;
    setIsOpenImage(true);
  };

  const handleSubmitEditHospital = methods.handleSubmit(async (formData) => {
    if (!hospital?._id) {
      toast.error('Hospital ID is missing');
      return;
    }

    // Validate address data
    if (!form.provinceId || form.provinceId === 'Tỉnh/thành') {
      toast.error('Vui lòng chọn Tỉnh/Thành phố');
      return;
    }
    if (!form.districtId || form.districtId === 'Huyện/ Thị xã') {
      toast.error('Vui lòng chọn Quận/Huyện');
      return;
    }
    if (!form.wardId || form.wardId === 'Phường/ xã') {
      toast.error('Vui lòng chọn Phường/Xã');
      return;
    }

    // Combine form data from react-hook-form and local state
    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      description: formData.description,
      hospitalType: form.hospitalType,
      image: form.image || hospital.image,
      // Address fields at the top level as expected by backend
      provinceId: form.provinceId,
      provinceName: form.provinceName,
      districtId: form.districtId,
      districtName: form.districtName,
      wardId: form.wardId,
      wardName: form.wardName,
      street: formData.street,
    };

    console.log('Sending payload:', payload);
    console.log('Hospital ID:', hospital._id);

    try {
      const response = await dispatch(
        fetchEditHospital({
          hospitalId: hospital._id,
          formData: payload,
        }),
      );

      console.log('API Response:', response);

      // Nếu không có lỗi được throw, coi như thành công
      toast.success('Cập nhật thành công');
      handleGetAllHospital();
      setShowModalEdit(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
    }
  });

  useEffect(() => {
    if (hospital) {
      methods.reset({
        fullName: hospital.fullName || '',
        phoneNumber: hospital.phoneNumber || '',
        email: hospital.email || '',
        street: hospital.address?.[0]?.street || '',
        description: hospital.description || '',
      });

      setForm({
        hospitalType: hospital.hospitalType || '',
        provinceId: hospital.address?.[0]?.provinceId || '',
        districtId: hospital.address?.[0]?.districtId || '',
        wardId: hospital.address?.[0]?.wardId || '',
        provinceName: hospital.address?.[0]?.provinceName || '',
        districtName: hospital.address?.[0]?.districtName || '',
        wardName: hospital.address?.[0]?.wardName || '',
        image: hospital.image || '',
      });

      if (hospital.image) {
        setpreViewImageURL(hospital.image);
      }
      if (hospital.address?.[0]?.provinceId) {
        dispatch(fetchDistrictsByProvince(hospital.address[0].provinceId));
      }
      if (hospital.address?.[0]?.districtId) {
        dispatch(fetchWardsByDistricts(hospital.address[0].districtId));
      }
    }
  }, [hospital, methods]);

  useEffect(() => {
    dispatch(fetchAllProvinces());
  }, [dispatch]);
  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalEdit(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Sửa thông tin bệnh viện</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalEdit(false)}>
            <RiCloseLine style={{ marginBottom: '-3px' }} />
          </button>
          <div className={cx('modalContent')}>
            <div className={cx('wrapper--input')}>
              <FormProvider {...methods}>
                <div className="w-full ">
                  <Input {...name_validation} />
                </div>

                <div className="flex gap-4">
                  <div className="w-full md:w-1/2 mb-6 md:mb-0">
                    <Input {...phone_validation} />
                  </div>
                  <div className="w-full md:w-1/2 mb-6 md:mb-0">
                    <Input {...email_validation} />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="hospitalType"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          hospitalType: e.target.value,
                        }))
                      }
                      value={form.hospitalType}
                      name="hospitalType"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option name="hospitalType" disabled value="">
                        ---- Loại bệnh viện ---
                      </option>
                      <option name="hospitalType" value="benh-vien-cong">
                        Bệnh viện công
                      </option>
                      <option name="hospitalType" value="benh-vien-tu">
                        Bệnh viện tư
                      </option>
                      <option name="hospitalType" value="phong-kham">
                        Phòng khám
                      </option>
                      <option name="hospitalType" value="phong-mach">
                        Phòng mạch
                      </option>
                      <option name="hospitalType" value="xet-nghiem">
                        Xét nghiệm
                      </option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="province"
                      name="provinceId"
                      value={form.provinceId}
                      onChange={handleChangeProvince}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected>Tỉnh/thành</option>
                      {provinceData?.data.map((item, index) => {
                        return (
                          <option name="provinceId" value={String(item.id)}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="district"
                      name="districtId"
                      value={form.districtId}
                      onChange={handleChangeDistrict}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected>Huyện/ Thị xã</option>
                      {districtData?.data.map((item, index) => {
                        return (
                          <option name="districtId" value={String(item.id)}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="ward"
                      onChange={handleChangeWard}
                      name="wardId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected>Phường/ xã</option>
                      {wardData?.data.map((item, index) => {
                        return (
                          <option name="wardId" value={String(item.id)}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="w-full">
                  <Input {...street_validation} />
                </div>
                <div className="w-full">
                  <Input {...desc_validation} />
                </div>
                <div className="mt-4">
                  <div>
                    <label className={cx('label-uploadImage')} htmlFor="upload-image">
                      Upload image
                    </label>
                    <input
                      className={cx('customInput')}
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
                        onClick={() => setIsOpenImage(true)}
                        style={{ backgroundImage: `url(${previewImageURL})` }}
                      ></div>
                    ) : (
                      ''
                    )}
                    {isOpenImage && <Lightbox mainSrc={previewImageURL} onCloseRequest={() => setIsOpenImage(false)} />}
                  </div>
                </div>
              </FormProvider>
            </div>
          </div>
          <div className={cx('modalActions')}>
            <div className={cx('actionsContainer')}>
              <button className={cx('deleteBtn')} onClick={handleSubmitEditHospital}>
                Update hospital
              </button>
              <button className={cx('cancelBtn')} onClick={() => setShowModalEdit(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditHospital;
