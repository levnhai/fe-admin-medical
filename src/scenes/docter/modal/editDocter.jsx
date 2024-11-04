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
import { password_validation, name_validation, phone_validation, email_validation } from '~/utils/inputValidations';

import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchCreateDocter } from '~/redux/docter/docterSlice';
import { ConvertBase64 } from '~/utils/common';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function EditDocter({ setShowModalEdit, handleGetAllDocter, docter }) {
  const methods = useForm();
  const dispatch = useDispatch();

  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);
  const [previewImageURL, setpreViewImageURL] = useState();
  const [isOpenImage, setIsOpenImage] = useState();
  const [form, setForm] = useState({
    gender: '',
    price: '',
    positionId: '',
    provinceId: '',
    districtId: '',
    provinceName: '',
    districtName: '',
    wardId: '',
    image: '',
  });

  const [formData, setFormData] = useState({
    id: docter._id || '',
    phoneNumber: docter.phoneNumber || '',
    fullName: docter.fullName || '',
    email: docter.email || '',
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
    handleOnchange(e);
    const provinceName = e.target.options[e.target.selectedIndex].text;
    setForm((prevForm) => ({
      ...prevForm,
      provinceName: provinceName,
    }));
    console.log('check provinceName', form);
    dispatch(fetchDistrictsByProvince(e.target.value));
  };

  const handleChangeDistrict = (e) => {
    handleOnchange(e);
    const districtName = e.target.options[e.target.selectedIndex].text;
    setForm((prevForm) => ({
      ...prevForm,
      districtName: districtName,
    }));
    dispatch(fetchWardsByDistricts(e.target.value));
  };

  const handleOnchange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    setForm({ ...form, image: urlBase64 });
  };

  const handleOpenImage = () => {
    if (!previewImageURL) return;
    setIsOpenImage(true);
  };

  const handleSubmitCreateUser = methods.handleSubmit(async (formData) => {
    const data = { ...formData, ...form };
    console.log('check form data', data);

    try {
      const response = await dispatch(fetchCreateDocter(data));
      const result = await unwrapResult(response);
      console.log('check response', result);
      if (result?.status) {
        toast.success(result?.message);
        handleGetAllDocter();
        setShowModalEdit(false);
      } else {
        toast.success(result?.message);
        setShowModalEdit(true);
      }
    } catch (error) {
      return error;
    }
  });

  useEffect(() => {
    dispatch(fetchAllProvinces());
  }, []);

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalEdit(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Thêm bác sĩ</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalEdit(false)}>
            <RiCloseLine style={{ marginBottom: '-3px' }} />
          </button>
          <div className={cx('modalContent')}>
            <div className={cx('wrapper--input')}>
              <FormProvider {...methods}>
                <div class="w-full ">
                  <Input {...name_validation} />
                </div>
                <div class="flex gap-4">
                  <div class="w-full md:w-1/2 mb-6 md:mb-0">
                    <Input {...phone_validation} />
                  </div>
                  <div class="w-full md:w-1/2 mb-6 md:mb-0">
                    <Input {...email_validation} />
                  </div>
                </div>
                <div class="flex gap-4">
                  <div class="relative w-full md:w-1/2 mb-6 md:mb-0">
                    <Input type={showHidePassword ? 'password' : ' text'} {...password_validation} />
                    <span
                      onMouseDown={handleShowHidePassword}
                      onMouseUp={() => setShowHidePassword(true)}
                      onMouseLeave={() => setShowHidePassword(true)}
                      class="absolute cursor-pointer text-xl top-2/4 right-3.5"
                    >
                      {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </span>
                  </div>
                  <div class="relative w-full md:w-1/2 mb-6 md:mb-0">
                    <Input
                      validation={{
                        required: {
                          value: true,
                          message: 'required',
                        },
                      }}
                      label=""
                      type={confirmPassword ? 'password' : ' text'}
                      id="reEnterPassword"
                      placeholder="Please enter your reEnterPassword..."
                      name="reEnterPassword"
                    />
                    <span
                      onMouseDown={handleShowHideReEnterPassword}
                      onMouseUp={() => setConfirmPassword(true)}
                      onMouseLeave={() => setConfirmPassword(true)}
                      class="absolute cursor-pointer text-xl top-2/4 right-3.5"
                    >
                      {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </span>
                  </div>
                </div>
                <div class="flex gap-4 mt-4">
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="gender"
                      onChange={handleOnchange}
                      value={form.gender}
                      name="gender"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option name="gender" disabled value="">
                        ---- Giới tính ---
                      </option>
                      <option name="gender" value="females">
                        Nữ
                      </option>
                      <option name="gender" value="other">
                        Khác
                      </option>
                      <option name="gender" value="male">
                        Nam
                      </option>
                    </select>
                  </div>
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="province"
                      onChange={handleOnchange}
                      value={form.positionId}
                      name="positionId"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option name="positionId" value="" disabled>
                        --- Trình độ ---
                      </option>
                      <option name="positionId" value="docter">
                        Bác sỹ
                      </option>
                      <option name="positionId" value="mater">
                        Thạc sỹ
                      </option>
                      <option name="positionId" value="associate professor">
                        Phó giáo sư
                      </option>
                      <option name="positionId" value="professor">
                        Giáo sư
                      </option>
                    </select>
                  </div>
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="price"
                      onChange={handleOnchange}
                      value={form.price}
                      name="price"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option name="positionId" value="" disabled selected>
                        --- Giá khám ---
                      </option>
                      <option name="price" value="100000">
                        100 000
                      </option>
                      <option name="price" value="200000">
                        200 000
                      </option>
                      <option name="price" value="300000">
                        300 000
                      </option>
                      <option name="price" value="400000">
                        400 000
                      </option>
                      <option name="price" value="500000">
                        500 000
                      </option>
                    </select>
                  </div>
                </div>
                <div class="flex gap-4 mt-4">
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="province"
                      name="provinceId"
                      value={form.provinceId}
                      onChange={handleChangeProvince}
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected>Tỉnh/thành</option>
                      {provinceData?.data.map((item, index) => {
                        return (
                          <option name="provinceId" value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="district"
                      name="districtId"
                      value={form.districtId}
                      onChange={handleChangeDistrict}
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected>Huyện/ Thị xã</option>
                      {districtData?.data.map((item, index) => {
                        return (
                          <option name="districtId" value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="province"
                      onChange={handleOnchange}
                      name="wardId"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected>Phường/ xã</option>
                      {wardData?.data.map((item, index) => {
                        return (
                          <option name="wardId" value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div class="mt-4">
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
                        onClick={handleOpenImage}
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
              <button className={cx('deleteBtn')} onClick={handleSubmitCreateUser}>
                Create docter
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

export default EditDocter;
