import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

// icon
import { RiCloseLine } from 'react-icons/ri';

import { Input } from '~/components/input/input';
import { name_validation, phone_validation, email_validation } from '~/utils/inputValidations';

import { fetchAllProvinces, fetchDistrictsByProvince, fetchWardsByDistricts } from '~/redux/location/locationSlice';
import { fetchUpdateDoctor } from '~/redux/docter/docterSlice';
import { fetchAllHospital } from '~/redux/hospital/hospitalSlice';
import { ConvertBase64 } from '~/utils/common';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function EditDocter({ setShowModalEdit, handleGetAllDocter, docter }) {
  const methods = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
    },
  });
  const dispatch = useDispatch();

  // const [showHidePassword, setShowHidePassword] = useState(true);
  // const [confirmPassword, setConfirmPassword] = useState(true);
  const [previewImageURL, setpreViewImageURL] = useState();
  const [isOpenImage, setIsOpenImage] = useState();
  const [form, setForm] = useState({
    gender: '',
    price: '',
    positionId: '',
    provinceId: '',
    districtId: '',
    hospitalId: '',
    wardId: '',
    provinceName: '',
    districtName: '',
    wardName: '',
    image: '',
  });

  const provinceData = useSelector((state) => state.location.provinceData);
  const hospitalData = useSelector((state) => state.hospital.hospitalData);
  const districtData = useSelector((state) => state.location.districtData);
  const wardData = useSelector((state) => state.location.wardData);

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
    console.log('check huyen: ', districtName);
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

  const handleSubmitEditDoctor = methods.handleSubmit(async (formData) => {
    const data = { ...formData, ...form };
    console.log('check form data', data);

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
    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      image: form.image || docter.image,
      gender: form.gender,
      price: form.price,
      hospitalId: form.hospitalId,
      // Address fields at the top level as expected by backend
      provinceId: form.provinceId,
      provinceName: form.provinceName,
      districtId: form.districtId,
      districtName: form.districtName,
      wardId: form.wardId,
      wardName: form.wardName,
    };
    try {
      const response = await dispatch(
        fetchUpdateDoctor({
          doctorId: docter._id,
          formData: payload,
        }),
      );

      console.log('API Response:', response);

      // Nếu không có lỗi được throw, coi như thành công
      toast.success('Cập nhật thành công');
      handleGetAllDocter();
      setShowModalEdit(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
    }
  });

  useEffect(() => {
    if (docter) {
      methods.reset({
        fullName: docter.fullName || '',
        phoneNumber: docter.phoneNumber || '',
        email: docter.email || '',
      });

      setForm({
        provinceId: docter.address?.[0]?.provinceId || '',
        districtId: docter.address?.[0]?.districtId || '',
        wardId: docter.address?.[0]?.wardId || '',
        provinceName: docter.address?.[0]?.provinceName || '',
        districtName: docter.address?.[0]?.districtName || '',
        wardName: docter.address?.[0]?.wardName || '',
        image: docter.image || '',
        gender: docter.gender || '',
        price: docter.price || '',
        hospitalId: docter.hospitalId || '',
        positionId: docter.positionId || '',
      });

      if (docter.image) {
        setpreViewImageURL(docter.image);
      }
      if (docter.address?.[0]?.provinceId) {
        dispatch(fetchDistrictsByProvince(docter.address[0].provinceId));
      }
      if (docter.address?.[0]?.districtId) {
        dispatch(fetchWardsByDistricts(docter.address[0].districtId));
      }
    }
  }, [docter, methods]);

  useEffect(() => {
    dispatch(fetchAllProvinces());
    dispatch(fetchAllHospital());
  }, [dispatch]);

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalEdit(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Chỉnh sửa bác sĩ</h5>
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
                      id="hospital"
                      name="hospitalId"
                      value={form.hospitalId}
                      onChange={handleOnchange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option selected disabled value="">
                        ---Bệnh viện---
                      </option>
                      {hospitalData?.data.map((item, index) => {
                        return (
                          <option key={index} name="hospitalId" value={item._id}>
                            {item.fullName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="gender"
                      onChange={handleOnchange}
                      value={form.gender}
                      name="gender"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="province"
                      onChange={handleOnchange}
                      value={form.positionId}
                      name="positionId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="price"
                      onChange={handleOnchange}
                      value={form.price}
                      name="price"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                          <option name="provinceId" value={item.id}>
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
                          <option name="districtId" value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="province"
                      onChange={handleOnchange}
                      name="wardId"
                      value={form.wardId}
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
              <button className={cx('deleteBtn')} onClick={handleSubmitEditDoctor}>
                Update Doctor
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
