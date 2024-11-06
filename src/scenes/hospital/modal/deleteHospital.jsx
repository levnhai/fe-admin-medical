import React ,{ useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { fetchDeleteHospital } from '~/redux/hospital/hospitalSlice';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';

import className from 'classnames/bind';
import styles from './Modal.module.scss';

const cx = className.bind(styles);

function DeleteHospital({ setShowModalDelete, hospital, handleGetAllHospital  }) {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBtnDeleteHospital = async (hospital) => {
    if (!hospital || !hospital._id) {
      toast.error('Dữ liệu bệnh viện không hợp lệ');
      return;
    }
  
    if (isDeleting) return;
    setIsDeleting(true);
  
    try {
      const resultAction = await dispatch(fetchDeleteHospital(hospital._id));
  
      if (resultAction.meta.requestStatus === 'fulfilled') {
        setShowModalDelete(false);
        toast.success('Xóa bệnh viện thành công');
        await handleGetAllHospital(); // Refresh danh sách
      } else {
        throw new Error(resultAction.payload?.message || 'Không thể xóa bệnh viện');
      }
    } catch (error) {
      toast.error(error.message || 'Xóa bệnh viện thất bại');
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
                  handleBtnDeleteHospital(hospital);
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

export default DeleteHospital;
