import React from 'react';
import PropTypes from 'prop-types';

const Table = ({ items,clearTable, isLoading }) => {
    return (
        <div>
            <button id="clearTable" onClick={clearTable} disabled={isLoading}>Clear Table</button>
            <table id="products">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Link</th>
                    <th>Image</th>
                </tr>
                </thead>
                <tbody>
                {items.map(e => (
                        <tr key={e.postId}>
                            <td>{e.postId}</td>
                            <td>
                            <span className="postTitle">{e.title}</span>
                                {e.alreadyGone && <span className="gone">{" - " + e.alreadyGone}</span>}
                                <div>{e.details}</div>
                            </td>
                            <td>
                                <a href={e.url} target="_blank">Post</a>{" "}
                                <a href={"https://www.agora.co.il/map.asp?id=" + e.postId} target='_blank'>Map</a>
                            </td>
                            <td>
                                <a href={'https://www.agora.co.il/' + e.bigImg} target='_blank'>
                                    <img src={'https://www.agora.co.il/' + e.smallImg} alt=""/>
                                </a>
                            </td>
                        </tr>
                    )
                )}
                </tbody>
            </table>
        </div>
    );
};

Table.propTypes = {
    items: PropTypes.array.isRequired,
    clearTable: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
};


export default Table;