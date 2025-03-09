import { Box } from '@mui/material';
import { useTheme, Button, ButtonGroup, Snackbar, Alert } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { fetchAllNews, fetchCreateNews, fetchUpdateNews, fetchDeleteNews } from '~/redux/news/newsSlice';
import { fetchAllCategoryNews } from '~/redux/news/categorySlice';
import MyModal from '~/components/Modal/MyModal';

const News = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState(null);

  const token = Cookies.get('login');
  const decodedToken = token ? jwtDecode(token) : null;
  const userRoleFromToken = decodedToken?.role || 'guest';
  const user = useSelector((state) => state.auth.user?.payload);
  const userRole = user?.role || userRoleFromToken;
  const isDoctor = userRole === 'docter';
  //console.log('check role nè: ', userRole);
  const userId = decodedToken?.accountId || user?.payload?.accountId;
  console.log('check id nè: ', userId);
  const { categories } = useSelector((state) => state.categoryNews);

  const newsFields = [
    { name: 'title', label: 'title', type: 'text', grid: 6 },
    { name: 'subtitle', label: 'subtitle', type: 'text', grid: 6 },
    isDoctor
      ? {
          name: 'status',
          label: 'Status',
          type: 'option',
          grid: 2,
          options: [
            { value: 2, label: 'Nháp' },
            { value: 3, label: 'Xóa' },
          ],
          required: true,
        }
      : {
          name: 'status',
          label: 'Status',
          type: 'option',
          grid: 2,
          options: [
            { value: 1, label: 'Công khai' },
            { value: 2, label: 'Nháp' },
            { value: 3, label: 'Xóa' },
          ],
          required: true,
        },
    { name: 'tags', label: 'tags', type: 'text', grid: 4 },
    {
      name: 'category',
      label: 'category',
      type: 'option',
      options:
        categories?.map((category) => ({
          value: category._id,
          label: category.name,
        })) || [],
      grid: 3,
    },
    { name: 'views', label: 'views', type: 'number', grid: 3 },
    { name: 'imageUrl', label: 'imageUrl', type: 'file', grid: 4 },
    { name: 'content', label: 'content', type: 'textarea', grid: 12 },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    { field: 'title', headerName: t('menu.title'), flex: 1 },
    { field: 'subtitle', headerName: t('menu.title'), flex: 1 },
    {
      field: 'author',
      headerName: t('menu.author'),
      valueFormatter: (params) => {
        // Check if author is an object with fullName property
        if (params.value && params.value.fullName) {
          return params.value.fullName;
        }
        return 'Unknown'; // Fallback if no name is found
      },
    },
    {
      field: 'category',
      headerName: t('menu.category'),
      flex: 1,
      valueFormatter: (params) => {
        // Kiểm tra xem params.value có chứa _id hay không
        if (params.value && params.value._id) {
          // Tìm danh mục trong categories
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
          <ButtonGroup variant="contained" aria-label="Basic button group">
            <Button variant="contained" color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon />
            </Button>
            <Button variant="contained" color="primary" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </Button>
          </ButtonGroup>
        );
        return null;
      },
    },
  ];

  // Hàm hiển thị thông báo
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Đóng thông báo
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    setTitle('Thêm tin tức');
  };

  const handleOpenEdit = (data) => {
    const editData = {
      ...data,
      category: data.category?._id || data.category,
    };

    // Log hình ảnh để kiểm tra
    console.log('Hình ảnh hiện tại:', editData.imageUrl);

    setSelectedData(editData);
    setModalMode('edit');
    setOpenModal(true);
    setTitle('Sửa tin tức');
  };
  const handleClose = () => setOpenModal(false);
  const handleSubmit = (formData) => {
    const finalFormData =
      isDoctor && modalMode === 'create'
        ? { ...formData, status: 2 }
        : isDoctor && modalMode === 'edit'
        ? {
            ...formData,
            status: [0, 2].includes(formData.status) ? formData.status : 2,
          }
        : formData;

    if (finalFormData.imageUrl instanceof File) {
      const reader = new FileReader();
      reader.readAsDataURL(finalFormData.imageUrl);
      reader.onloadend = () => {
        const processedFormData = {
          ...finalFormData,
          imageUrl: reader.result,
        };

        if (modalMode === 'create') {
          dispatch(fetchCreateNews({ formData: processedFormData }))
            .then((response) => {
              if (response.payload) {
                showNotification('Thêm tin tức thành công');
                handleClose();
                dispatch(fetchAllNews());
              } else {
                showNotification('Thêm tin tức thất bại', 'error');
              }
            })
            .catch(() => {
              showNotification('Đã có lỗi xảy ra', 'error');
            });
        } else {
          // Similar update logic
          dispatch(
            fetchUpdateNews({
              id: selectedData.id,
              formData: processedFormData,
            }),
          )
            .then((response) => {
              if (response.payload) {
                showNotification('Cập nhật tin tức thành công');
                handleClose();
                dispatch(fetchAllNews());
              } else {
                showNotification('Cập nhật tin tức thất bại', 'error');
              }
            })
            .catch(() => {
              showNotification('Đã có lỗi xảy ra', 'error');
            });
        }
      };
    } else {
      // Similar modifications for the case when imageUrl is not a file
      if (modalMode === 'create') {
        dispatch(fetchCreateNews({ formData: finalFormData }))
          .then((response) => {
            if (response.payload) {
              showNotification('Thêm tin tức thành công');
              handleClose();
              dispatch(fetchAllNews());
            } else {
              showNotification('Thêm tin tức thất bại', 'error');
            }
          })
          .catch(() => {
            showNotification('Đã có lỗi xảy ra', 'error');
          });
      } else {
        dispatch(
          fetchUpdateNews({
            id: selectedData.id,
            formData: finalFormData,
          }),
        )
          .then((response) => {
            if (response.payload) {
              showNotification('Cập nhật tin tức thành công');
              handleClose();
              dispatch(fetchAllNews());
            } else {
              showNotification('Cập nhật tin tức thất bại', 'error');
            }
          })
          .catch(() => {
            showNotification('Đã có lỗi xảy ra', 'error');
          });
      }
    }
  };
  const handleDelete = (id) => {
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa tin này?');
    if (isConfirmed) {
      dispatch(fetchDeleteNews(id))
        .then((response) => {
          if (response.payload) {
            showNotification('Xóa tin tức thành công');
            // Tự động fetch lại danh sách tin tức
            dispatch(fetchAllNews());
          } else {
            showNotification('Bạn không có quyền xóa tin tức', 'error');
          }
        })
        .catch(() => {
          showNotification('Đã có lỗi xảy ra', 'error');
        });
    }
  };

  const { newsData, loading } = useSelector((state) => state.news);

  const processedNewsData = newsData
    ?.filter((item) => !isDoctor || item.author?._id === userId)
    ?.map((item) => ({
      ...item,
      id: item._id || item.newsPost?._id || item.news?._id || item.id || item.message,
    }));

  useEffect(() => {
    dispatch(fetchAllCategoryNews());
    dispatch(fetchAllNews());
  }, [dispatch]);

  return (
    <Box m="20px">
      <Header title={t('menu.news')} subtitle="Thông tin, tin tức mới nhất dành cho bạn" />
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreate}
          style={{
            width: '100px',
            flex: 'end',
            backgroundColor: '#6EC207',
          }}
        >
          {t('actions.add')}
          <AddIcon />
        </Button>
        {loading && <div>Loading...</div>}
        {/* {error && <div>Error: {error}</div>} */}
        {processedNewsData && (
          <DataGrid rows={processedNewsData} columns={columns} components={{ Toolbar: GridToolbar }} />
        )}

        <MyModal
          open={openModal}
          handleClose={handleClose}
          mode={modalMode}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          data={selectedData}
          title={title}
          fields={newsFields}
        />

        {/* Thêm Snackbar để hiển thị thông báo */}
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default News;
