import React, { PureComponent } from 'react';
import './style/App.css';
import Form from "./Components/Form";
import Table from "./Components/Table";
import Notif from "./Components/Notif";
import axios from 'axios';
import range from 'lodash/range';
import orderBy from 'lodash/orderBy';
import moment from 'moment';


moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 1);

const getData = url => {
    return axios.post('/proxy/', { url, })
        .then(response => response.data)
};

class App extends PureComponent {
    state = {
        startUrl: '',
        numTitles: "100",
        isLoading: false,
        items: [],
        notif: false,
        shouldNotify: false,
        notifyPostId: '',
        numFetched: -1,
        alreadySorted: { field: '', dir: '' }
    };

    refreshes = {};
    refreshesInWords = {};
    nonExistentPosts = ['פרויקט אגורה : חפצים למסירה יד שניה'];

    sortCol = event => {
        const col = event.currentTarget.id.replace('t_', '');
        const { alreadySorted, items } = this.state;
        let newDir = "asc";
        if (alreadySorted.field === col && alreadySorted.dir === "asc") {
            newDir = "desc";
        }
        const orderedItems = orderBy(items, col, newDir);
        this.setState({ alreadySorted: { field: col, dir: newDir }, items: orderedItems })
    };


    fetchAndProcess = url => {
        return getData(url)
            .then(html => {
                const doc = new DOMParser().parseFromString(html, "text/html");
                const title = doc.querySelectorAll('title')[0].innerText.split(' - מודעה')[0];

                // Check if the post is not existing yet.
                if (this.nonExistentPosts.indexOf(title) !== -1) {
                    return false;
                }
                let details = 'אין פירוט';
                try {
                    details = doc.querySelector('.objectDetailsTr').querySelector('.details').childNodes[0].nodeValue;
                } catch (err) {
                    console.log(err);
                }

                const image = doc.querySelector('td.imageThumb > a > span');
                const alreadyGone = (doc.querySelector('div.givenMessage') || {}).innerText;
                const postId = url.split('/')[5].split('_')[0];
                let bigImg, smallImg;

                if (image) {
                    smallImg = image.style['background-image'].split('"')[1];
                    bigImg = smallImg.replace("_t.jpg", ".jpg");
                }
                const defaultSettings = { refreshInterval: 300, lastRefresh: "", lastRefreshInWords: "" };
                let finalDetailsObj = { url, title, details, postId, alreadyGone, bigImg, smallImg, settings: { ...defaultSettings } };

                let shouldNotify = false, notifyPostId;

                let existingSettings = {};
                let itemsDuplicate = [...this.state.items];
                const existing = itemsDuplicate.find(e => e.postId === postId);
                // Check if the item exists already, remove it from the items not before saving its settings obj
                if (existing) {
                    existingSettings = { ...existing.settings };
                    delete existing.settings;
                    delete finalDetailsObj.settings;
                    if (JSON.stringify(finalDetailsObj) !== JSON.stringify(existing)) {
                        shouldNotify = true;
                        notifyPostId = postId + "_" + Date.now();
                    }
                    const id = itemsDuplicate.findIndex(e => e.postId === postId);
                    finalDetailsObj = { ...finalDetailsObj, settings: existingSettings };
                    itemsDuplicate[id] = finalDetailsObj;
                } else {
                    finalDetailsObj = { ...finalDetailsObj, settings: defaultSettings };
                    itemsDuplicate.push(finalDetailsObj);
                }

                finalDetailsObj.settings.lastRefresh = Date.now();
                const setStateObj = { items: itemsDuplicate };
                if (shouldNotify) {
                    setStateObj.shouldNotify = shouldNotify;
                    setStateObj.notifyPostId = notifyPostId;
                }
                this.setState(setStateObj);
                return true;
            });
    };

    getAllTitles = urls => {
        this.setState({ isLoading: true, numFetched: -1 });
        const urlPromise = urls.map(url => this.fetchAndProcess(url));
        Promise.all(urlPromise)
            .then(e => {
                const numFetched = e.filter(e => e).length;
                this.setState(prevState => ({ isLoading: false, notif: prevState.shouldNotify, shouldNotify: false, numFetched, alreadySorted: { field: '', dir: '' } }));
                setTimeout(() => this.setState({ notif: false }), 300);
                this.sortCol({currentTarget: {id: "t_postId"}}); // Default sorting by postId
            })
            .catch(err => console.log(err));
    };

    clearTable = () => {
        const keepPosts = Object.keys(this.refreshes);
        this.setState(prevState => {
            return { items: prevState.items.filter(e => keepPosts.indexOf(e.postId) !== -1) };
        });
    };

    handleInputChange = event => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    };

    changeRefresh = event => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const inputType = target.name.split('_');
        const type = inputType[0];
        const postId = inputType[1];
        const { items } = this.state;

        const index = items.findIndex(e => e.postId === postId);

        const revised = [...items];
        revised[index].settings = { ...revised[index].settings, [type]: value };

        this.setState({ items: revised });
    };

    applyCancelRefresh = event => {
        const target = event.target;
        const { type, postid } = target.dataset; // Get the postId and the type of action (apply / cancel0
        const { items, startUrl } = this.state; // Get the items (for the refresh interval and the startUrl to create
                                                // the URL
        const refreshInterval = items.find(post => post.postId === postid).settings.refreshInterval; // Get the refresh
                                                                                                     // interval of the
                                                                                                     // item
        const refreshIntervalInt = parseInt(refreshInterval, 10) * 1000;

        // Create the URL the same as we do on the submit form
        const splittedUrl = startUrl.split('/');
        const lastPart = splittedUrl[splittedUrl.length - 1].split('_');
        splittedUrl[splittedUrl.length - 1] = postid + "_" + lastPart[1];
        const url = splittedUrl.join('/');

        if (type === 'apply') {
            if (this.refreshes.hasOwnProperty(postid)) {
                alert('Already refreshing this item! Hit the X button before trying again');
                return;
            }
            this.refreshes[postid] = setInterval(() => {
                console.log('refreshing ' + url);
                if (this.state.isLoading) {
                    return;
                }
                this.fetchAndProcess(url)
                    .then(e => {
                        const numFetched = e ? 1 : 0;
                        this.setState(prevState => ({ notif: prevState.shouldNotify, shouldNotify: false, numFetched }));
                        setTimeout(() => this.setState({ notif: false }), 300);
                    });
            }, refreshIntervalInt);

            this.refreshesInWords[postid] = setInterval(() => {
                this.setState(prevState => {
                    const id = prevState.items.findIndex(post => post.postId === postid);
                    const itemsDuplicate = [...prevState.items];
                    itemsDuplicate[id].settings.lastRefreshInWords = moment(itemsDuplicate[id].settings.lastRefresh).fromNow();
                    return { items: itemsDuplicate };
                });
            }, 1000)
        } else {
            if (this.refreshes.hasOwnProperty(postid)) {
                clearInterval(this.refreshes[postid]);
                clearInterval(this.refreshesInWords[postid]);
                delete this.refreshes[postid];
                delete this.refreshesInWords[postid];
                this.setState(prevState => {
                    const id = prevState.items.findIndex(post => post.postId === postid);
                    const itemsDuplicate = [...prevState.items];
                    itemsDuplicate[id].settings.lastRefreshInWords = "";
                    return { items: itemsDuplicate };
                });
            }
        }
    };

    submitForm = e => {
        e.preventDefault();

        const { startUrl, numTitles, items } = this.state;

        const numOfTitles = parseInt(numTitles, 10);
        const splittedUrl = startUrl.split('/');
        const lastPart = splittedUrl[splittedUrl.length - 1].split('_');
        const number = parseInt(lastPart[0], 10);

        // To eliminate duplicates get the present table values
        const presentTableValues = items.map(e => e.id);

        // Sanity checks
        if (startUrl === "" || startUrl.indexOf('agora.co.il') === -1 || isNaN(number)) {
            alert('Please type a valid agora.co.il link');
            return;
        }
        if (isNaN(numOfTitles) || numTitles > 1000 || numTitles < 1) {
            alert('Please enter a valid number for titles. Between 1 and 1000');
            return;
        }

        // Create urls array
        let arr = range(number, number + numOfTitles);
        arr = arr.filter(num => presentTableValues.indexOf(num.toString()) === -1);
        const urls = arr.map(num => {
            const restUrl = [...splittedUrl];
            restUrl[restUrl.length - 1] = num + "_" + lastPart[1];
            return restUrl.join('/');
        });

        // Start fetching
        this.getAllTitles(urls);
    };

    render() {
        const { notif, items, isLoading, alreadySorted, notifyPostId, numFetched } = this.state;
        return (
            <div className="App">
                <Form
                    {...this.state}
                    handleInputChange={this.handleInputChange}
                    submitForm={this.submitForm}
                />
                {numFetched !== -1 && <div>
                    <span className='finished'>Fetched {numFetched} titles!</span>
                </div>}
                <Table
                    items={items}
                    isLoading={isLoading}
                    clearTable={this.clearTable}
                    alreadySorted={alreadySorted}
                    sortFunc={this.sortCol}
                    changeRefresh={this.changeRefresh}
                    applyCancelRefresh={this.applyCancelRefresh}/>
                <Notif
                    ignore={!notif}
                    tag={notifyPostId}/>
            </div>
        );
    }
}

export default App;
