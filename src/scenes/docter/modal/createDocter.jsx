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
} from '~/utils/inputValidations';
import { ConvertBase64 } from '~/utils/common';

import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchCreateDoctor } from '~/redux/doctor/doctorSlice';
import { fetchAllHospital } from '~/redux/hospital/hospitalSlice';
import { fetchAllSpecialty } from '~/redux/specialty/specialtySlice';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function CreateDocter({ setShowModalCreate, handleGetAllDocter }) {
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
    hospitalId: '',
    specialtyId: '',
    wardId: '',
    provinceName: '',
    districtName: '',
    wardName: '',
    image: '',
  });

  const provinceData = useSelector((state) => state.location.provinceData);
  const districtData = useSelector((state) => state.location.districtData);
  const wardData = useSelector((state) => state.location.wardData);
  const specialtyData = useSelector((state) => state.specialty.specialtyData);
  const user = useSelector((state) => state.auth.user?.payload);

  const handleShowHidePassword = () => {
    setShowHidePassword(!showHidePassword);
  };

  const handleShowHideReEnterPassword = () => {
    setConfirmPassword(!confirmPassword);
  };

  // handle onchange province
  const handleChangeProvince = (e) => {
    const provinceId = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;
    setForm((prevForm) => ({
      ...prevForm,
      provinceName,
      provinceId,
    }));
    dispatch(fetchDistrictsByProvince(e.target.value));
  };

  // handle onchage district
  const handleChangeDistrict = (e) => {
    const districtId = e.target.value;
    const districtName = e.target.options[e.target.selectedIndex].text;
    setForm((prevForm) => ({
      ...prevForm,
      districtName,
      districtId,
    }));
    dispatch(fetchWardsByDistricts(e.target.value));
  };

  // handle onchage ward
  const handleChangeWard = (e) => {
    const wardId = e.target.value;
    const wardName = e.target.options[e.target.selectedIndex].text;
    setForm((prevForm) => ({
      ...prevForm,
      wardId,
      wardName,
    }));
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
    const data = { ...formData, ...form, hospitalId: user?.userData?._id };

    try {
      const response = await dispatch(fetchCreateDoctor(data));
      const result = await unwrapResult(response);
      if (result?.status) {
        toast.success(result?.message);
        handleGetAllDocter();
        setShowModalCreate(false);
      } else {
        toast.warning(result?.message);
        setShowModalCreate(true);
      }
    } catch (error) {
      return error;
    }
  });

  useEffect(() => {
    dispatch(fetchAllProvinces());
    dispatch(fetchAllSpecialty());
    dispatch(fetchAllHospital());
  }, []);

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalCreate(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Thêm bác sĩ</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalCreate(false)}>
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
                <div className="flex gap-4">
                  <div className="relative w-full md:w-1/2 mb-6 md:mb-0">
                    <Input type={showHidePassword ? 'password' : 'text'} {...password_validation} />
                    <span
                      onMouseDown={handleShowHidePassword}
                      onMouseUp={() => setShowHidePassword(true)}
                      onMouseLeave={() => setShowHidePassword(true)}
                      className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 mt-3"
                    >
                      {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </span>
                  </div>
                  <div className="relative w-full md:w-1/2 mb-6 md:mb-0">
                    <Input
                      validation={{
                        required: {
                          value: true,
                          message: 'required',
                        },
                      }}
                      label=""
                      type={confirmPassword ? 'password' : 'text'}
                      id="reEnterPassword"
                      placeholder="Re-enter password..."
                      name="reEnterPassword"
                    />
                    <span
                      onMouseDown={handleShowHideReEnterPassword}
                      onMouseUp={() => setConfirmPassword(true)}
                      onMouseLeave={() => setConfirmPassword(true)}
                      className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 mt-3"
                    >
                      {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <div className="w-full md:w-1/2 mb-6 md:mb-0">
                    <select
                      id="gender"
                      onChange={handleOnchange}
                      value={form.gender}
                      name="gender"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option disabled value="">
                        ---- Giới tính ---
                      </option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                      <option value="male">Nam</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/2 mb-6 md:mb-0">
                    <select
                      id="province"
                      onChange={handleOnchange}
                      value={form.positionId}
                      name="positionId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="" disabled>
                        --- Trình độ ---
                      </option>
                      <option value="docter">Bác sỹ</option>
                      <option value="mater">Thạc sỹ</option>
                      <option value="associate professor">Phó giáo sư</option>
                      <option value="professor">Giáo sư</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="w-full md:w-1/2 mb-6 md:mb-0">
                    <select
                      id="specialtyId"
                      onChange={handleOnchange}
                      value={form.specialtyId}
                      name="specialtyId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option disabled value="">
                        ---- Chuyên khoa ---
                      </option>
                      {specialtyData &&
                        specialtyData?.data?.map((item, index) => {
                          return (
                            <option key={index} value={item._id}>
                              {item.fullName}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div className="=w-full md:w-1/2 mb-6 md:mb-0">
                    <select
                      id="price"
                      onChange={handleOnchange}
                      value={form.price}
                      name="price"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="" disabled selected>
                        --- Giá khám ---
                      </option>
                      <option value="100000">100 000</option>
                      <option value="200000">200 000</option>
                      <option value="300000">300 000</option>
                      <option value="400000">400 000</option>
                      <option value="500000">500 000</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div clNameass="w-full md:w-1/3 mb-6 md:mb-0">
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
                          <option name="provinceId" value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div clNameass="w-full md:w-1/3 mb-6 md:mb-0">
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
                          <option name="districtId" value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div clNameass="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="ward"
                      onChange={handleChangeWard}
                      name="wardId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

                <div className="w-full ">
                  <Input {...street_validation} />
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
              <button className={cx('cancelBtn')} onClick={() => setShowModalCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateDocter;
