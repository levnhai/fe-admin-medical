import React, { useState } from 'react';
import className from 'classnames/bind';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

//icon
import { RiCloseLine } from 'react-icons/ri';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { Input } from '~/components/input/input';
import { fetchCreateUser } from '~/redux/user/userSlice';
import { password_validation, name_validation, phone_validation } from '~/utils/inputValidations';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function CreateUser({ setShowModalCreate, handleGetAllUser }) {
  const methods = useForm();
  const dispatch = useDispatch();
  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

  const handleShowHidePassword = () => {
    setShowHidePassword(!showHidePassword);
  };

  const handleShowHideReEnterPassword = () => {
    setConfirmPassword(!confirmPassword);
  };

  const handleSubmitCreateUser = methods.handleSubmit(async (formData) => {
    // Validate passwords match
    if (formData.password !== formData.reEnterPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const response = await dispatch(fetchCreateUser(formData)).unwrap();
      if (response) {
        console.log('tao là hải kê');
        toast.success('User created successfully!');
        handleGetAllUser();
        setShowModalCreate(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Số điện thoại đã tồn tại' || 'Không thể tạo người dùng';
      toast.error(errorMessage);
    }
  });

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalCreate(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Create New User</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalCreate(false)}>
            <RiCloseLine style={{ marginBottom: '-3px' }} />
          </button>
          <div className={cx('modalContent')}>
            <div className={cx('wrapper--input')}>
              <FormProvider {...methods}>
                <div className={cx('input--item-create')}>
                  <Input {...phone_validation} />
                </div>
                <div className={cx('input--item-create')}>
                  <Input {...name_validation} />
                </div>
                <div className={cx('input--item-create')}>
                  <Input type={showHidePassword ? 'password' : 'text'} {...password_validation} />
                  <span
                    onClick={handleShowHidePassword}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-300%)',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
                <div className={cx('input--item-create')}>
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
                    onClick={handleShowHideReEnterPassword}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '53%',
                      transform: 'translateY(-10%)',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
                <div className={cx('input--item-create')}>
                  <Input
                    label=""
                    type="text"
                    id="referralCode"
                    placeholder="Please enter your referralCode..."
                    name="referralCode"
                  />
                </div>
              </FormProvider>
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
              <button className={cx('deleteBtn')} onClick={handleSubmitCreateUser}>
                Create User
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

export default CreateUser;
