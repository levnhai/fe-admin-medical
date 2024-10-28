import React, { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

// import userServise from '~/services/userServices';
import className from 'classnames/bind';
import styles from './Modal.module.scss';
import { Input } from '~/components/input/input';
import { password_validation, name_validation, phone_validation } from '~/utils/inputValidations';

const cx = className.bind(styles);

function CreateUser({ setShowModalCreate, getAllUser }) {
  const methods = useForm();

  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

  const handleShowHidePassword = () => {
    setShowHidePassword(!showHidePassword);
  };

  const handleShowHideReEnterPassword = () => {
    setConfirmPassword(!confirmPassword);
  };

  const handleSubmitCreateUser = methods.handleSubmit(async (formData) => {
    try {
      // let data = await userServise.handleCreateUser(formData);
      // if (data.errCode === 0 && data.userData) {
      //   getAllUser();
      //   setShowModalCreate(false);
      //   toast.success(`${data.messageError}`);
      // } else {
      //   toast.error(data.messageError);
      // }
    } catch (error) {
      toast.error(error);
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
                <div className={cx('input--item')}>
                  <Input {...phone_validation} />
                </div>
                <div className={cx('input--item')}>
                  <Input {...name_validation} />
                </div>
                <div className={cx('input--item')}>
                  <Input type={showHidePassword ? 'password' : ' text'} {...password_validation} />
                  <span
                    onClick={handleShowHidePassword}
                    style={{ position: 'absolute', right: '14px', top: '53%', fontSize: '20px', cursor: 'pointer' }}
                  >
                    {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
                <div className={cx('input--item')}>
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
                    style={{ position: 'absolute', right: '14px', top: '53%', fontSize: '20px', cursor: 'pointer' }}
                  >
                    {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
                <div className={cx('input--item')}>
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
