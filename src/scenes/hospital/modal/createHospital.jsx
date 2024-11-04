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

import { Input } from '~/components/input/input';
import {
  name_validation,
  phone_validation,
  email_validation,
  street_validation,
  desc_validation,
} from '~/utils/inputValidations';
import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchCreateHospital } from '~/redux/hospital/hospitalSlice';
import { ConvertBase64 } from '~/utils/common';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function CreateDocter({ setShowModalCreate, handleGetAllDocter }) {
  const methods = useForm();
  const dispatch = useDispatch();

  const [previewImageURL, setpreViewImageURL] = useState();
  const [isOpenImage, setIsOpenImage] = useState();

  const [form, setForm] = useState({
    hospitalType: '',
    positionId: '',
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
    const data = { ...formData, ...form };
    console.log('check formData', data);

    try {
      const response = await dispatch(fetchCreateHospital(data));
      const result = await unwrapResult(response);
      console.log('check response', result);
      if (result?.status) {
        toast.success(result?.message);
        handleGetAllDocter();
        setShowModalCreate(false);
      } else {
        toast.success(result?.message);
        setShowModalCreate(true);
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
      <div className={cx('darkBG')} onClick={() => setShowModalCreate(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Thêm bệnh viện</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalCreate(false)}>
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
                <div class="flex gap-4 mt-4">
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="hospitalType"
                      onChange={handleOnchange}
                      value={form.hospitalType}
                      name="hospitalType"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                      id="ward"
                      onChange={handleChangeWard}
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
                <div class="w-full">
                  <Input {...street_validation} />
                </div>
                <div class="w-full">
                  <Input {...desc_validation} />
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
                Create hospital
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