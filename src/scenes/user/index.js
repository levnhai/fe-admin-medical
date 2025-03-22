import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm } from 'react-hook-form';
import classNames from 'classnames/bind';

//icon
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

//import { tokens } from '../../theme';
import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import Modal from '~/components/Modal';
import Button from '~/components/Button';

import { fetchAllUsers, fetchDeleteUser, fetchEditUser } from '~/redux/user/userSlice';
import CreateUser from './modal/createUser';
import EditUser from './modal/editUser';
import { removeAccents } from '~/utils/string';

import styles from './user.module.scss';
const cx = classNames.bind(styles);

const User = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

  console.log('edi user data', editUser);

  //const [createUser, setCreateUser] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  const reduxLoading = useSelector((state) => state.appointment.loading);

  const isLoading = localLoading || reduxLoading;

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers =
    userData?.filter((user) => {
      if (!searchTerm) return true;
      const searchValue = removeAccents(searchTerm.toLowerCase().trim());
      const fullName = removeAccents(user.fullName?.toLowerCase() || '');
      const phoneNumber = removeAccents(user.accountId?.phoneNumber?.toLowerCase() || '');
      return fullName.includes(searchValue) || phoneNumber.includes(searchValue);
    }) || [];

  // chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allUserIds = filteredUsers.map((user) => user._id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle individual checkbox
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Check if all filtered users are selected
  const isAllSelected = filteredUsers?.length > 0 && filteredUsers.every((user) => selectedUsers.includes(user._id));

  // const handleEditUser = (userId) => {
  //   const userToEdit = userData?.find((user) => user._id === userId);
  //   if (userToEdit) {
  //     setEditUser(userToEdit);
  //     setShowModalEdit(true);
  //   }
  // };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset selected users when search term changes
    setSelectedUsers([]);
  };

  const fetchPatientData = async () => {
    try {
      const res = await dispatch(fetchAllUsers());
      const result = unwrapResult(res);
      setUserData(result?.user);
    } catch (error) {
      toast.error('Không thể tải dữ liệu người dùng');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const res = await dispatch(fetchDeleteUser(selectedUserId));
    const userDelete = unwrapResult(res);
    setShowModalDelete(false);
    if (userDelete?.status) {
      toast.success(userDelete?.message);
      fetchPatientData();
    } else {
      toast.warning(userDelete?.message);
    }
  };

  const handleEditUser = async (userData) => {
    try {
      console.log('check data hai le', userData);
      const res = await dispatch(
        fetchEditUser({
          userId: editUser?._id,
          userData,
        }),
      ).unwrap();
      if (res?.status) {
        console.log('hải dz');
        setShowModalEdit(false);
        toast.success(res?.message);
        fetchPatientData();
      } else {
        setShowModalEdit(true);

        toast.warning(res?.message);
      }
      console.log('check result', res);
    } catch (error) {}
  };

  useEffect(() => {
    setLocalLoading(true);
    fetchPatientData();
  }, []);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Header title="Quản lý người dùng" subtitle="Khách hàng tin tưởng, tôi cho bạn sức khỏe" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          type="button"
          className="w-full sm:w-auto text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          onClick={() => setShowModalCreate(true)}
        >
          Thêm người dùng
        </button>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
          <div>
            <button
              id="dropdownActionButton"
              data-dropdown-toggle="dropdownAction"
              className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              type="button"
            >
              <span className="sr-only">Action button</span>
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
            <div
              id="dropdownActionButton"
              className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
                <li>
                  <a
                    href="/#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Reward
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Promote
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Activate account
                  </a>
                </li>
              </ul>
              <div className="py-1">
                <a
                  href="/#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                  Delete User
                </a>
              </div>
            </div>
          </div>
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="w-full sm:w-auto relative">
              <input
                type="text"
                className="w-full sm:w-80 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Tìm kiếm người dùng..."
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
        </div>
        <div
          className="overflow-x-auto relative shadow-md"
          style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0' }}
        >
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input
                      id="checkbox-all-search"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="checkbox-all-search" className="sr-only">
                      checkbox
                    </label>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">
                  Họ và tên
                </th>
                <th scope="col" className="px-6 py-3">
                  Số điện thoại
                </th>
                <th scope="col" className="px-6 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3">
                  Hành động
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <LoadingSkeleton columns={5} />
            ) : (
              <tbody>
                {userData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      Hiện tại không có dữ liệu nào
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 && searchTerm !== '' ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      Không tìm thấy người dùng nào phù hợp với từ khóa "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item, index) => {
                    return (
                      <tr
                        key={item._id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              id="checkbox-table-search-1"
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              checked={selectedUsers.includes(item._id)}
                              onChange={() => handleSelectUser(item._id)}
                            />
                            <label htmlFor="checkbox-table-search-1" className="sr-only">
                              checkbox
                            </label>
                          </div>
                        </td>
                        <th
                          scope="row"
                          className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          <img
                            className="w-10 h-10 rounded-full"
                            src={require('~/assets/images/empty.png')}
                            alt="Jese anh"
                          />
                          <div className="ps-3">
                            <div className="text-base font-semibold">{item.fullName}</div>
                            <div className="font-normal text-gray-500">{item?.email}</div>
                          </div>
                        </th>
                        <td className="px-6 py-4">{item?.accountId?.phoneNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href="/#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                            {item.createdAt}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                reset();
                                setEditUser(item);
                                setShowModalEdit(true);
                              }}
                            >
                              <CiEdit size={20} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setShowModalDelete(true);
                                setSelectedUserId(item?._id);
                              }}
                            >
                              <AiOutlineDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa bệnh nhân">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa bệnh nhân này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 text-white" onClick={handleDeleteUser}>
                Đồng ý
              </Button>
            </div>
          </div>
        </Modal>

        {/* modal edit \ */}
        <Modal isOpen={showModalEdit} onClose={() => setShowModalEdit(false)} title="Sửa thông tin bệnh nhân">
          <div>
            <div className="max-h-80 overflow-auto">
              <form onSubmit={handleSubmit(handleEditUser)}>
                <div className="my-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8 mt-4">
                    <div className="col-span-2">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Mã bệnh nhân</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="userId"
                          id="userId"
                          disabled
                          value={editUser?._id}
                          className={cx('customInput', 'text-black')}
                          placeholder="Mã bệnh nhân ..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8 mt-4">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Họ và tên (Có dấu)</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          defaultValue={editUser?.fullName}
                          className={cx('customInput', 'text-black')}
                          placeholder="Họ và tên ..."
                          {...register('fullName', { required: 'Vui lòng nhập họ và tên!' })}
                        />

                        {errors.fullName && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.fullName.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Địa chỉ email</h2>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="email"
                          id="email"
                          className={cx('customInput', 'text-black')}
                          placeholder="Email ..."
                          {...register('email', {
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Email không hợp lệ!',
                            },
                          })}
                        />

                        {errors.email && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.email.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 px-8 mt-4">
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Mật khẩu</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="relative mt-2">
                        <input
                          type={showHidePassword ? 'password' : 'text'}
                          name="password"
                          id="password"
                          className={cx('customInput', 'text-black')}
                          placeholder="Nhập mật khẩu..."
                          {...register('password', {
                            required: 'Vui lòng nhập mật khẩu',
                            minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                          })}
                        />

                        <span
                          onMouseDown={() => setShowHidePassword(!showHidePassword)}
                          onMouseUp={() => setShowHidePassword(true)}
                          onMouseLeave={() => setShowHidePassword(true)}
                          className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 text-black"
                        >
                          {showHidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>

                        {errors.password && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.password.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex">
                        <h2 className="font-semibold text-black">Nhập lại mật khẩu</h2>
                        <span className="text-rose-600 font-bold">*</span>
                      </div>
                      <div className="relative mt-2">
                        <input
                          type={confirmPassword ? 'password' : 'text'}
                          name="reEnterPassword"
                          id="reEnterPassword"
                          className={cx('customInput', 'text-black')}
                          placeholder="xác thực mật khẩu ..."
                          {...register('reEnterPassword', {
                            required: 'Vui lòng nhập lại mật khẩu',
                            minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                          })}
                        />
                        <span
                          onMouseDown={() => setConfirmPassword(!confirmPassword)}
                          onMouseUp={() => setConfirmPassword(true)}
                          onMouseLeave={() => setConfirmPassword(true)}
                          className="absolute cursor-pointer text-xl top-1/2 right-3 transform -translate-y-1/2 text-black"
                        >
                          {confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>

                        {errors.reEnterPassword && (
                          <div>
                            <span className="text-danger text-red-500 text-sm">{errors.reEnterPassword.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={cx('customFont')}>
                    Bằng việc đăng ký, bạn đã đồng ý với <b>Medical</b> về
                    <br />
                    <a href="#/" target="_blank" rel="noreferrer">
                      Quy định sử dụng
                    </a>
                    &nbsp; và &nbsp;
                    <a href="#/" target="_blank" rel="noreferrer">
                      chính sách bảo mật
                    </a>
                  </p>
                </div>
              </form>
            </div>
            <div className="flex justify-end border-t py-2 pr-6 gap-4 pt-2">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalEdit(false)}>
                Đóng
              </Button>
              <Button
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-7 py-2.5 text-center me-2 mb-2"
                onClick={() => handleSubmit(handleEditUser)()}
              >
                Sửa hồ sơ
              </Button>
            </div>
          </div>
        </Modal>
        <div>
          {/* {showModalDelete && (
            <DeleteUser
              setShowModalDelete={setShowModalDelete}
              handleGetAllUser={() => dispatch(fetchAllUsers())}
              deleteUserId={deleteUserId}
            />
          )} */}
          {showModalCreate && (
            <CreateUser setShowModalCreate={setShowModalCreate} handleGetAllUser={fetchPatientData} />
          )}
          {/* {showModalEdit && (
            <EditUser
              setShowModalEdit={setShowModalEdit}
              handleGetAllUser={fetchPatientData}
              user={editUser}
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default User;
