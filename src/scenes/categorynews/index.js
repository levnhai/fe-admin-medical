import { Box, ThemeProvider, createTheme } from '@mui/material';
import { useTheme, Button, ButtonGroup } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import LoadingSkeleton from '~/scenes/loading/loading_skeleton2';
import { BiLoaderAlt } from 'react-icons/bi';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import Modal from '~/components/Modal';
import { 
  fetchAllCategoryNews, 
  fetchCreateCategoryNews, 
  fetchUpdateCategoryNews, 
  fetchDeleteCategoryNews 
} from '~/redux/news/categorySlice';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

// Helper function to remove <p> tags from text
const removePTags = (text) => {
  if (!text) return '';
  return text
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '')
    .replace(/<p\s+[^>]*>/g, '');
};

const CategoryNews = () => {
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
  } = useForm();

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  const [openModal, setOpenModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusError, setStatusError] = useState('');

  const token = Cookies.get('login');
  const decodedToken = token ? jwtDecode(token) : null;
  const userRoleFromToken = decodedToken?.role || 'guest';
  const user = useSelector((state) => state.auth.user?.payload);
  const userRole = user?.role || userRoleFromToken;

  const { categories, loading, error } = useSelector((state) => state.categoryNews);
  const isLoading = useSelector((state) => state.user.loading);

  const pageTitle = "Thể loại tin tức";
  const pageSubtitle = "Quản lý thể loại tin tức cho hệ thống";

  // Define columns for the data grid
  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    {
      field: 'name',
      headerName: t('Tên thể loại'),
      flex: 1,
    },
    {
      field: 'description',
      headerName: t('Mô tả'),
      flex: 2,
      valueFormatter: (params) => {
        // Remove p tags when displaying in the grid
        return removePTags(params.value);
      },
    },
    {
      field: 'status',
      headerName: t('menu.status'),
      headerAlign: 'left',
      align: 'left',
      valueFormatter: (params) => {
        const statusMap = {
          1: 'Công khai',
          2: 'Ẩn',
        };
        return statusMap[params.value] || 'Unknown';
      },
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
                setSelectedCategoryId(params.row.id);
              }}
            >
              <DeleteIcon />
            </button>
          </div>
        );
      },
    },
  ];

  const handleDeleteCategory = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await dispatch(fetchDeleteCategoryNews(selectedCategoryId));
      const result = unwrapResult(res);
      if (result?.status) {
        toast.success(result?.message || "Xóa thể loại thành công");
        fetchCategoryData();
      } else {
        toast.success(result?.message || "Xóa thể loại thành công");
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
      setShowModalDelete(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    setStatusError('');
    reset({
      status: { value: 1, label: 'Công khai' },
    });
  };

  const handleOpenEdit = (data) => {
    const editData = {
      ...data,
      status: {
        value: data.status,
        label: data.status === 1 ? 'Công khai' : 'Ẩn'
      }
    };
  
    setSelectedData(editData);
    setModalMode('edit');
    setOpenModal(true);
    setStatusError('');
    reset(editData);
  };

  const handleClose = () => {
    setOpenModal(false);
    setStatusError('');
  };

  const submitForm = async (data) => {
    // Check if status is selected
    if (!data.status) {
      setStatusError('Vui lòng chọn trạng thái');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        status: data.status?.value || data.status,
      };
  
      if (modalMode === 'create') {
        const res = await dispatch(fetchCreateCategoryNews({ formData }));
        const result = unwrapResult(res);
        if (result?.status) {
          toast.success('Thêm thể loại thành công');
          handleClose();
          fetchCategoryData();
        } else {
          toast.warning(result?.message);
        }
      } else {
        const res = await dispatch(
          fetchUpdateCategoryNews({
            id: selectedData.id,
            formData,
          })
        );
        const result = unwrapResult(res);
        if (result?.status) {
          toast.success('Cập nhật thể loại thành công');
          handleClose();
          fetchCategoryData();
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

  const processedCategoryData = categories?.map((item) => ({
    ...item,
    id: item._id || item.id,
    description: item.description
  }));

  const fetchCategoryData = async () => {
    const res = await dispatch(fetchAllCategoryNews());
    unwrapResult(res);
  };

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchAllCategoryNews());
  }, [dispatch]);

  const statusOptions = [
    { value: 1, label: 'Công khai' },
    { value: 2, label: 'Ẩn' },
  ];

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
            Thêm thể loại
          </Button>
        </div>
        {loading || !processedCategoryData ? (
          <LoadingSkeleton columns={5} />
        ) : (
          <DataGrid 
            rows={processedCategoryData} 
            columns={columns} 
            components={{ Toolbar: GridToolbar }}
          />
        )}

        {/* Modal for Create/Edit Category */}
        <Modal 
          isOpen={openModal} 
          onClose={handleClose} 
          title={modalMode === 'create' ? 'Thêm thể loại' : 'Sửa thể loại'}
        >
          <div className="max-h-[80vh] overflow-auto">
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Tên thể loại</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2 border border-gray-300">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                      placeholder="Nhập tên thể loại..."
                      {...register('name', { required: 'Vui lòng nhập tên thể loại' })}
                    />
                  </div>
                  {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Trạng thái</h2>
                    <span className="text-rose-600 font-bold">*</span>
                  </div>
                  <div className="mt-2">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={statusOptions}
                          placeholder="Chọn trạng thái..."
                          className={statusError ? "border border-red-500 rounded" : ""}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '42px',
                              borderColor: statusError ? '#f44336' : '#d1d5db',
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
                          onChange={(option) => {
                            field.onChange(option);
                            setStatusError('');
                          }}
                        />
                      )}
                    />
                    {statusError && (
                      <p className="text-red-500 text-sm mt-1">{statusError}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex">
                    <h2 className="font-semibold text-black">Mô tả</h2>
                  </div>
                  <div className="mt-2 border border-gray-300">
                    <Controller
                      name="description"
                      control={control}
                      rules={{ required: 'Vui lòng nhập mô tả' }}
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
                              placeholder: 'Nhập mô tả thể loại...',
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
                                  '|',
                                  'indent',
                                  'outdent',
                                  '|',
                                  'undo',
                                  'redo'
                                ],
                                shouldNotGroupWhenFull: true
                              },
                              removePlugins: ['Title'],
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                  {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
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
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa thể loại">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa thể loại này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button 
                className="text-[#2c3e50] border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setShowModalDelete(false)}
              >
                Đóng
              </Button>
              <Button 
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={handleDeleteCategory}
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

export default CategoryNews;