import { Box, Typography, useTheme, Button } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';

import { tokens } from '~/theme';
import { mockDataTeam } from '../../data/mockData';
import Header from '~/components/Header';
import MyModal from '~/components/Modal/Modal';

const Docter = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');

  const [formData, setFormData] = useState({});
  const [modalMode, setModalMode] = useState('create');
  const [selectedData, setSelectedData] = useState('');
  const colors = tokens(theme.palette.mode);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { t } = useTranslation();

  const columns = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'phone',
      headerName: 'Phone Number',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'accessLevel',
      headerName: 'Access Level',
      flex: 1,
      renderCell: ({ row: { access } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              access === 'admin'
                ? colors.greenAccent[600]
                : access === 'manager'
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {access === 'admin' && <AdminPanelSettingsOutlinedIcon />}
            {access === 'manager' && <SecurityOutlinedIcon />}
            {access === 'user' && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: '5px' }}>
              {access}
            </Typography>
          </Box>
        );
      },
    },
  ];
  const newsFields = [
    { name: 'title', label: 'title', type: 'text', grid: 4, required: true },
    { name: 'author', label: 'author', type: 'text', grid: 4, required: true },
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
  const handleOpenCreate = () => {
    setSelectedData(null);
    setModalMode('create');
    setOpenModal(true);
    setTitle('Thêm bác sĩ');
    setHasSubmitted(false);
  };

  const handleSubmit = (formData) => {
    setHasSubmitted(true);
    // if (modalMode === 'create') {
    //   console.log('Creating:', formData);
    // } else if (modalMode === 'edit') {
    //   console.log('Updating:', formData);
    // }
    let hasError = false;
    newsFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        hasError = true;
      }
    });

    if (hasError) {
      setOpenModal(true);

      alert('Please fill in all required fields!');
    } else {
      console.log(formData); // Xử lý khi form hợp lệ
      handleClose();
    }
  };
  const handleClose = () => setOpenModal(false);
  const selectorNewData = useSelector((state) => state.news.newsData);

  // add columns id
  const newsData = selectorNewData?.map((item) => ({
    ...item,
    id: item._id,
  }));

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value, // xử lý file upload
    }));
  };

  const handleDelete = () => {
    // Logic xóa
    console.log('Deleting:', selectedData);
  };
  return (
    <Box m="20px">
      <Header title="DOCTER" subtitle="Các bác sỹ" />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreate}
          sx={{
            width: '120px',
            backgroundColor: '#6EC207',
          }}
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
          hasSubmitted={hasSubmitted}
        />
      </Box>
      <Box
        m="20px 0 0 0"
        height="75vh"
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
        }}
      >
        <DataGrid checkboxSelection rows={mockDataTeam} columns={columns} />
      </Box>
    </Box>
  );
};

export default Docter;
