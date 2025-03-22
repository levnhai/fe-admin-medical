import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { useDispatch, useSelector } from 'react-redux';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { BiLoaderAlt } from 'react-icons/bi';

import LoadingSkeleton from '../loading/loading_skeleton';
import Header from '../../components/Header';
import EditCoop from './modal/editCoop';
import { fetchAllContacts, fetchDeleteContact } from '~/redux/contact/contactSlice';
import Modal from '~/components/Modal';
import Button from '~/components/Button';

const ContactCooperate = () => {
  const dispatch = useDispatch();

  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editContact, setEditContact] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from Redux store
  const contacts = useSelector((state) => state.contact.contactData) || [];
  const isLoading = useSelector((state) => state.contact.loading);

  // Remove accents for better search functionality
  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Filter users based on search term
  const filteredUsers = contacts.filter((user) => {
    if (!searchTerm) return true;

    const searchValue = removeAccents(searchTerm.toLowerCase().trim());
    const fullName = removeAccents(user?.fullName?.toLowerCase() || '');
    const phoneNumber = removeAccents(user?.phoneNumber?.toLowerCase() || '');

    return fullName.includes(searchValue) || phoneNumber.includes(searchValue);
  });

  // Check if all users are selected
  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedUsers.includes(user._id));

  // Fetch contacts data
  const fetchContactData = async () => {
    try {
      await dispatch(fetchAllContacts()).unwrap();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Không thể tải dữ liệu liên hệ. Vui lòng thử lại sau.');
    }
  };

  // Handle functions
  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? filteredUsers.map((user) => user._id) : []);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleConfirmDelete = (id) => {
    setSelectedUserId(id);
    setShowModalDelete(true);
  };

  const handleDeleteContact = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await dispatch(fetchDeleteContact(selectedUserId));
        const userDelete = unwrapResult(res);
        setShowModalDelete(false);
        if (userDelete?.status) {
          toast.success(userDelete?.message);
          fetchContactData();
        } else {
          toast.warning(userDelete?.message);
        }
          setIsSubmitting(false);
  };

  const handleEditContact = (id) => {
    const contactToEdit = contacts.find((contact) => contact._id === id);
    if (contactToEdit) {
      setEditContact(contactToEdit);
      setShowModalEdit(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedUsers([]);
  };

  // Initial data fetch
  useEffect(() => {
    fetchContactData();
  }, [dispatch]);

  // Render empty state if no contacts
  const renderEmptyState = () => (
    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
      Hiện tại không có dữ liệu nào
    </div>
  );

  // Render table rows
  const renderTableRows = () => {
    if (isLoading) return <LoadingSkeleton />;
    
    if (filteredUsers.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
              Không tìm thấy kết quả phù hợp
            </td>
          </tr>
        </tbody>
      );
    }
    
    return (
      <tbody>
        {filteredUsers.map((item) => {
          let image = item.image
            ? Buffer.from(item.image, 'base64').toString('binary')
            : require('../../assets/images/empty.png');

          return (
            <tr
              key={item._id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="w-4 p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedUsers.includes(item._id)}
                  onChange={() => handleSelectUser(item._id)}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full bg-contain bg-no-repeat"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <div className="pl-3">
                    <div className="text-base font-semibold">{item.fullName}</div>
                    <div className="font-normal text-gray-500">{item.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{item.phoneNumber}</td>
              <td className="px-6 py-4">{item.note}</td>
              <td className="px-6 py-4">{item.status}</td>
              <td className="px-6 py-4">{item.createdAt}</td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditContact(item._id)}
                  >
                    <CiEdit size={20} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleConfirmDelete(item._id)}
                  >
                    <AiOutlineDelete size={20} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Header title="Quản lý yêu cầu hợp tác" subtitle="Hợp tác với chúng tôi" />

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        {/* Table header with actions and search */}
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div>
            <button
              id="dropdownActionButton"
              className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              type="button"
            >
              Action
              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        {contacts.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            {/* Table Header */}
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone number
                </th>
                <th scope="col" className="px-6 py-3">
                  Note
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  CreatedAt
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            {renderTableRows()}
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa liên hệ">
        <div>
          <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa liên hệ này không?</p>
          <div className="flex justify-end border-t py-2 pr-6 gap-4">
            <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
              Đóng
            </Button>
            <Button className="bg-red-400 text-white" onClick={handleDeleteContact}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
              <div className="flex items-center justify-center">
                <BiLoaderAlt className="animate-spin mr-2" />
                Đang xử lý...
              </div>
            ) : (
              'Đồng ý'
            )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Contact Modal */}
      {showModalEdit && (
        <EditCoop
          setShowModalEdit={setShowModalEdit}
          handleGetAllContact={fetchContactData}
          contact={editContact}
        />
      )}
    </div>
  );
};

export default ContactCooperate;