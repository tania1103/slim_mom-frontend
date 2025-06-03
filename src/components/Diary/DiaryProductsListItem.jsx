import React from 'react';
import PropTypes from 'prop-types';
import {
  ListItem,
  TextField,
  IconButton,
  Box,
  InputAdornment,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import { deleteDiaryEntry } from '../../redux/diary/diaryOperations';
import { toast } from 'react-toastify';
import { useMediaQuery, useTheme } from '@mui/material';
import Notiflix from 'notiflix';

Notiflix.Confirm.init({
  titleColor: '#FC842D',
  okButtonBackground: '#FC842D',
  cancelButtonBackground: '#CCCCCC',
});

Notiflix.Loading.init({
  svgColor: '#FC842D',
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    color: 'black',
    fontFamily: 'verdana',
    fontSize: '14px',
  },
  '& .MuiInput-underline:before': {
    borderBottomColor: '#E0E0E0',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: '#E0E0E0',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#E0E0E0',
  },
});

// Styled ListItem with no left padding
const StyledListItem = styled(ListItem)({
  paddingLeft: 0,
});

const DiaryProductsListItem = ({ product }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDelete = () => {
    Notiflix.Confirm.show(
      'Confirm Deletion',
      'Are you sure you want to delete this item from your diary?',
      'Delete',
      'Cancel',
      function okCallback() {
        dispatch(deleteDiaryEntry(product._id))
          .unwrap()
          .then(() => {
            toast.success('Product deleted successfully');
          })
          .catch(error => {
            toast.error(`Error deleting product: ${error.message}`);
          });
      },
      function cancelCallback() {
        // User canceled the deletion, do nothing
      },
      {
        okButtonBackground: '#FC842D',
      }
    );
  };

  return (
    <>
      <StyledListItem>
        <Box display="flex" alignItems="center" width="100%">
          <StyledTextField
            variant="standard"
            value={product.title}
            InputProps={{ readOnly: true }}
            sx={{
              width: isMobile ? '40%' : isTablet ? 'auto' : '240px',
              mr: isMobile ? 1 : isTablet ? 3 : 6,
              minWidth: isMobile ? '80px' : 'auto',
            }}
          />
          <StyledTextField
            variant="standard"
            value={product.grams}
            InputProps={{
              readOnly: true,
              endAdornment: <InputAdornment position="end">g</InputAdornment>,
              inputProps: { style: { textAlign: 'right' } },
            }}
            sx={{
              width: isMobile ? '30%' : '100px',
              mr: isMobile ? 1 : isTablet ? 2 : 4,
              minWidth: isMobile ? '60px' : 'auto',
            }}
          />
          <StyledTextField
            variant="standard"
            value={product.calorieIntake}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">kcal</InputAdornment>
              ),
              inputProps: { style: { textAlign: 'right' } },
            }}
            sx={{
              width: isMobile ? '30%' : '100px',
              mr: isMobile ? 0 : isTablet ? 1 : 2,
              minWidth: isMobile ? '70px' : 'auto',
            }}
          />
          <IconButton
            onClick={handleDelete}
            size="small"
            sx={{
              ml: isMobile ? 1 : 'auto',
              minWidth: isMobile ? '24px' : 'auto',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </StyledListItem>
    </>
  );
};

// PropTypes validation
DiaryProductsListItem.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    grams: PropTypes.number.isRequired,
    calorieIntake: PropTypes.number.isRequired,
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

export default DiaryProductsListItem;
