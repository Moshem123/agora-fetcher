import React from 'react';
import PropTypes from 'prop-types';
import '../style/Loader.css';

const Loader = ({ visible }) => {
    return (
        visible &&
        <div id="loader" className="lds-ellipsis">
            <div/>
            <div/>
            <div/>
            <div/>
        </div>);
};

Loader.propTypes = {
    visible: PropTypes.bool.isRequired,
};

Loader.defaultProps = {
    visible: false
};

export default Loader;
