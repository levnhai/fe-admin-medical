import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  useTheme, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import MyModal from '~/components/Modal/Modal';
import { 
  fetchAllCategoryNews, 
  fetchCreateCategoryNews, 
  fetchUpdateCategoryNews, 
  fetchDeleteCategoryNews 
} from '~/redux/news/categorySlice';

const CategoryNews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState(null);

  // Define fields for the category news modal
  const categoryNewsFields = [
    { 
      name: 'name', 
      label: 'Category Name', 
      type: 'text', 
      grid: 6, 
      required: true 
    },
    { 
      name: 'description', 
      label: 'Description', 
      type: 'textarea', 
      grid: 12 
    },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'option', 
      options: [
        { value: 0, label: 'Inactive' },
        { value: 1, label: 'Active' }
      ],
      grid: 6,
      required: true
    }
  ];

  // Define columns for the data grid
  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    { 
      field: 'name', 
      headerName: 'Category Name', 
      flex: 1 
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 2 
    },
    {
      field: 'status',
      headerName: 'Status',
      valueFormatter: (params) => {
        const statusMap = {
          0: 'Inactive',
          1: 'Active'
        };
        return statusMap[params.value] || 'Unknown';
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
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
            color="error" 
            onClick={() => handleDelete(params.row._id)}
          >
            <DeleteIcon />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  // Notification helper function
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification handler
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Open create modal
  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    setTitle('Add Category');
  };

  // Open edit modal
  const handleOpenEdit = (data) => {
    setSelectedData(data);
    setModalMode('edit');
    setOpenModal(true);
    setTitle('Edit Category');
  };

  // Close modal
  const handleClose = () => setOpenModal(false);

  // Submit handler for create/update
  const handleSubmit = (formData) => {
    console.log('formData in submit:', formData);
    if (modalMode === 'create') {
      dispatch(fetchCreateCategoryNews({ formData }))
        .then((response) => {
          if (response.payload) {
            showNotification('Category created successfully');
            handleClose();
            dispatch(fetchAllCategoryNews());
          } else {
            showNotification('Failed to create category', 'error');
          }
        })
        .catch(() => {
          showNotification('An error occurred', 'error');
        });
    } else {
      dispatch(fetchUpdateCategoryNews({ 
        id: selectedData._id, 
        formData 
      }))
        .then((response) => {
          if (response.payload) {
            showNotification('Category updated successfully');
            handleClose();
            dispatch(fetchAllCategoryNews());
          } else {
            showNotification('Failed to update category', 'error');
          }
        })
        .catch(() => {
          showNotification('An error occurred', 'error');
        });
    }
  };

  // Delete handler
  const handleDelete = (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this category?');
    if (isConfirmed) {
      dispatch(fetchDeleteCategoryNews(id))
        .then((response) => {
          if (response.payload) {
            showNotification('Category deleted successfully');
            dispatch(fetchAllCategoryNews());
          } else {
            showNotification('Failed to delete category', 'error');
          }
        })
        .catch(() => {
          showNotification('An error occurred', 'error');
        });
    }
  };

  // Get categories from Redux store
  const { categories = [], loading = false, error } = useSelector((state) => 
    state.categoryNews || { categories: [], loading: false, error: null }
  );
  useEffect(() => {
    // console.log('Categories:', categories);
    // console.log('Loading:', loading);
    // console.log('Error:', error);
  }, [categories, loading, error]);
  
  // Process data for DataGrid
  const processedCategoryData = categories?.map((item) => ({
    ...item,
    id: item._id
  }));

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchAllCategoryNews());
  }, [dispatch]);

  return (
    <Box m="20px">
      <Header 
        title="Category Management" 
        subtitle="Manage news categories" 
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
            backgroundColor: '#6EC207' 
          }}
        >
          Add Category
          <AddIcon />
        </Button>

        {loading && <div>Loading...</div>}
        
        {processedCategoryData && (
          <DataGrid 
            rows={processedCategoryData} 
            columns={columns} 
            components={{ Toolbar: GridToolbar }} 
          />
        )}

        <MyModal
          open={openModal}
          handleClose={handleClose}
          mode={modalMode}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          data={selectedData}
          title={title}
          fields={categoryNewsFields}
        />

        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CategoryNews;