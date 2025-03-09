import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import Lightbox from 'react-image-lightbox';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';

import MDEditor, { selectWord } from '@uiw/react-md-editor';
// No import is required in the WebPack.
import '@uiw/react-md-editor/markdown-editor.css';
// No import is required in the WebPack.
import '@uiw/react-markdown-preview/markdown.css';

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
import { fetchCreateHospital } from '~/redux/hospital/hospitalSlice';
import { ConvertBase64 } from '~/utils/common';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function CreateDocter({ setShowModalCreate, handleGetAllDocter }) {
  const methods = useForm();
  const mdParser = new MarkdownIt();

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
    contentHTML: '',
    contentMarkdown: '',
    image: '',
  });

  useEffect(() => {
    console.log('📦 Form state updated:', form);
  }, [form]);

  const provinceData = useSelector((state) => state.location.provinceData);
  const districtData = useSelector((state) => state.location.districtData);
  const wardData = useSelector((state) => state.location.wardData);
  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

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

  const [value, setValue] = React.useState('dsfs');

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

  const handleShowHidePassword = () => {
    setShowHidePassword(!showHidePassword);
  };

  // onClick
  const handleEditorChange = ({ html, text }) => {
    console.log('hai le');
    console.log('hai le htmlq', html);
    console.log('hai le q', text);
    setForm({ ...form, contentHTML: html, contentMarkdown: text });
  };

  const handleShowHideReEnterPassword = () => {
    setConfirmPassword(!confirmPassword);
  };

  const handleSubmitCreateUser = methods.handleSubmit(async (formData) => {
    const data = { ...formData, ...form };

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
          <div className={cx('body')}>
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
                      <Input type={showHidePassword ? 'password' : ' text'} {...password_validation} />
                      <span
                        onMouseDown={handleShowHidePassword}
                        onMouseUp={() => setShowHidePassword(true)}
                        onMouseLeave={() => setShowHidePassword(true)}
                        className="absolute cursor-pointer text-xl top-2/4 right-3.5"
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
                        type={confirmPassword ? 'password' : ' text'}
                        id="reEnterPassword"
                        placeholder="Please enter your reEnterPassword..."
                        name="reEnterPassword"
                      />
                      <span
                        onMouseDown={handleShowHideReEnterPassword}
                        onMouseUp={() => setConfirmPassword(true)}
                        onMouseLeave={() => setConfirmPassword(true)}
                        className="absolute cursor-pointer text-xl top-2/4 right-3.5"
                      >
                        {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="w-full md:w-1/3 mb-6 md:mb-0">
                      <select
                        id="hospitalType"
                        onChange={handleOnchange}
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
                  <div className="w-full">
                    <Input {...street_validation} />
                  </div>
                  <div>
                    <Input className="w-full" {...desc_validation} />
                  </div>
                  <div className={cx('markdown')}>
                    {/* <MdEditor
                      style={{ height: '200px' }}
                      renderHTML={(text) => mdParser.render(text)}
                      onChange={handleEditorChange}
                      value={form.contentHTML}
                    /> */}

                    {/* <MDEditor
                      height={200}
                      value={form.contentHTML}
                      onChange={(value) => setForm({ ...form, contentHTML: mdParser.render(value) })}
                    /> */}
                    <MDEditor height={200} value={form.contentHTML} onChange={setForm.contentHTML} />
                  </div>
                  <div className="mt-8">
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
      </div>
    </>
  );
}

export default CreateDocter;
