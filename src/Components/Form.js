import React from 'react';
import PropTypes from 'prop-types';
import Loader from "./Loader";

const Form = ({ isLoading, numTitles, handleInputChange, submitForm }) => {
    return (
        <form id="get-titles" onSubmit={submitForm}>
            <div>
                <span className="form-elem">Start URL: </span>
                <input name="startUrl" type="text" id='start-url' className="form-elem" placeholder="Enter URL"
                       onChange={handleInputChange}/>
            </div>
            <div>
                <span className="form-elem">Number of titles: </span>
                <input name="numTitles" id="num-titles" className="form-elem num-input" type="number" value={numTitles}
                       onChange={handleInputChange}/>
            </div>
            <div>
                <input type="submit" value="Get titles!" className="form-elem" id='send' disabled={isLoading}/>
            </div>
            <Loader visible={isLoading}/>

        </form>
    );
};

Form.propTypes = {
    startUrl: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    numTitles: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired
};

export default Form;
