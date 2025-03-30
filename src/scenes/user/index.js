import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import { useForm } from 'react-hook-form';
import classNames from 'classnames/bind';
import { io } from 'socket.io-client';

//icon
import { CiEdit } from 'react-icons/ci';
import { BiLoaderAlt } from 'react-icons/bi';
import { AiOutlineDelete, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import Header from '../../components/Header';
import LoadingSkeleton from '../loading/loading_skeleton';
import Modal from '~/components/Modal';
import Button from '~/components/Button';

import { fetchAllUsers, fetchDeleteUser, fetchEditUser } from '~/redux/user/userSlice';
import CreateUser from './modal/createUser';
import { removeAccents } from '~/utils/string';

import styles from './user.module.scss';
const cx = classNames.bind(styles);
const socket = io(process.env.REACT_APP_BACKEND_URL);

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
  const [activeUsers, setActiveUsers] = useState([]);
  const [showHidePassword, setShowHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  const reduxLoading = useSelector((state) => state.appointment.loading);

  const isLoading = localLoading || reduxLoading;
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('userData', userData);

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers =
    userData?.filter((user) => {
      if (!searchTerm) return true;
      const searchValue = removeAccents(searchTerm.toLowerCase().trim());
      const fullName = removeAccents(user.fullName?.toLowerCase() || '');
      const phoneNumber = removeAccents(user.accountId?.phoneNumber?.toLowerCase() || '');
      return fullName.includes(searchValue) || phoneNumber.includes(searchValue);
    }) || [];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await dispatch(fetchDeleteUser(selectedUserId));
    const userDelete = unwrapResult(res);
    setShowModalDelete(false);
    if (userDelete?.status) {
      toast.success(userDelete?.message);
      fetchPatientData();
    } else {
      toast.warning(userDelete?.message);
    }
    setIsSubmitting(false);
  };

  const handleEditUser = async (userData) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await dispatch(
        fetchEditUser({
          userId: editUser?._id,
          userData,
        }),
      ).unwrap();
      if (res?.status) {
        setShowModalEdit(false);
        toast.success(res?.message);
        fetchPatientData();
      } else {
        setShowModalEdit(true);

        toast.warning(res?.message);
      }
      console.log('check result', res);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setLocalLoading(true);
    fetchPatientData();
  }, []);

  useEffect(() => {
    socket.on('update_active_users', (users) => {
      setActiveUsers(users);
    });
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
          <div></div>
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
          className="overflow-x-auto relative shadow-md max-h-[400px]"
          style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0', scrollbarWidth: 'none' }}
        >
          <table className="w-full overflow-y-auto text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs sticky top-0 text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  STT
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
                        <td className="px-6 py-4">{index + 1}</td>
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
                            {activeUsers.includes(item?._id) ? '🟢 Online' : '🔴 Offline'}
                          </div>
                        </td>
                        <td className="px-6 py-4">{item.createdAt}</td>
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
              <Button className="bg-red-400 text-white" onClick={handleDeleteUser} disabled={isSubmitting}>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <BiLoaderAlt className="animate-spin mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Sửa hồ sơ'
                )}
              </Button>
            </div>
          </div>
        </Modal>
        <div>
          {showModalCreate && (
            <CreateUser setShowModalCreate={setShowModalCreate} handleGetAllUser={fetchPatientData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
