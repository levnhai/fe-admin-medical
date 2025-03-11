import { Box } from '@mui/material';
import { useTheme, Button, ButtonGroup} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import LoadingSkeleton from '~/scenes/loading/loading_skeleton2';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { 
  fetchAllNews, 
  fetchCreateNews, 
  fetchUpdateNews, 
  fetchDeleteNews, 
  fetchMyNews,
  fetchHospitalAndDoctorNews 
} from '~/redux/news/newsSlice';
import { fetchAllCategoryNews } from '~/redux/news/categorySlice';
import Modal from '~/components/Modal';
// import Button from '~/components/Button';
import MyModal from '~/components/Modal/MyModal';

const News = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
 
  const [openModal, setOpenModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [title, setTitle] = useState('');
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);


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
      // Admin or other roles
      return [
        { value: 1, label: 'Công khai' },
        { value: 2, label: 'Nháp' },
        { value: 3, label: 'Xóa' },
      ];
    }
  };

  const newsFields = [
    { name: 'title', label: 'title', type: 'text', grid: 6 },
    { name: 'subtitle', label: 'subtitle', type: 'text', grid: 6 },
    {
      name: 'status',
      label: 'Status',
      type: 'option',
      grid: 2,
      options: getStatusOptions(),
      required: true,
    },
    { name: 'tags', label: 'tags', type: 'text', grid: 4 },
    {
      name: 'category',
      label: 'category',
      type: 'option',
      options:
      categories
        ?.filter(category => category.status === 1)
        .map((category) => ({
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
    { field: 'subtitle', headerName: t('menu.subtitle'), flex: 1 },
    {
      field: 'author',
      headerName: t('menu.author'),
      flex: 1,
      valueFormatter: (params) => {
        // Check if author is an object with fullName property
        if (params.value && params.value.fullName) {
          return params.value.fullName;
        }
        return 'Unknown'; // Fallback if no name is found
      },
    },
    {
      field: 'authorModel',
      headerName: 'Author Type',
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
        // Check if params.value contains _id
        if (params.value && params.value._id) {
          // Find category in categories
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
        // Check edit permissions
        let canEdit = true;
        let canDelete = true;
        
        return (
          <ButtonGroup variant="contained" aria-label="Basic button group">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleOpenEdit(params.row)}
              disabled={!canEdit}
            >
              <EditIcon />
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => 
               { setShowModalDelete(true)
                setSelectedUserId(params.row.id)}
              }
              // disabled={!canDelete}
            >
              <DeleteIcon />
            </Button>
          </ButtonGroup>
        );
      },
    },
  ];

  const handleDeleteNews = async () => {
    const res = await dispatch(fetchDeleteNews(selectedUserId));
    const result = unwrapResult(res);
    setShowModalDelete(false);
    if (result?.status) {
      toast.success(result?.message);
      fetchNewsData();
    } else {
      toast.warning(result?.message);
    }
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

    setSelectedData(editData);
    setModalMode('edit');
    setOpenModal(true);
    setTitle('Sửa tin tức');
  };

  const handleClose = () => setOpenModal(false);

  const validateStatusChange = (status, currentStatus) => {
    if (isDoctor) {
      return status === 2 || status === 3 ? status : 2;
    } else if (isHospitalAdmin) {
      return status;
    } else {
      return status;
    }
  };

  const handleSubmit = (formData) => {
    let finalFormData = { ...formData };
    
    if (modalMode === 'create') {
      finalFormData.status = isDoctor ? 2 : formData.status;
    } else if (modalMode === 'edit') {
      finalFormData.status = validateStatusChange(formData.status, selectedData.status);
    }

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
                toast.success('Thêm tin tức thành công');
                handleClose();
                loadNewsData();
              } else {
                toast.warning('Thêm tin tức thất bại', 'error');
              }
            })
            .catch(() => {
              toast.error('Đã có lỗi xảy ra', 'error');
            });
        } else {
          dispatch(
            fetchUpdateNews({
              id: selectedData.id,
              formData: processedFormData,
            }),
          )
            .then((response) => {
              if (response.payload) {
                toast.success('Cập nhật tin tức thành công');
                handleClose();
                loadNewsData();
              } else {
                toast.warning('Cập nhật tin tức thất bại', 'error');
              }
            })
            .catch(() => {
              toast.error('Đã có lỗi xảy ra', 'error');
            });
        }
      };
    } else {
      if (modalMode === 'create') {
        dispatch(fetchCreateNews({ formData: finalFormData }))
          .then((response) => {
            if (response.payload) {
              toast.success('Thêm tin tức thành công');
              handleClose();
              loadNewsData();
            } else {
              toast.warning('Thêm tin tức thất bại', 'error');
            }
          })
          .catch(() => {
            toast.error('Đã có lỗi xảy ra', 'error');
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
              toast.success('Cập nhật tin tức thành công');
              handleClose();
              loadNewsData();
            } else {
              toast.warning('Cập nhật tin tức thất bại', 'error');
            }
          })
          .catch(() => {
            toast.error('Đã có lỗi xảy ra', 'error');
          });
      }
    }
  };


  const processedNewsData = newsData
    ?.map((item) => ({
      ...item,
      id: item._id || item.newsPost?._id || item.news?._id || item.id || item.message,
    }));

  // Function to load appropriate news data based on user role
  const loadNewsData = () => {
    if (isDoctor) {
      dispatch(fetchMyNews());
    } else if (isHospitalAdmin) {
      dispatch(fetchHospitalAndDoctorNews());
    } else {
      dispatch(fetchAllNews());
    }
  };

  const fetchNewsData = async () => {
    const res = await dispatch(fetchAllNews());
    const result = unwrapResult(res);
    // setUserData(result?.user);
  };

  useEffect(() => {
    dispatch(fetchAllCategoryNews());
    loadNewsData();
  }, [dispatch, isDoctor, isHospitalAdmin]);

  
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreate}
          style={{
            width: '150px',
            marginBottom: '10px',
            backgroundColor: '#6EC207',
          }}
        >
          Thêm tin tức
          <AddIcon />
        </Button>
        {loading || !processedNewsData ? (
            <LoadingSkeleton columns={5} />
          ) : (
            <DataGrid 
              rows={processedNewsData} 
              columns={columns} 
              components={{ Toolbar: GridToolbar }}
            />
          )}

        {isLoading ? (
          <LoadingSkeleton columns={5} />
        ) : (
          <MyModal
            open={openModal}
            handleClose={handleClose}
            mode={modalMode}
            onSubmit={handleSubmit}
            data={selectedData}
            title={title}
            fields={newsFields}
          />
        )}
        <Modal isOpen={showModalDelete} onClose={() => setShowModalDelete(false)} title="Xóa tin tức">
          <div>
            <p className="text-[#2c3e50] p-5 text-lg">Bạn thực sự muốn xóa tin này không ?</p>
            <div className="flex justify-end border-t py-2 pr-6 gap-4">
              <Button className="text-[#2c3e50]" onClick={() => setShowModalDelete(false)}>
                Đóng
              </Button>
              <Button className="bg-red-400 px-6 py-2 text-white" onClick={handleDeleteNews}>
                Đồng ý
              </Button>
            </div>
          </div>
        </Modal>
      </Box>
    </Box>
  );
};

export default News;