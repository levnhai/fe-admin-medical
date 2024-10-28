import { Box } from '@mui/material';
import { useTheme, Button, ButtonGroup } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { fetchAllNews } from '~/redux/news/newsSlice';
import MyModal from '~/components/Modal/Modal';

const News = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState('');

  const newsFields = [
    { name: 'title', label: 'title', type: 'text', grid: 4 },
    { name: 'author', label: 'author', type: 'text', grid: 4 },
    { name: 'status', label: 'status', type: 'text', grid: 4 },
    { name: 'tags', label: 'tags', type: 'text', grid: 4 },
    {
      name: 'category',
      label: 'category',
      type: 'option',
      options: [
        { value: 'admin', label: 'Thưởng thức y tế' },
        { value: 'user', label: 'Tin y tế' },
        { value: 'guest', label: 'Dịch vụ' },
      ],
      grid: 4,
    },
    { name: 'views', label: 'views', type: 'number', grid: 4 },
    { name: 'isFeatured', label: 'isFeatured', type: 'text', grid: 4 },
    { name: 'imageUrl', label: 'imageUrl', type: 'file', grid: 4 },
    { name: 'content', label: 'content', type: 'textarea', grid: 12 },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },

    { field: 'title', headerName: t('menu.title'), flex: 1 },
    {
      field: 'content',
      headerName: 'content',
      flex: 1,
    },
    {
      field: 'author',
      headerName: 'author',
    },
    {
      field: 'status',
      headerName: 'status',
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'views',
      headerName: 'views',
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'createdAt',
      headerName: 'createdAt',
      flex: 1,
    },
    {
      field: 'updatedAt',
      headerName: 'updatedAt',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button variant="contained" color="primary" onClick={handleOpenEdit}>
            <EditIcon />
          </Button>
          <Button variant="contained" color="primary" onClick={handleDelete}>
            <DeleteIcon />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    setTitle('Thêm tin tức');
  };

  const handleOpenEdit = (data) => {
    setSelectedData(data);
    setModalMode('edit');
    setOpenModal(true);
    setTitle('Sửa tin tức');
  };

  const handleClose = () => setOpenModal(false);

  const handleSubmit = (formData) => {
    if (modalMode === 'create') {
      // Logic tạo mới
      console.log('Creating:', formData);
    } else if (modalMode === 'edit') {
      // Logic chỉnh sửa
      console.log('Updating:', formData);
    }
  };

  const handleDelete = () => {
    // Logic xóa
    console.log('Deleting:', selectedData);
  };

  const selectorNewData = useSelector((state) => state.news.newsData);

  // add columns id
  const newsData = selectorNewData?.map((item) => ({
    ...item,
    id: item._id,
  }));

  useEffect(() => {
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
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .name-column--cell': {
            color: colors.greenAccent[300],
          },
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
          style={{ width: '100px', flex: 'end', backgroundColor: '#6EC207' }}
        >
          {t('actions.add')}
          <AddIcon />
        </Button>
        {newsData && <DataGrid rows={newsData} columns={columns} components={{ Toolbar: GridToolbar }} />}

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
      </Box>
    </Box>
  );
};

export default News;
