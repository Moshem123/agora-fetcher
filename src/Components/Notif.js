import React, { PureComponent } from 'react';
import Notification from 'react-web-notification';
import soundMp3 from '../sounds/alarm.mp3';
import soundOgg from '../sounds/alarm.ogg';

class Notif extends PureComponent {
    state = {
        ignore: this.props.ignore
    };

    static getDerivedStateFromProps(props) {
        return {ignore: props.ignore}
    }

    componentDidMount() {
        this.setState({ignore: true})
    }

    handlePermissionDenied = () => {
        alert('Please allow notifications to know the product has changed!');
    };

    handleNotSupported = () => {
        console.log('Web Notification not Supported');
        this.setState({
            ignore: true
        });
    };

    handleNotificationOnClick = () => {
        window.focus()
    };

    handleNotificationOnError = (e, tag) => {
        console.log(e, 'Notification error tag:' + tag);
    };

    handleNotificationOnShow = (e, tag) => {
        this.playSound();
        console.log(e, 'Notification shown tag:' + tag);
    };

    playSound = () => {
        document.getElementById('sound').play();
    };

    render() {
        const postId = this.props.tag.split('_')[0];
        return (
            <div>
                <Notification
                    ignore={this.state.ignore}
                    askAgain={true}
                    notSupported={this.handleNotSupported}
                    onPermissionDenied={this.handlePermissionDenied}
                    onShow={this.handleNotificationOnShow}
                    onClick={this.handleNotificationOnClick}
                    onError={this.handleNotificationOnError}
                    timeout={20000}
                    title='Agora Fetcher'
                    options={{
                        tag: this.props.tag,
                        body: `Item ${postId} was refreshed! Click here to see`,
                        icon: 'https://pbs.twimg.com/profile_images/378800000012301205/41391c5622793f1178a2c472028deb58_400x400.jpeg',
                        lang: 'en',
                        dir: 'ltr',
                        sound: './sound.mp3'
                    }}
                />
                <audio id='sound' preload='auto'>
                    <source src={soundMp3} type='audio/mpeg'/>
                    <source src={soundOgg} type='audio/ogg'/>
                    <embed hidden='true' autostart='false' loop='false' src={soundMp3}/>
                </audio>
            </div>
        )
    }
};

export default Notif;