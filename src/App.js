import React, { PureComponent } from 'react';
import './style/App.css';
import Form from "./Components/Form";
import Table from "./Components/Table";
import Notif from "./Components/Notif";
import axios from 'axios';
import range from 'lodash/range';
import moment from 'moment';


moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 30);

const getData = url => {
    return axios.post('/proxy/', { url, })
        .then(response => response.data)
};

class App extends PureComponent {
    state = {
        lastRefresh: "",
        refreshTimeStamp: "",
        startUrl: '',
        numTitles: "100",
        refreshInterval: "300",
        isLoading: false,
        items: [],
        notif: false,
        shouldNotify: false
    };

    componentDidMount() {
        this.timerID = setInterval(this.updateLastUpdateTime, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
        clearInterval(this.refreshingInterval);
    }

    updateLastUpdateTime = () => this.setState(prevState => ({ refreshTimeStamp: prevState.lastRefresh === "" ? "" : moment(this.state.lastRefresh).fromNow() }));

    nonExistentPosts = ['פרויקט אגורה : חפצים למסירה יד שניה'];

    fetchAndProcess = url => {
        return getData(url)
            .then(html => {
                const doc = new DOMParser().parseFromString(html, "text/html");
                const title = doc.querySelectorAll('title')[0].innerText.split(' - מודעה')[0];

                // Check if the post is not existing yet.
                if (this.nonExistentPosts.indexOf(title) !== -1) {
                    return;
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

                const finalDetailsObj = { url, title, details, postId, alreadyGone, bigImg, smallImg };
                const existing = this.state.items.find(e => e.postId === postId);
                let tempItems = this.state.items;
                let shouldNotify = false;
                if (existing) {
                    if (JSON.stringify(finalDetailsObj) === JSON.stringify(existing)) return;
                    tempItems = this.state.items.filter(e => e.postId !== postId);
                    shouldNotify = true;
                }

                this.setState({ items: [...tempItems, finalDetailsObj] });
                if (shouldNotify) {
                    this.setState({ shouldNotify })
                }
                //debugger;
                // return {url, title, details, postId, alreadyGone, bigImg, smallImg};
            });
    };

    getAllTitles = urls => {
        this.setState({ isLoading: true });
        const urlPromise = urls.map(url => this.fetchAndProcess(url));
        Promise.all(urlPromise)
            .then(() => {
                this.setState(prevState => ({ isLoading: false, lastRefresh: Date.now(), notif: prevState.shouldNotify, shouldNotify: false }));
                setTimeout(() => this.setState({notif: false}), 300);
            })
            .catch(err => console.log(err));
    };

    clearTable = () => this.setState({ items: [] });

    handleInputChange = event => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    };

    submitForm = e => {
        e.preventDefault();

        const { startUrl, numTitles, refreshInterval, items } = this.state;

        const numOfTitles = parseInt(numTitles, 10);
        const refreshIntervalInt = parseInt(refreshInterval, 10) * 1000;
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
        this.refreshingInterval = setInterval(() => {
            if (this.state.isLoading) {
                return
            }
            this.getAllTitles(urls);
        }, refreshIntervalInt)
    };

    render() {
        return (
            <div className="App">
                <Notif
                    ignore={!this.state.notif}
                    tag={this.state.lastRefresh}/>
                <Form
                    {...this.state}
                    handleInputChange={this.handleInputChange}
                    submitForm={this.submitForm}
                />
                <br/>
                <div>Last refresh: {this.state.refreshTimeStamp}</div>
                <br/>
                <Table
                    items={this.state.items}
                    isLoading={this.state.isLoading}
                    clearTable={this.clearTable}/>
            </div>
        );
    }
}

export default App;
