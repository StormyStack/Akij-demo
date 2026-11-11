const http = require('http');
const https = require('https');
const url = require('url');
require('dotenv').config();

const SEQ_URL = process.env.SEQ_URL || 'http://seq:5341';
const SEQ_API_KEY = process.env.SEQ_API_KEY || '';
const APP_NAME = process.env.APP_NAME || '3Tier-Enterprise-PoC';
const NODE_ENV = process.env.NODE_ENV || 'development';

let isSeqReachable = false;
let lastSeqPing = 0;
const buffer = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 2000;

// Ship events in CLEF (Compact Log Event Format) to Seq
async function flushBuffer() {
  if (buffer.length === 0) return;
  const eventsToSend = buffer.splice(0, BATCH_SIZE);
  const ndjson = eventsToSend.map(e => JSON.stringify(e)).join('\n');

  try {
    const parsedUrl = new URL(`${SEQ_URL.replace(/\/+$/, '')}/api/events/raw`);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request(
      parsedUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.serilog.clef',
          'Content-Length': Buffer.byteLength(ndjson),
          ...(SEQ_API_KEY ? { 'X-Seq-ApiKey': SEQ_API_KEY } : {}),
        },
        timeout: 4000,
      },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          isSeqReachable = true;
        } else {
          isSeqReachable = false;
        }
        res.resume();
      }
    );

    req.on('error', () => {
      isSeqReachable = false;
      // Do not re-queue to prevent memory exhaustion if Seq is offline
    });

    req.on('timeout', () => {
      req.destroy();
      isSeqReachable = false;
    });

    req.write(ndjson);
    req.end();
  } catch (err) {
    isSeqReachable = false;
  }
}

setInterval(flushBuffer, FLUSH_INTERVAL_MS);

function emitLog(level, message, props = {}) {
  const timestamp = new Date().toISOString();

  // 1. Console Output
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${APP_NAME}]`;
  if (level === 'Error') {
    console.error(`${prefix} ${message}`, props);
  } else if (level === 'Warning') {
    console.warn(`${prefix} ${message}`, props);
  } else {
    console.log(`${prefix} ${message}`, Object.keys(props).length ? props : '');
  }

  // 2. Format for Seq (CLEF standard)
  const clefEvent = {
    '@t': timestamp,
    '@l': level,
    '@mt': message,
    Application: APP_NAME,
    Environment: NODE_ENV,
    ...props,
  };

  if (props.error && props.error instanceof Error) {
    clefEvent['@x'] = props.error.stack || props.error.message;
    clefEvent.ErrorMessage = props.error.message;
  }

  buffer.push(clefEvent);
  if (buffer.length >= BATCH_SIZE) {
    flushBuffer();
  }
}

const logger = {
  info: (msg, props) => emitLog('Information', msg, props),
  warn: (msg, props) => emitLog('Warning', msg, props),
  error: (msg, props) => emitLog('Error', msg, props),
  debug: (msg, props) => emitLog('Debug', msg, props),
  getStatus: () => ({
    seqUrl: SEQ_URL,
    seqReachable: isSeqReachable,
    bufferedEvents: buffer.length,
    appName: APP_NAME
  }),
  flush: flushBuffer
};

module.exports = logger;
