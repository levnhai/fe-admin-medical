import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { BiLoaderAlt } from 'react-icons/bi';
import Select from 'react-select';

import Modal from '~/components/Modal';
import Button from '~/components/Button';
import { Input } from '~/components/input/input';
import { name_validation, phone_validation, email_validation } from '~/utils/inputValidations';
import { fetchUpdateContact } from '~/redux/contact/contactSlice';

import classNames from 'classnames/bind';
import styles from './Modal.module.scss';
const cx = classNames.bind(styles);

function EditCoop({ setShowModalEdit, handleGetAllContact, contact }) {
  const methods = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      note: '',
    },
  });
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    status: '',
  });

  const statusOptions = [
    { value: 'Đang chờ', label: 'Đang chờ' },
    { value: 'Thành công', label: 'Thành công' },
    { value: 'Thất bại', label: 'Thất bại' },
  ];

  const handleSubmitEditContact = methods.handleSubmit(async (formData) => {
    if (isSubmitting) return;
    if (!contact?._id) {
      toast.error('Contact ID is missing');
      return;
    }

    setIsSubmitting(true);
    // Combine form data from react-hook-form and local state
    const data = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      note: formData.note,
      status: form.status,
      updatedAt: new Date().toISOString(),
    };

    try {
      const resultAction = await dispatch(
        fetchUpdateContact({
          id: contact._id,
          data,
        }),
      );
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
    } finally {
      setIsSubmitting(false);
    }
  });

  useEffect(() => {
    if (contact) {
      methods.reset({
        fullName: contact.fullName || '',
        phoneNumber: contact.phoneNumber || '',
        email: contact.email || '',
        note: contact.note || '',
      });

      setForm({
        status: contact.status || '',
      });
    }
  }, [contact, methods]);

  // Custom styles to ensure black text in all inputs
  const formStyles = `
    .form-input, .form-textarea, .form-select, input, textarea, select {
      color: black !important;
    }
    .css-1dimb5e-singleValue, .css-qc6sy-singleValue {
      color: black !important;
    }
  `;

  return (
    <Modal isOpen={true} onClose={() => setShowModalEdit(false)} title="Sửa thông tin người liên hệ">
      <style>{formStyles}</style>
      <div>
        <div className="max-h-80 overflow-auto">
          <FormProvider {...methods}>
            <div className="my-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8">
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Họ và tên (Có dấu)</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2">
                    <Input {...name_validation} className="text-black" />
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Địa chỉ email</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2">
                    <Input {...email_validation} className="text-black" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 px-8">
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Số điện thoại</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="-mt-5">
                    <Input {...phone_validation} className="text-black" />
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Trạng thái</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2">
                    <Controller
                      name="status"
                      control={methods.control}
                      render={({ field }) => (
                        <Select
                          value={statusOptions.find(option => option.value === form.status) || null}
                          onChange={(selectedOption) => 
                            setForm((prev) => ({
                              ...prev,
                              status: selectedOption.value,
                            }))
                          }
                          options={statusOptions}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: state.isFocused ? '#999' : '#999',
                              height: '48px',
                              boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : '',
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected ? '#007bff' : isFocused ? '#e6f7ff' : 'white',
                              color: 'black',
                              padding: '10px',
                              cursor: 'pointer',
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: 'black',
                            }),
                            input: (base) => ({
                              ...base,
                              color: 'black',
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: '#6B7280',
                            }),
                          }}
                          placeholder="Trạng thái ..."
                          className="text-black"
                          classNamePrefix="text-black"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-10 mt-4 px-8">
                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Ghi chú</h2>
                  </div>
                  <div className="mt-2">
                    <textarea
                      name="note"
                      className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="Ghi chú..."
                      {...methods.register("note")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormProvider>
        </div>
        <div className="flex justify-end border-t py-2 pr-6 gap-4 pt-2">
          <Button className="text-[#2c3e50]" onClick={() => setShowModalEdit(false)}>
            Đóng
          </Button>
          <Button
            className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
            onClick={handleSubmitEditContact}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <BiLoaderAlt className="animate-spin mr-2" />
                Đang xử lý...
              </div>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default EditCoop;