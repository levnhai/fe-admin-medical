import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

// Icons
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { fetchCreateUser } from '~/redux/user/userSlice';
import Modal from '~/components/Modal';
import { BiLoaderAlt } from 'react-icons/bi';
import styles from './Modal.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);


function CreateUser({ setShowModalCreate, handleGetAllUser }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitForm = async (formData) => {
    if (isSubmitting) return;
    // Validate passwords match
    if (formData.password !== formData.reEnterPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await dispatch(fetchCreateUser(formData)).unwrap();
      console.log('check response', response);
      if (response?.status) {
        toast.success('Tạo người dùng thành công!');
        handleGetAllUser();
        setShowModalCreate(false);
      } else {
        toast.warning(response?.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Số điện thoại đã tồn tại' || 'Không thể tạo người dùng';
      toast.error(errorMessage);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={() => setShowModalCreate(false)} title="Thêm người dùng">
      <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
        <form onSubmit={handleSubmit(submitForm)}>
          <div>
            {/* Họ và tên */}
            <div className="col-span-1">
              <div className="flex items-center mb-1.5">
                <h2 className="font-semibold text-black text-sm">Họ và tên</h2>
                <span className="text-rose-600 font-bold ml-1">*</span>
              </div>
              <div>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  className={cx('customInput', 'text-black', 'w-full')}
                  placeholder="Họ và tên..."
                  {...register('fullName', { required: 'Vui lòng nhập họ và tên!' })}
                />
                {errors.fullName && (
                  <div className="mt-1">
                    <span className="text-danger text-red-500 text-xs">{errors.fullName.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="col-span-1">
              <div className="flex items-center mb-1.5 mt-2 mt-2">
                <h2 className="font-semibold text-black text-sm">Số điện thoại</h2>
                <span className="text-rose-600 font-bold ml-1">*</span>
              </div>
              <div>
                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  className={cx('customInput', 'text-black', 'w-full')}
                  placeholder="Số điện thoại..."
                  {...register('phoneNumber', { required: 'Vui lòng nhập số điện thoại!' })}
                />
                {errors.phoneNumber && (
                  <div className="mt-1">
                    <span className="text-danger text-red-500 text-xs">{errors.phoneNumber.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="col-span-1">
              <div className="flex items-center mb-1.5 mt-2">
                <h2 className="font-semibold text-black text-sm">Mật khẩu</h2>
                <span className="text-rose-600 font-bold ml-1">*</span>
              </div>
              <div className="relative">
                <input
                  type={showHidePassword ? 'password' : 'text'}
                  name="password"
                  id="password"
                  className={cx('customInput', 'text-black', 'w-full')}
                  placeholder="Nhập mật khẩu..."
                  {...register('password', { required: 'Vui lòng nhập mật khẩu!' })}
                />
                <span
                  onMouseDown={() => setShowHidePassword(!showHidePassword)}
                  onMouseUp={() => setShowHidePassword(true)}
                  onMouseLeave={() => setShowHidePassword(true)}
                  className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                >
                  {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </span>
                {errors.password && (
                  <div className="mt-1">
                    <span className="text-danger text-red-500 text-xs">{errors.password.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nhập lại mật khẩu */}
            <div className="col-span-1">
              <div className="flex items-center mb-1.5 mt-2">
                <h2 className="font-semibold text-black text-sm">Nhập lại mật khẩu</h2>
                <span className="text-rose-600 font-bold ml-1">*</span>
              </div>
              <div className="relative">
                <input
                  type={confirmPassword ? 'password' : 'text'}
                  name="reEnterPassword"
                  id="reEnterPassword"
                  className={cx('customInput', 'text-black', 'w-full')}
                  placeholder="Xác thực mật khẩu..."
                  {...register('reEnterPassword', { required: 'Vui lòng nhập lại mật khẩu!' })}
                />
                <span
                  onMouseDown={() => setConfirmPassword(!confirmPassword)}
                  onMouseUp={() => setConfirmPassword(true)}
                  onMouseLeave={() => setConfirmPassword(true)}
                  className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                >
                  {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </span>
                {errors.reEnterPassword && (
                  <div className="mt-1">
                    <span className="text-danger text-red-500 text-xs">{errors.reEnterPassword.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mã giới thiệu */}
            <div className="col-span-2">
              <div className="flex items-center mb-1.5 mt-2">
                <h2 className="font-semibold text-black text-sm">Mã giới thiệu</h2>
              </div>
              <div>
                <input
                  type="text"
                  name="referralCode"
                  id="referralCode"
                  className={cx('customInput', 'text-black', 'w-full')}
                  placeholder="Mã giới thiệu..."
                  {...register('referralCode')}
                />
              </div>
            </div>
          </div>

          {/* Thông tin đồng ý */}
          <div className="mt-6">
            <p className="text-xs text-gray-600">
              Bằng việc đăng ký, bạn đã đồng ý với Medpro về
              <a
                href="https://medpro.vn/quy-dinh-su-dung"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 mx-1"
              >
                Quy định sử dụng
              </a>
              và
              <a
                href="https://medpro.vn/chinh-sach-bao-mat"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 mx-1"
              >
                Chính sách bảo mật
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end border-t py-3 px-6 gap-3 mt-4">
        <button
          className="text-[#2c3e50] border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
          onClick={() => setShowModalCreate(false)}
        >
          Đóng
        </button>
        <button
          className="text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-6 py-2 text-center transition-all"
          onClick={handleSubmit(submitForm)}
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
        </button>
      </div>
    </Modal>
  );
}

export default CreateUser;
