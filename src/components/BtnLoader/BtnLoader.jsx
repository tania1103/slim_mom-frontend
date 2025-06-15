import React from 'react';
import PropTypes from 'prop-types';
import { ThreeDots } from 'react-loader-spinner';

export const BtnLoader = ({ color = '#fc842d' }) => {
  return (
    <ThreeDots
      visible={true}
      height="20"
      width="45"
      color={color}
      ariaLabel="three-dots-loading"
    />
  );
};

// PropTypes validation
BtnLoader.propTypes = {
  color: PropTypes.string,
};
