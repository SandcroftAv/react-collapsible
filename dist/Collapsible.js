'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Collapsible = _react2.default.createClass({
    displayName: 'Collapsible',


    //Set validation for prop types
    propTypes: {
        transitionTime: _react2.default.PropTypes.number,
        easing: _react2.default.PropTypes.string,
        open: _react2.default.PropTypes.bool,
        classParentString: _react2.default.PropTypes.string,
        accordionPosition: _react2.default.PropTypes.number,
        handleTriggerClick: _react2.default.PropTypes.func,
        trigger: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.element]),
        triggerWhenOpen: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.element]),
        lazyRender: _react2.default.PropTypes.bool,
        overflowWhenOpen: _react2.default.PropTypes.oneOf(['hidden', 'visible', 'auto', 'scroll', 'inherit', 'initial', 'unset'])
    },

    //If no transition time or easing is passed then default to this
    getDefaultProps: function getDefaultProps() {
        return {
            transitionTime: 400,
            easing: 'linear',
            open: false,
            classParentString: 'Collapsible',
            lazyRender: false,
            overflowWhenOpen: 'hidden'
        };
    },

    //Defaults the dropdown to be closed
    getInitialState: function getInitialState() {

        if (this.props.open) {
            return {
                isClosed: false,
                shouldSwitchAutoOnNextCycle: false,
                height: 'auto',
                transition: 'none',
                hasBeenOpened: true,
                overflow: this.props.overflowWhenOpen
            };
        } else {
            return {
                isClosed: true,
                shouldSwitchAutoOnNextCycle: false,
                height: 0,
                transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing,
                hasBeenOpened: false,
                overflow: 'hidden'
            };
        }
    },

    // Taken from https://github.com/EvandroLG/transitionEnd/
    // Determines which prefixed event to listen for
    whichTransitionEnd: function whichTransitionEnd(element) {
        var transitions = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var t in transitions) {
            if (element.style[t] !== undefined) {
                return transitions[t];
            }
        }
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        //Set up event listener to listen to transitionend so we can switch the height from fixed pixel to auto for much responsiveness;
        //TODO:  Once Synthetic transitionend events have been exposed in the next release of React move this funciton to a function handed to the onTransitionEnd prop

        this.refs.outer.addEventListener(this.whichTransitionEnd(this.refs.outer), function (event) {
            if (_this.state.isClosed === false) {
                _this.setState({
                    shouldSwitchAutoOnNextCycle: true
                });
            }
        });
    },

    componentDidUpdate: function componentDidUpdate(prevProps) {

        if (this.state.shouldSwitchAutoOnNextCycle === true && this.state.isClosed === false) {
            //Set the height to auto to make compoenent re-render with the height set to auto.
            //This way the dropdown will be responsive and also change height if there is another dropdown within it.
            this.makeResponsive();
        }

        if (this.state.shouldSwitchAutoOnNextCycle === true && this.state.isClosed === true) {
            this.prepareToOpen();
        }

        //If there has been a change in the open prop (controlled by accordion)
        if (prevProps.open != this.props.open) {

            if (this.props.open === true) {
                this.openCollasible();
            } else {
                this.closeCollapsible();
            }
        }
    },

    handleTriggerClick: function handleTriggerClick(event) {

        event.preventDefault();

        if (this.props.handleTriggerClick) {
            this.props.handleTriggerClick(this.props.accordionPosition);
        } else {

            if (this.state.isClosed === true) {
                this.openCollasible();
            } else {
                this.closeCollapsible();
            }
        }
    },

    closeCollapsible: function closeCollapsible() {
        this.setState({
            isClosed: true,
            shouldSwitchAutoOnNextCycle: true,
            height: this.refs.inner.offsetHeight,
            overflow: 'hidden'
        });
    },

    openCollasible: function openCollasible() {
        this.setState({
            height: this.refs.inner.offsetHeight,
            transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing,
            isClosed: false,
            hasBeenOpened: true
        });
        var outer = this.refs.outer;

        var interval = setInterval(function () {
            outer.scrollTop = 0;
        }, 10);

        setTimeout(function () {
            clearInterval(interval);
        }, this.props.transitionTime);
    },

    makeResponsive: function makeResponsive() {
        this.setState({
            height: 'auto',
            transition: 'none',
            shouldSwitchAutoOnNextCycle: false,
            overflow: this.props.overflowWhenOpen
        });
    },

    prepareToOpen: function prepareToOpen() {
        var _this2 = this;

        //The height has been changes back to fixed pixel, we set a small timeout to force the CSS transition back to 0 on the next tick.
        window.setTimeout(function () {
            _this2.setState({
                height: 0,
                shouldSwitchAutoOnNextCycle: false,
                transition: 'height ' + _this2.props.transitionTime + 'ms ' + _this2.props.easing
            });
        }, 50);
    },

    render: function render() {

        var dropdownStyle = {
            height: this.state.height,
            WebkitTransition: this.state.transition,
            msTransition: this.state.transition,
            transition: this.state.transition,
            overflow: this.state.overflow
        };

        var openClass = this.state.isClosed ? 'is-closed' : 'is-open';

        //If user wants different text when tray is open
        var trigger = this.state.isClosed === false && this.props.triggerWhenOpen !== undefined ? this.props.triggerWhenOpen : this.props.trigger;

        // Don't render children until the first opening of the Collapsible if lazy rendering is enabled
        var children = this.props.children;
        if (this.props.lazyRender) if (!this.state.hasBeenOpened) children = null;

        return _react2.default.createElement(
            'div',
            { className: this.props.classParentString },
            _react2.default.createElement(
                'span',
                { className: this.props.classParentString + "__trigger" + ' ' + openClass, onClick: this.handleTriggerClick },
                trigger
            ),
            _react2.default.createElement(
                'div',
                { className: this.props.classParentString + "__contentOuter", ref: 'outer', style: dropdownStyle },
                _react2.default.createElement(
                    'div',
                    { className: this.props.classParentString + "__contentInner", ref: 'inner' },
                    children
                )
            )
        );
    }

});

exports.default = Collapsible;

