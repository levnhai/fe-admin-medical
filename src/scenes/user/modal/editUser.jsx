import React, { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { fetchEditUser, fetchCheckPhone } from '~/redux/user/userSlice';
import { regexPhoneNumber } from '~/utils/common';
import className from 'classnames/bind';
import styles from './Modal.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = className.bind(styles);

function EditUser({ setShowModalEdit, handleGetAllUser, user }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    id: user._id || '',
    phoneNumber: user.phoneNumber || '',
    fullName: user.fullName || '',
    email: user.email || '',
    referralCode: user.referralCode || '',
  });

  const [messagesError, setMessageError] = useState({
    phoneNumber: '',
    fullName: '',
    email: ''
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message when user starts typing
    setMessageError(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate phone number
    if (formData.phoneNumber.trim() === '') {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!regexPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Vui lòng nhập đúng định dạng số điện thoại';
      isValid = false;
    }

    // Validate full name
    if (formData.fullName.trim() === '') {
      newErrors.fullName = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    // Validate email
    if (formData.email.trim() !== '' && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Vui lòng nhập đúng định dạng email';
      isValid = false;
    }

    setMessageError(newErrors);
    return isValid;
  };

  const handleSubmitEditUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await dispatch(fetchEditUser({
        userId: formData.id,
        userData: formData
      })).unwrap();
    
      toast.success('Cập nhật thông tin thành công');
      handleGetAllUser();
      setShowModalEdit(false);
    } catch (error) {
      // Log ra để debug
      console.log('Error object:', error);
      
      // Lấy message từ error.result hoặc error
      const errorMessage = error?.result?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
      
      if (errorMessage === 'Email đã tồn tại') {
        setMessageError(prev => ({
          ...prev,
          email: 'Email đã tồn tại trong hệ thống'
        }));
      } else if (errorMessage === 'Số điện thoại đã tồn tại') {
        setMessageError(prev => ({
          ...prev,
          phoneNumber: 'Số điện thoại đã tồn tại trong hệ thống' 
        }));
      } else {
        toast.error(errorMessage);
      }
    }
};

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalEdit(false)} />
      <ToastContainer />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Edit User</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalEdit(false)}>
            <RiCloseLine style={{ marginBottom: '-3px' }} />
          </button>
          <div className={cx('modalContent')}>
            <div className={cx('wrapper--input')}>
              <div className={cx('input--item')}>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  className={cx('customInput')}
                  onChange={handleOnchange}
                  disabled
                />
                <small className={cx('text--danger')}>{messagesError.id}</small>
              </div>
              <div className={cx('input--item')}>
                <input
                  type="text"
                  placeholder="Nhập Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  className={cx('customInput')}
                  onChange={handleOnchange}
                />
                <small className={cx('text--danger')}>{messagesError.phoneNumber}</small>
              </div>
              <div className={cx('input--item')}>
                <input
                  type="text"
                  placeholder="Nhập họ tên"
                  name="fullName"
                  className={cx('customInput')}
                  value={formData.fullName}
                  onChange={handleOnchange}
                />
                <small className={cx('text--danger')}>{messagesError.fullName}</small>
              </div>
              <div className={cx('input--item')}>
                <input
                  type="text"
                  placeholder="Nhập email"
                  name="email"
                  className={cx('customInput')}
                  value={formData.email}
                  onChange={handleOnchange}
                />
                <small className={cx('text--danger')}>{messagesError.email}</small>
              </div>
              <div className={cx('input--item')}>
                <input
                  type="text"
                  placeholder="Nhập mã giới thiệu (Nếu có)"
                  className={cx('customInput')}
                  name="referralCode"
                  onChange={handleOnchange}
                />
              </div>
              <p className={cx('customFont')}>
                Bằng việc đăng ký, bạn đã đồng ý với Medpro về
                <br />
                <a href="https://medpro.vn/quy-dinh-su-dung" target="_blank" rel="noreferrer">
                  Quy định sử dụng
                </a>
                &nbsp; và &nbsp;
                <a href="https://medpro.vn/chinh-sach-bao-mat" target="_blank" rel="noreferrer">
                  chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
          <div className={cx('modalActions')}>
            <div className={cx('actionsContainer')}>
              <button className={cx('deleteBtn')} onClick={handleSubmitEditUser}>
                Edit User
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

export default EditUser;
