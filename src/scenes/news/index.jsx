import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import Select from 'react-select';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { BiLoaderAlt } from 'react-icons/bi';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import Button from '~/components/Button';
import Modal from '~/components/Modal';
import { ConvertBase64 } from '~/utils/common';
import { 
  fetchAllNews, 
  fetchCreateNews, 
  fetchUpdateNews, 
  fetchDeleteNews, 
  fetchMyNews,
  fetchHospitalAndDoctorNews 
} from '~/redux/news/newsSlice';
import { fetchAllCategoryNews } from '~/redux/news/categorySlice';
import LoadingSkeleton from '~/scenes/loading/loading_skeleton2';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const News = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const [openModal, setOpenModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImageURL, setPreviewImageURL] = useState();
  const [urlImage, setUrlImage] = useState();
  const [isOpenImage, setIsOpenImage] = useState();

  const token = Cookies.get('login');
  const decodedToken = token ? jwtDecode(token) : null;
  const userRoleFromToken = decodedToken?.role || 'guest';
  const user = useSelector((state) => state.auth.user?.payload);
  const userRole = user?.role || userRoleFromToken;
  const isDoctor = userRole === 'doctor';
  const isHospitalAdmin = userRole === 'hospital_admin';
  const { categories } = useSelector((state) => state.categoryNews);
  const { newsData, loading } = useSelector((state) => state.news);
  const isLoading = useSelector((state) => state.user.loading);

  let pageTitle = t('menu.news');
  let pageSubtitle = "Thông tin, tin tức mới nhất dành cho bạn";
  
  if (isDoctor) {
    pageTitle = "Tin tức của tôi";
    pageSubtitle = "Quản lý các tin tức bạn đã tạo";
  } else if (isHospitalAdmin) {
    pageTitle = "Tin tức bệnh viện";
    pageSubtitle = "Quản lý tin tức của bệnh viện và các bác sĩ";
  }

  const getStatusOptions = () => {
    if (isDoctor) {
      return [
        { value: 2, label: 'Nháp' },
        { value: 3, label: 'Xóa' },
      ];
    } else if (isHospitalAdmin) {
      return [
        { value: 1, label: 'Công khai' },
        { value: 2, label: 'Nháp' },
        { value: 3, label: 'Xóa' },
      ];
    } else {
      return [
        { value: 1, label: 'Công khai' },
        { value: 2, label: 'Nháp' },
        { value: 3, label: 'Xóa' },
      ];
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    { field: 'title', headerName: t('menu.title'), flex: 1 },
    { field: 'subtitle', headerName: t('menu.subtitle'), flex: 1 },
    {
      field: 'author',
      headerName: t('menu.author'),
      flex: 1,
      valueFormatter: (params) => {
        if (params.value && params.value.fullName) {
          return params.value.fullName;
        }
        return 'Unknown';
      },
    },
    {
      field: 'authorModel',
      headerName: 'Loại tác giả',
      flex: 0.5,
      valueFormatter: (params) => {
        const modelMap = {
          'Doctor': 'Bác sĩ',
          'Hospital': 'Bệnh viện',
          'Admin': 'Admin'
        };
        return params.value ? modelMap[params.value] || params.value : 'Unknown';
      },
    },
    {
      field: 'category',
      headerName: t('menu.category'),
      flex: 1,
      valueFormatter: (params) => {
        if (params.value && params.value._id) {
          const category = categories?.find((cat) => cat._id === params.value._id);
          if (category) {
            return category.name;
          }
        }
        return 'Chưa xác định';
      },
    },
    {
      field: 'status',
      headerName: t('menu.status'),
      headerAlign: 'left',
      align: 'left',
      valueFormatter: (params) => {
        const statusMap = {
          3: 'Deleted',
          1: 'Published',
          2: 'Draft',
        };
        return statusMap[params.value] || 'Unknown';
      },
    },
    {
      field: 'views',
      headerName: t('menu.views'),
      headerAlign: 'left',
      align: 'left',
    },
    { field: 'createdAt', headerName: t('menu.createdAt'), flex: 1 },
    { field: 'updatedAt', headerName: t('menu.updatedAt'), flex: 1 },
    {
      field: 'actions',
      headerName: t('menu.action'),
      width: 150,
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <button 
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleOpenEdit(params.row)}
            >
              <EditIcon />
            </button>
            <button 
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                setShowModalDelete(true);
                setSelectedUserId(params.row.id);
              }}
              disabled={isSubmitting}
            >
              <DeleteIcon />
            </button>
          </div>
        );
      },
    },
  ];

  const handleDeleteNews = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await dispatch(fetchDeleteNews(selectedUserId));
      const result = unwrapResult(res);
      if (result?.status) {
        toast.success(result?.message);
        loadNewsData();
      } else {
        toast.warning(result?.message);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi xóa tin tức");
    } finally {
      setIsSubmitting(false);
      setShowModalDelete(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    reset({
      status: isDoctor ? 2 : 1,
    });
  };

  const handleOpenEdit = (data) => {
    const editData = {
      ...data,
      category: {
        value: data.category?._id || data.category,
        label: data.category?.name || 
               (categories?.find(cat => cat._id === data.category)?.name) || 
               'Chưa xác định'
      },
      status: {
        value: data.status,
        label: data.status === 1 ? 'Công khai' :
               data.status === 2 ? 'Nháp' :
               data.status === 3 ? 'Xóa' : 'Chưa xác định'
      }
    };
  
    setSelectedData(editData);
    setModalMode('edit');
    setOpenModal(true);
    reset(editData);
    if (editData.imageUrl) {
      setPreviewImageURL(editData.imageUrl);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setPreviewImageURL(null);
  };

  const handleOnChangeImage = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setPreviewImageURL(objectURL);
    }

    const urlBase64 = await ConvertBase64(file);
    setUrlImage(urlBase64);
    setValue('imageUrl', file);
  };

  const handleOpenImage = () => {
    if (!previewImageURL) return;
    setIsOpenImage(true);
  };

  const submitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        status: data.status?.value || data.status,
        category: data.category?.value || data.category,
        imageUrl: urlImage || data.imageUrl,
      };
  
      if (modalMode === 'create') {
        const res = await dispatch(fetchCreateNews({ formData }));
        const result = unwrapResult(res);
        if (result?.status) {
          toast.success('Thêm tin tức thành công');
          handleClose();
          loadNewsData();
        } else {
          toast.warning(result?.message);
        }
      } else {
        const res = await dispatch(
          fetchUpdateNews({
            id: selectedData.id,
            formData,
          })
        );
        const result = unwrapResult(res);
        if (result?.status) {
          toast.success('Cập nhật tin tức thành công');
          handleClose();
          loadNewsData();
        } else {
          toast.warning(result?.message);
        }
      }
    } catch (error) {
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const processedNewsData = newsData?.map((item) => ({
    ...item,
    id: item._id || item.newsPost?._id || item.news?._id || item.id || item.message,
  }));

  const loadNewsData = () => {
    if (isDoctor) {
      dispatch(fetchMyNews());
    } else if (isHospitalAdmin) {
      dispatch(fetchHospitalAndDoctorNews());
    } else {
      dispatch(fetchAllNews());
    }
  };

  useEffect(() => {
    dispatch(fetchAllCategoryNews());
    loadNewsData();
  }, [dispatch, isDoctor, isHospitalAdmin]);

  const categoryOptions = categories
    ?.filter(category => category.status === 1)
    .map((category) => ({
      value: category._id,
      label: category.name,
    })) || [];

  return (
    <Box m="20px">
      <Header 
        title={pageTitle} 
        subtitle={pageSubtitle} 
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        display="flex"
        flexDirection="column"
        sx={{
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .name-column--cell': { color: colors.greenAccent[300] },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.primary[400],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[200]} !important`,
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            className="w-full sm:w-auto text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md"
          >
            Thêm tin tức
          </Button>
        </div>
        {loading || !processedNewsData ? (
          <LoadingSkeleton columns={5} />
        ) : (
          <DataGrid 
            rows={processedNewsData} 
            columns={columns} 
            components={{ Toolbar: GridToolbar }}
          />
        )}

        {/* Modal for Create/Edit News */}
        <Modal 
          isOpen={openModal} 
          onClose={handleClose} 
          title={modalMode === 'create' ? 'Thêm tin tức' : 'Sửa tin tức'}
        >
          <div className="max-h-[80vh] overflow-auto">
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Tiêu đề</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2 border border-gray-300">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    placeholder="Nhập tiêu đề..."
                    {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
                  />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Tiêu đề phụ</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2 border border-gray-300">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                      placeholder="Nhập tiêu đề phụ..."
                      {...register('subtitle')}
                    />
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
                      control={control}
                      rules={{ required: 'Vui lòng chọn trạng thái' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={getStatusOptions()}
                          placeholder="Chọn trạng thái..."
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '42px',
                              borderColor: errors.status ? '#f44336' : '#d1d5db',
                              backgroundColor: 'white',
                              color: 'black',
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: 'black',
                            }),
                            input: (base) => ({
                              ...base,
                              color: 'black',
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: 'white',
                            }),
                            option: (base) => ({
                              ...base,
                              color: 'black',
                              '&:hover': {
                                backgroundColor: '#f0f0f0',
                              },
                            }),
                          }}
                        />
                      )}
                    />
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Thể loại</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2">
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: 'Vui lòng chọn thể loại' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={categoryOptions}
                          placeholder="Chọn thể loại..."
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '42px',
                              borderColor: errors.status ? '#f44336' : '#d1d5db',
                              backgroundColor: 'white',
                              color: 'black',
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: 'black',
                            }),
                            input: (base) => ({
                              ...base,
                              color: 'black',
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: 'white',
                            }),
                            option: (base) => ({
                              ...base,
                              color: 'black',
                              '&:hover': {
                                backgroundColor: '#f0f0f0',
                              },
                            }),
                          }}
                        />
                      )}
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Tags</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2 border border-gray-300">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                      placeholder="Nhập tags (cách nhau bằng dấu phẩy)..."
                      {...register('tags')}
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Hình ảnh</h2>
                  </div>
                  <div className="mt-2">
                    <label className="block">
                      <span className="sr-only">Chọn hình ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleOnChangeImage}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </label>
                    {previewImageURL && (
                      <div className="mt-4">
                        <div
                          className="w-32 h-32 bg-cover bg-center cursor-pointer"
                          style={{ backgroundImage: `url(${previewImageURL})` }}
                          onClick={handleOpenImage}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Nội dung</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2 border border-gray-300">
                    <Controller
                      name="content"
                      control={control}
                      rules={{ required: 'Vui lòng nhập nội dung' }}
                      render={({ field }) => (
                        <div style={{color: 'black'}}>
                          <CKEditor
                            editor={ClassicEditor}
                            data={field.value || ''}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              field.onChange(data);
                            }}
                            config={{
                              placeholder: 'Nhập nội dung tin tức...',
                              toolbar: {
                                items: [
                                  'heading',
                                  '|',
                                  'bold',
                                  'italic',
                                  'underline',
                                  'strikethrough',
                                  '|',
                                  'fontSize',
                                  'fontFamily',
                                  'fontColor',
                                  'fontBackgroundColor',
                                  '|',
                                  'alignment',
                                  '|',
                                  'bulletedList',
                                  'numberedList',
                                  'todoList',
                                  '|',
                                  'indent',
                                  'outdent',
                                  '|',
                                  'link',
                                  'blockQuote',
                                  'insertTable',
                                  '|',
                                  'undo',
                                  'redo'
                                ],
                                shouldNotGroupWhenFull: true
                              },
                              table: {
                                contentToolbar: [
                                  'tableColumn',
                                  'tableRow',
                                  'mergeTableCells',
                                  'tableCellProperties',
                                  'tableProperties'
                                ]
                              },
                              removePlugins: ['Title'],
                              stylesSet: [
                                { name: 'Default Text', element: 'p', attributes: { style: 'color: yellow !important;' } }
                              ]
                            }}
                          />
                        </div>
                      )}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t py-4 px-6 gap-4">
                <Button 
                  className="text-[#2c3e50] border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                  onClick={handleClose}
                >
                  Đóng
                </Button>
                <Button
                  className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <BiLoaderAlt className="animate-spin mr-2" />
                      Đang xử lý...
                    </div>
                  ) : (
                    modalMode === 'create' ? 'Thêm mới' : 'Cập nhật'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal for Delete Confirmation */}
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa tin tức">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa tin này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button 
                className="text-[#2c3e50] border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setShowModalDelete(false)}
              >
                Đóng
              </Button>
              <Button 
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={handleDeleteNews}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <BiLoaderAlt className="animate-spin mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  "Đồng ý"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </Box>
    </Box>
  );
};

export default News;