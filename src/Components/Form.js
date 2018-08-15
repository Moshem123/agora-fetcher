import React from 'react';
import PropTypes from 'prop-types';
import Loader from "./Loader";

const Form = ({isLoading, refreshInterval, numTitles, handleInputChange, submitForm}) => {
    return (
        <form id="get-titles" onSubmit={submitForm}>
            <span className="form-elem">Start URL: </span>
            <input name="startUrl" type="text" id='start-url' className="form-elem" placeholder="Enter URL" onChange={handleInputChange} />

            <span className="form-elem">Number of titles: </span>
            <input name="numTitles" id="num-titles" className="form-elem num-input" type="number" value={numTitles} onChange={handleInputChange} />

            <span className="form-elem">Refresh interval: </span>
            <input name="refreshInterval" id="refresh-interval" className="form-elem num-input" type="number" value={refreshInterval} onChange={handleInputChange} />

            <input type="submit" value="Get titles!" className="form-elem" id='send' disabled={isLoading} />
            <Loader visible={isLoading} />
        </form>
    );
};

Form.propTypes = {
    startUrl: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    refreshInterval: PropTypes.string.isRequired,
    numTitles: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired
};

export default Form;
