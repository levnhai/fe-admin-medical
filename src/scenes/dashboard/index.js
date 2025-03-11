import { Box, Button, IconButton, Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { mockTransactions } from '../../data/mockData';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EmailIcon from '@mui/icons-material/Email';
import Header from '../../components/Header';
import LineChart from '../../components/LineChart';
import GeographyChart from '../../components/GeographyChart';
import BarChart from '../../components/BarChart';
import StatBox from '../../components/StatBox';
import ProgressCircle from '../../components/ProgressCircle';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import { FaUserDoctor, FaHospitalUser } from 'react-icons/fa6';
import { FaHospitalAlt } from 'react-icons/fa';
import { IoNewspaper } from 'react-icons/io5';
import { MdPriceChange } from 'react-icons/md';

import { fetchAllDashboardStats, fetchStatsByHospital } from '~/redux/dashboard/dashboardSlice';
import { formatDate, extractTime } from '~/utils/time';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = Cookies.get('login');
  const userLogin = useSelector((state) => state.auth.user?.payload);
  const userRole = token ? jwtDecode(token).role : 'guest';
  const userId = userLogin?.userData?._id;

  const [statsData, setStatsData] = useState();

  useEffect(() => {
    switch (userRole) {
      case 'system_admin':
        let fetchStats = async () => {
          const res = await dispatch(fetchAllDashboardStats());
          const result = unwrapResult(res);
          setStatsData(result);
        };
        fetchStats();
        break;
      case 'hospital_admin':
        let fetchStatsByhospital = async () => {
          const res = await dispatch(fetchStatsByHospital({ hospitalId: userId }));
          const result = unwrapResult(res);
          setStatsData(result);
        };
        fetchStatsByhospital();
        break;

      case 'doctor':
        console.log('user role doctor');
        break;
      default:
        console.log('user role default');
    }
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t('sidebar.dashboard')} subtitle={t('dashboard.title')} />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '10px 20px',
            }}
            onClick={() => alert('tính năng đang phát triển thêm')}
          >
            <DownloadOutlinedIcon sx={{ mr: '10px' }} />
            Tải xuống
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px">
        {/* <h1>Hoàn thiện sau khi đã đủ chức năng</h1> */}
        {/* ROW 1 */}
        {/* <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={statsData?.data?.hospitalCount}
            subtitle="Bệnh viện"
            progress="0.75"
            increase="+14%"
            icon={<FaHospitalAlt className="text-green-300 text-xl" />}
          />
        </Box> */}
        {userRole === 'system_admin' && (
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={statsData?.data?.hospitalCount}
              subtitle="Bệnh viện"
              progress="0.75"
              increase="+14%"
              icon={<FaHospitalAlt className="text-green-300 text-xl" />}
            />
          </Box>
        )}

        {userRole === 'hospital_admin' && (
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={`${statsData?.data?.amountTotal?.toLocaleString('en-US')} Vnđ `}
              subtitle="Doanh thu"
              progress="0.75"
              increase="+14%"
              icon={<MdPriceChange className="text-green-300 text-xl" />}
            />
          </Box>
        )}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={statsData?.data?.doctorCount}
            subtitle="Bác sĩ"
            progress="0.50"
            increase="+21%"
            icon={<FaUserDoctor className="text-green-300 text-xl" />}
          />
        </Box>
        {userRole === 'hospital_admin' && (
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={statsData?.data?.appointmentCount}
              subtitle="Khám bệnh"
              progress="0.75"
              increase="+14%"
              icon={<FaHospitalAlt className="text-green-300 text-xl" />}
            />
          </Box>
        )}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={statsData?.data?.userCount}
            subtitle="Người dùng"
            progress="0.30"
            increase="+5%"
            icon={<FaHospitalUser className="text-green-300 text-xl" />}
          />
        </Box>
        {userRole === 'system_admin' && (
          <Box
            gridColumn="span 3"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={statsData?.data?.newCount}
              subtitle="Tin tức"
              progress="0.80"
              increase="+43%"
              icon={<IoNewspaper className="text-green-300 text-xl" />}
            />
          </Box>
        )}
        {/* ROW 2 */}
        <Box gridColumn="span 8" gridRow="span 2" backgroundColor={colors.primary[400]}>
          <Box mt="25px" p="0 30px" display="flex " justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                Doanh thu
              </Typography>
              <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]}>
                $59,342.32
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon sx={{ fontSize: '26px', color: colors.greenAccent[500] }} />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
        {userRole === 'hospital_admin' && (
          <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} overflow="auto">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              colors={colors.grey[100]}
              p="15px"
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                Lịch hẹn khám
              </Typography>
            </Box>
            {statsData?.data?.appointment.map((item, index) => (
              <Box
                // key={`${transaction.txId}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="600">
                    {item?.record?.fullName}
                  </Typography>
                  <Typography color={colors.grey[100]}>{item?.record?.phoneNumber}</Typography>
                </Box>
                {/* <Box color={colors.grey[100]}>{formatDate(item?.date)}</Box> */}
                <Box>
                  <Typography color={colors.grey[100]}>
                    {extractTime(item?.hours[0]?.start)} - {extractTime(item?.hours[0]?.end)}
                  </Typography>
                  <Typography color={colors.grey[100]}>{formatDate(item?.date)}</Typography>
                </Box>
                <Box backgroundColor={colors.greenAccent[500]} p="5px 10px" borderRadius="4px">
                  {item?.price} vnđ
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {userRole === 'system_admin' && (
          <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} overflow="auto">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              colors={colors.grey[100]}
              p="15px"
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                Bệnh viện nổi bật
              </Typography>
            </Box>
            {statsData?.data?.hospitalData?.map((item, index) => (
              <Box
                // key={`${transaction.txId}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="600">
                    {item?.fullName}
                  </Typography>
                  {/* <Typography color={colors.grey[100]}>{item?.hospitalType}</Typography> */}
                </Box>
                {/* <Box color={colors.grey[100]}>{formatDate(item?.date)}</Box> */}
                {/* <Box>
                  <Typography color={colors.grey[100]}>
                    {extractTime(item?.hours[0]?.start)} - {extractTime(item?.hours[0]?.end)}
                  </Typography>
                  <Typography color={colors.grey[100]}>{formatDate(item?.date)}</Typography>
                </Box>
                <Box backgroundColor={colors.greenAccent[500]} p="5px 10px" borderRadius="4px">
                  {item?.price} vnđ
                </Box> */}
              </Box>
            ))}
          </Box>
        )}
        {/* ROW 3 */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} p="30px">
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" mt="25px">
            <ProgressCircle size="125" />
            <Typography variant="h5" color={colors.greenAccent[500]} sx={{ mt: '15px' }}>
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]}>
          <Typography variant="h5" fontWeight="600" sx={{ padding: '30px 30px 0 30px' }}>
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} padding="30px">
          <Typography variant="h5" fontWeight="600" sx={{ marginBottom: '15px' }}>
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
