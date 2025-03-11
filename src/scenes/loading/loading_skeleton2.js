import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

const LoadingSkeleton = ({ columns = 5, rows = 10 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Tạo mảng các dòng dựa trên tham số rows
  const rowsArray = Array(rows).fill(0);
  // Tạo mảng các cột dựa trên tham số columns
  const columnsArray = Array(columns).fill(0);

  return (
    <Box
      sx={{
        backgroundColor: colors.primary[400],
        borderRadius: '4px',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header của DataGrid */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: colors.blueAccent[700],
          padding: '16px 8px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
        }}
      >
        {columnsArray.map((_, index) => (
          <Box
            key={`header-${index}`}
            sx={{
              flex: index === 0 ? 0.5 : 1,
              px: 1,
            }}
          >
            <Skeleton
              variant="text"
              sx={{
                backgroundColor: colors.primary[100],
                opacity: 0.3,
                height: 35,
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Toolbar giả lập */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: colors.primary[400],
          padding: '8px 16px',
          justifyContent: 'flex-end',
          borderBottom: `1px solid ${colors.primary[300]}`
        }}
      >
        <Skeleton variant="rectangular" width={100} height={30} sx={{ backgroundColor: colors.primary[100], opacity: 0.2, mr: 1 }} />
        <Skeleton variant="rectangular" width={100} height={30} sx={{ backgroundColor: colors.primary[100], opacity: 0.2 }} />
      </Box>

      {/* Rows của DataGrid */}
      <Box sx={{ p: 1 }}>
        {rowsArray.map((_, rowIndex) => (
          <Box
            key={`row-${rowIndex}`}
            sx={{
              display: 'flex',
              py: 1.5,
              borderBottom: rowIndex !== rows - 1 ? `1px solid ${colors.primary[300]}` : 'none',
            }}
          >
            {columnsArray.map((_, colIndex) => (
              <Box
                key={`cell-${rowIndex}-${colIndex}`}
                sx={{
                  flex: colIndex === 0 ? 0.5 : colIndex === 2 ? 2 : 1,
                  px: 1,
                }}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    backgroundColor: colors.primary[100],
                    opacity: 0.2,
                    height: 20,
                    width: colIndex === 2 ? '100%' : Math.random() * 30 + 70 + '%',
                  }}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* Footer của DataGrid */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: colors.blueAccent[700],
          padding: '16px',
          mt: 'auto',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
        }}
      >
        <Skeleton variant="text" width={100} sx={{ backgroundColor: colors.primary[100], opacity: 0.3 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={30} height={30} sx={{ backgroundColor: colors.primary[100], opacity: 0.3 }} />
          <Skeleton variant="rectangular" width={30} height={30} sx={{ backgroundColor: colors.primary[100], opacity: 0.3 }} />
          <Skeleton variant="rectangular" width={30} height={30} sx={{ backgroundColor: colors.primary[100], opacity: 0.3 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default LoadingSkeleton;