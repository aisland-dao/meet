import _ from 'lodash';
import { AnyAction } from 'redux';

import ReducerRegistry from '../redux/ReducerRegistry';
import { equals, set } from '../redux/functions';

import { SET_LOGGING_CONFIG, SET_LOG_COLLECTOR } from './actionTypes';

const DEFAULT_LOGGING_CONFIG = {
    // default log level for the app and lib-jitsi-meet
    defaultLogLevel: 'trace' as LogLevel,

    // Option to disable LogCollector (which stores the logs on CallStats)
    // disableLogCollector: true,

    loggers: {
        // The following are too verbose in their logging with the
        // {@link #defaultLogLevel}:
        'modules/RTC/TraceablePeerConnection.js': 'info' as LogLevel,
        'modules/statistics/CallStats.js': 'info' as LogLevel,
        'modules/xmpp/strophe.util.js': 'log' as LogLevel
    }
};

/**
 * The default/initial redux state of the feature base/logging.
 *
 * @type {{
 *     config: Object
 * }}
 */
const DEFAULT_STATE = {
    config: DEFAULT_LOGGING_CONFIG,

    /**
     * The log collector.
     */
    logCollector: undefined
};

// Reduce default verbosity on mobile, it kills performance.
if (navigator.product === 'ReactNative') {
    const RN_LOGGERS = {
        'modules/sdp/SDPUtil.js': 'info' as LogLevel,
        'modules/xmpp/ChatRoom.js': 'warn' as LogLevel,
        'modules/xmpp/JingleSessionPC.js': 'info' as LogLevel,
        'modules/xmpp/strophe.jingle.js': 'info' as LogLevel
    };

    DEFAULT_STATE.config.loggers = {
        ...DEFAULT_LOGGING_CONFIG.loggers,
        ...RN_LOGGERS
    };
}

type LogLevel = 'trace' | 'log' | 'info' | 'warn' | 'error';

export interface ILoggingState {
    config: {
        defaultLogLevel: LogLevel;
        disableLogCollector?: boolean;
        loggers: {
            [key: string]: LogLevel;
        };
    };
    logCollector?: {
        flush: () => void;
        start: () => void;
        stop: () => void;
    };
}

ReducerRegistry.register<ILoggingState>(
    'features/base/logging',
    (state = DEFAULT_STATE, action): ILoggingState => {
        switch (action.type) {
        case SET_LOGGING_CONFIG:
            return _setLoggingConfig(state, action);
        case SET_LOG_COLLECTOR: {
            return _setLogCollector(state, action);
        }

        default:
            return state;
        }
    });

/**
 * Reduces a specific Redux action SET_LOGGING_CONFIG of the feature
 * base/logging.
 *
 * @param {Object} state - The Redux state of the feature base/logging.
 * @param {Action} action - The Redux action SET_LOGGING_CONFIG to reduce.
 * @private
 * @returns {Object} The new state of the feature base/logging after the
 * reduction of the specified action.
 */
function _setLoggingConfig(state: ILoggingState, action: AnyAction) {
    const newConfig = _.merge({}, DEFAULT_STATE.config, action.config);

    if (equals(state.config, newConfig)) {
        return state;
    }

    return {
        ...state,
        config: newConfig
    };
}

/**
 * Reduces a specific Redux action SET_LOG_COLLECTOR of the feature
 * base/logging.
 *
 * @param {Object} state - The Redux state of the feature base/logging.
 * @param {Action} action - The Redux action SET_LOG_COLLECTOR to reduce.
 * @private
 * @returns {Object} The new state of the feature base/logging after the
 * reduction of the specified action.
 */
function _setLogCollector(state: ILoggingState, action: AnyAction) {
    return set(state, 'logCollector', action.logCollector);
}
