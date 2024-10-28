import React, { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
// import userServices from '~/services/userServices';
import { toast } from 'react-toastify';
import { regexPhoneNumber } from '~/utils/common';

import className from 'classnames/bind';
import styles from './Modal.module.scss';

const cx = className.bind(styles);

function EditUser({ setShowModalEdit, getAllUser, user }) {
  const [formData, setFormData] = useState({
    id: `${user._id}`,
    phoneNumber: `${user.phoneNumber}`,
    fullName: `${user.fullName}`,
    // password: `${user.password}`,
    // reEnterPassword: `${user.phoneNumber}`,
    referralCode: `${user.referralCode}`,
  });

  const [messagesError, setMessageError] = useState({
    id: '',
    phoneNumber: '',
    fullName: '',
    password: '',
    reEnterPassword: '',
  });

  const handleOnchange = (e) => {
    setMessageError({});
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // validate form input
  const validateForm = () => {
    // validate input phone number
    if (formData.phoneNumber.trim() === '') {
      setMessageError({ ...messagesError, phoneNumber: 'Vui lòng số điện thoại' });
      return false;
    }

    if (!regexPhoneNumber(formData.phoneNumber)) {
      setMessageError({ ...messagesError, phoneNumber: 'Vui lòng nhập đúng định dạng' });
      return false;
    }

    // validate input fullName
    if (formData.fullName.trim() === '') {
      setMessageError({ ...messagesError, fullName: 'Vui lòng nhập họ tên' });
      return false;
    }

    return true;
  };

  // handle onClick submit btn edit User
  const handleSubmitEditUser = async (e) => {
    // e.preventDefault();
    try {
      let isValidateForm = validateForm();

      if (isValidateForm) {
        // let data = await userServices.editUser(formData);
        // if (data.data.errCode === 0) {
        //   getAllUser();
        //   setShowModalEdit(false);
        //   toast.success(data.data.errMessage);
        // } else {
        //   toast.error(data.data.errMessage);
        // }
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalEdit(false)} />
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
