import React from 'react';
import PropTypes from 'prop-types';
import Loader from "./Loader";

const Form = ({ isLoading, numTitles, handleInputChange, submitForm, numFetched }) => {
    return (
        <form id="get-titles" onSubmit={submitForm}>
            <span className="form-elem">Start URL: </span>
            <input name="startUrl" type="text" id='start-url' className="form-elem" placeholder="Enter URL"
                   onChange={handleInputChange}/>

            <span className="form-elem">Number of titles: </span>
            <input name="numTitles" id="num-titles" className="form-elem num-input" type="number" value={numTitles}
                   onChange={handleInputChange}/>

            <input type="submit" value="Get titles!" className="form-elem" id='send' disabled={isLoading}/>
            <Loader visible={isLoading}/>
            {numFetched !== -1 && <span className='finished'>Fetched {numFetched} titles!</span>}
        </form>
    );
};

Form.propTypes = {
    startUrl: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    numTitles: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired,
    numFetched: PropTypes.number
};

export default Form;
