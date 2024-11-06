import React, { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { fetchDeleteDoctor } from '~/redux/docter/docterSlice';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';

import className from 'classnames/bind';
import styles from './Modal.module.scss';

const cx = className.bind(styles);

function DeleteDocter({ setShowModalDelete, docter, handleGetAllDocter }) {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBtnDeleteDocter = async (docter) => {
    if (!docter || !docter._id) {
      toast.error('Dữ liệu bác sĩ không hợp lệ');
      return;
    }
  
    if (isDeleting) return;
    setIsDeleting(true);
  
    try {
      const resultAction = await dispatch(fetchDeleteDoctor(docter._id));
  
      if (resultAction.meta.requestStatus === 'fulfilled') {
        setShowModalDelete(false);
        toast.success('Xóa bác sĩ thành công');
        await handleGetAllDocter();
      } else {
        throw new Error(resultAction.payload?.message || 'Không thể xóa bác sĩ');
      }
    } catch (error) {
      toast.error(error.message || 'Xóa bác sĩ thất bại');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalDelete(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Delete Doctor</h5>
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
                  handleBtnDeleteDocter(docter);
                }}
              >
                Delete Doctor
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

export default DeleteDocter;
