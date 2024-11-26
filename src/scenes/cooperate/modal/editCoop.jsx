import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import 'react-image-lightbox/style.css';

// icon
import { RiCloseLine } from 'react-icons/ri';

import { Input } from '~/components/input/input';
import { name_validation, phone_validation, email_validation} from '~/utils/inputValidations';

import { fetchUpdateContact  } from '~/redux/contact/contactSlice';

import styles from './Modal.module.scss';
const cx = className.bind(styles);

function EditCoop({ setShowModalEdit, handleGetAllContact, contact }) {
  console.log(' data:', contact);
  const methods = useForm({
    defaultValues: {
        fullName: '',
        phoneNumber: '',
        email: '',
        note: ''
    }
  });
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    status: '',
  });
  // const handleOnchange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };


  
  const handleSubmitEditContact = methods.handleSubmit(async (formData) => {
    if (!contact?._id) {
      toast.error('Contact ID is missing');
      return;
    }
  
    // Combine form data from react-hook-form and local state
    const data = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      note: formData.note,
      status: form.status,
      updatedAt: new Date().toISOString() // Add updatedAt field
    };
  
    try {
      const resultAction = await dispatch(fetchUpdateContact({ 
        id: contact._id, 
        data // Changed from formData to data to match the API expectation
      }));
      const response = unwrapResult(resultAction);
      
      if (response.success) {
        toast.success('Cập nhật thành công');
        handleGetAllContact();
        setShowModalEdit(false);
      } else {
        toast.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
    }
  });
  
  useEffect(() => {
    if (contact) {
      methods.reset({
        fullName: contact.fullName || '',
        phoneNumber: contact.phoneNumber || '',
        email: contact.email || '',
        note: contact.note || ''
      });

      setForm({
        status: contact.status || '',
      });
    }
  }, [contact, methods]);

  return (
    <>
      <div className={cx('darkBG')} onClick={() => setShowModalEdit(false)} />
      <div className={cx('centered')}>
        <div className={cx('modal')}>
          <div className={cx('modalHeader')}>
            <h5 className={cx('heading')}>Sửa thông tin người liên hệ</h5>
          </div>
          <button className={cx('closeBtn')} onClick={() => setShowModalEdit(false)}>
            <RiCloseLine style={{ marginBottom: '-3px' }} />
          </button>
          <div className={cx('modalContent')}>
            <div className={cx('wrapper--input')}>
              <FormProvider {...methods}>
                <div class="w-full ">
                  <Input {...name_validation} />
                </div>
                
                <div class="flex gap-4">
                  <div class="w-full md:w-1/2 mb-6 md:mb-0">
                    <Input {...phone_validation} />
                  </div>
                  <div class="w-full md:w-1/2 mb-6 md:mb-0">
                    <Input {...email_validation} />
                  </div>
                </div>
                <div class="flex gap-4 mt-4">
                  <div class="w-full md:w-1/3 mb-6 md:mb-0">
                    <select
                      id="status"
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        status: e.target.value
                      }))}
                      value={form.status}
                      name="status"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option name="status" disabled value="">
                        ---- Trạng thái ---
                      </option>
                      <option name="status" value="Đang chờ">
                        Đang chờ
                      </option>
                      <option name="status" value="Thành công">
                        Thành công
                      </option>
                      <option name="status" value="Thất bại">
                        Thất bại
                      </option>
                    </select>
                  </div>
                </div>
              </FormProvider>
            </div>
          </div>
          <div className={cx('modalActions')}>
            <div className={cx('actionsContainer')}>
              <button className={cx('deleteBtn')} onClick={handleSubmitEditContact}>
                Update Contact
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

export default EditCoop;
