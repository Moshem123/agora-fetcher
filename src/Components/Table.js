import React from 'react';
import PropTypes from 'prop-types';
import '../style/Table.css';

const Table = ({ items, clearTable, isLoading, sortFunc, alreadySorted, changeRefresh, applyCancelRefresh }) => {
    const headers = [
        { name: 'ID', colName: 'postId' },
        { name: 'Name', colName: 'title' },
        { name: 'Link', colName: 'url' },
        { name: 'Image', colName: 'blabla' },
        { name: "Refresh", colName: 'settings' }
    ];
    // alreadySorted.field === header.lName && (alreadySorted.dir === 'asc' ? <SortUp/> : <SortDown/>)
    return (
        <div>
            <button id="clearTable" onClick={clearTable} disabled={isLoading}>Clear Static Posts</button>
            <table id="products">
                <thead>
                <tr>
                    {headers.map(e => (
                        <th key={e.name} id={"t_" + e.colName} onClick={sortFunc}>
                            {e.name}
                            {alreadySorted.field.replace('t_', '') === e.colName && (alreadySorted.dir === 'asc' ?
                                <i className="sort-up"/> :
                                <i className="sort-down"/>)}
                        </th>
                    ))}
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
                            <td>
                                    <input
                                        type="number"
                                        name={"refreshInterval_" + e.postId}
                                        placeholder="Refresh Interval"
                                        min="1"
                                        max="300"
                                        value={e.settings.refreshInterval}
                                        onChange={changeRefresh}/>
                                    <span role="img" aria-label="V" data-type="apply" data-postid={e.postId} onClick={applyCancelRefresh}>&#9989;</span>
                                    <span role="img" aria-label="X" data-type="cancel" data-postid={e.postId} onClick={applyCancelRefresh}>&#10060;</span>
                                <br/>
                                {e.settings.lastRefreshInWords !== "" && <div>
                                    Last Refresh: {e.settings.lastRefreshInWords}
                                </div>}
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
    isLoading: PropTypes.bool.isRequired,
    sortFunc: PropTypes.func.isRequired,
    alreadySorted: PropTypes.object.isRequired,
    changeRefresh: PropTypes.func.isRequired,
    applyCancelRefresh: PropTypes.func.isRequired
};


export default Table;