import React ,{ useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { fetchDeleteContact } from '~/redux/contact/contactSlice';
import { useDispatch } from 'react-redux';
//import { unwrapResult } from '@reduxjs/toolkit';

import className from 'classnames/bind';
import styles from './Modal.module.scss';

const cx = className.bind(styles);

function DeleteCoop({ setShowModalDelete, contact, handleGetAllContact  }) {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBtnDeleteContact = async (contact) => {
    if (!contact || !contact._id) {
      toast.error('Dữ liệu liên hệ không hợp lệ');
      return;
    }
  
    if (isDeleting) return;
    setIsDeleting(true);
  
    try {
      const resultAction = await dispatch(fetchDeleteContact(contact._id));
  
      if (resultAction.meta.requestStatus === 'fulfilled') {
        setShowModalDelete(false);
        toast.success('Xóa liên hệ thành công');
        await handleGetAllContact();
      } else {
        throw new Error(resultAction.payload?.message || 'Không thể xóa liên hệ này');
      }
    } catch (error) {
      toast.error(error.message || 'Xóa liên hệ thất bại');
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
            <h5 className={cx('heading')}>Delete Contact</h5>
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
                  handleBtnDeleteContact(contact);
                }}
              >
                Delete Contact
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

export default DeleteCoop;
