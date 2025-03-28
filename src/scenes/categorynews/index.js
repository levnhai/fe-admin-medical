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
import MyModal from '~/components/Modal/MyModal';
import {
  fetchAllCategoryNews,
  fetchCreateCategoryNews,
  fetchUpdateCategoryNews,
  fetchDeleteCategoryNews,
} from '~/redux/news/categorySlice';

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

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  const [openModal, setOpenModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [title, setTitle] = useState('');
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = Cookies.get('login');
  const decodedToken = token ? jwtDecode(token) : null;
  const userRoleFromToken = decodedToken?.role || 'guest';
  const user = useSelector((state) => state.auth.user?.payload);
  const userRole = user?.role || userRoleFromToken;

  const { categories, loading, error } = useSelector((state) => state.categoryNews);
  const isLoading = useSelector((state) => state.user.loading);

  const pageTitle = "Thể loại tin tức";
  const pageSubtitle = "Quản lý thể loại tin tức cho hệ thống";

  // Define fields for the category news modal
  const categoryNewsFields = [
    {
      name: 'name',
      label: 'Tên thể loại',
      type: 'text',
      grid: 6,
      required: true,
    },
    {
      name: 'description',
      label: 'Mô tả',
      type: 'textarea',
      grid: 12,
    },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'option',
      options: [
        { value: 1, label: 'Công khai' },
        { value: 2, label: 'Ẩn' },
      ],
      grid: 6,
      required: true,
    },
  ];

  // Define columns for the data grid
  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    {
      field: 'name',
      headerName: t('menu.name'),
      flex: 1,
    },
    {
      field: 'description',
      headerName: t('menu.description'),
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
          <ButtonGroup variant="contained" aria-label="Basic button group">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleOpenEdit(params.row)}
            >
              <EditIcon />
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setShowModalDelete(true);
                setSelectedCategoryId(params.row.id);
              }}
            >
              <DeleteIcon />
            </Button>
          </ButtonGroup>
        );
      },
    },
  ];

  const handleDeleteCategory = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await dispatch(fetchDeleteCategoryNews(selectedCategoryId));
    const result = unwrapResult(res);
    setShowModalDelete(false);
    if (result?.status) {
      toast.success(result?.message || "Xóa thể loại thành công");
      fetchCategoryData();
    } else {
      toast.warning(result?.message || "Xóa thể loại thất bại");
    }
      setIsSubmitting(false);
  };

  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    setTitle('Thêm thể loại');
  };

  const handleOpenEdit = (data) => {
    // Clean up the description before setting it for editing
    const cleanedData = {
      ...data,
      description: removePTags(data.description)
    };
    setSelectedData(cleanedData);
    setModalMode('edit');
    setOpenModal(true);
    setTitle('Sửa thể loại');
  };

  const handleClose = () => setOpenModal(false);

  const handleSubmit = (formData) => {
    // Clean up the description before submitting
    const cleanedFormData = {
      ...formData,
      description: removePTags(formData.description)
    };

    if (modalMode === 'create') {
      dispatch(fetchCreateCategoryNews({ formData: cleanedFormData }))
        .then((response) => {
          if (response.payload) {
            toast.success('Thêm thể loại thành công');
            handleClose();
            fetchCategoryData();
          } else {
            toast.warning('Thêm thể loại thất bại', 'error');
          }
        })
        .catch(() => {
          toast.error('Đã có lỗi xảy ra', 'error');
        });
    } else {
      dispatch(
        fetchUpdateCategoryNews({
          id: selectedData.id,
          formData: cleanedFormData,
        }),
      )
        .then((response) => {
          if (response.payload) {
            toast.success('Cập nhật thể loại thành công');
            handleClose();
            fetchCategoryData();
          } else {
            toast.warning('Cập nhật thể loại thất bại', 'error');
          }
        })
        .catch(() => {
          toast.error('Đã có lỗi xảy ra', 'error');
        });
    }
  };

  // Process data for DataGrid
  const processedCategoryData = categories?.map((item) => ({
    ...item,
    id: item._id || item.id,
    // Clean description here too for redundancy/safety
    description: item.description
  }));

  const fetchCategoryData = async () => {
    const res = await dispatch(fetchAllCategoryNews());
    const result = unwrapResult(res);
  };

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchAllCategoryNews());
  }, [dispatch]);

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
          {isLoading ? (
              <LoadingSkeleton columns={5} />
            ) : (
              <ThemeProvider theme={lightTheme}>
                <MyModal
                  open={openModal}
                  handleClose={handleClose}
                  mode={modalMode}
                  onSubmit={handleSubmit}
                  data={selectedData}
                  title={title}
                  fields={categoryNewsFields}
                />
              </ThemeProvider>
            )}
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa thể loại">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa thể loại này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 px-6 py-2 text-white" onClick={handleDeleteCategory}
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
      </Box>
    </Box>
  );
};

export default CategoryNews;