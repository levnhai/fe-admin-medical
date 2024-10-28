import React from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { fetchDeleteUser } from '~/redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';

import className from 'classnames/bind';
import styles from './Modal.module.scss';

const cx = className.bind(styles);

function DeleteUser({ setShowModalDelete, deleteUserId, handleGetAllUser }) {
  const dispatch = useDispatch();

  const handleBtnDeleteDocter = async (deleteUserId) => {
    const res = await dispatch(fetchDeleteUser(deleteUserId));
    const userDelete = unwrapResult(res);
    console.log('check docter', userDelete);
    if (userDelete?.status) {
      setShowModalDelete(false);
      handleGetAllUser();
      toast.success(userDelete?.message);
    } else {
      toast.warning(userDelete?.message);
    }
  };
  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalDelete(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Delete User</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalDelete(false)}>
            <RiCloseLine style={{ marginBottom: '-3px' }} />
          </button>
          <div className={cx('modalContent')}>
            <h3>Bạn thực sự muốn xóa nó không</h3>
          </div>
          <div className={cx('modalActions')}>
            <div className={cx('actionsContainer')}>
              <button
                className={cx('deleteBtn')}
                onClick={() => {
                  handleBtnDeleteDocter(deleteUserId);
                }}
              >
                Delete User
              </button>
              <button className={cx('cancelBtn')} onClick={() => setShowModalDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteUser;
