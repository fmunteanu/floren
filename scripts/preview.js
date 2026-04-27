/**
 * @fileoverview Preview script for local LAN-accessible Wrangler dev server.
 *
 * Detects the Mac's primary LAN IPv4 address from network interfaces, builds
 * the OpenNext bundle, and runs `opennextjs-cloudflare preview` bound to
 * that IP over plain HTTP. All stdout and stderr is mirrored to a
 * timestamped log file under `./logs/` for post-run inspection.
 *
 * Usage: node scripts/preview.js
 */

import { createWriteStream, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { networkInterfaces } from 'node:os'
import { spawn } from 'node:child_process'

/**
 * Removes log files left by previous preview runs from `./logs/`. Scoped
 * to `preview-*.log` and `wrangler-*.log` to avoid touching unrelated
 * files in the directory. Silently skips when the directory is missing.
 *
 * @returns {void}
 */
function cleanLogs() {
  let entries
  try {
    entries = readdirSync('./logs')
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.startsWith('preview-') || entry.startsWith('wrangler-')) {
      unlinkSync(join('./logs', entry))
    }
  }
}

/**
 * Detects the primary LAN IPv4 address by walking network interfaces and
 * selecting the first non-internal IPv4 entry. Prefers en0 (Wi-Fi/Ethernet
 * on macOS) when present, otherwise falls back to the first matching entry.
 *
 * @returns {string} The detected LAN IPv4 address.
 * @throws {Error} If no non-internal IPv4 address is available.
 */
function getLanAddress() {
  const interfaces = networkInterfaces()
  const preferred = interfaces.en0?.find(entry => entry.family === 'IPv4' && !entry.internal)
  if (preferred) return preferred.address
  for (const entries of Object.values(interfaces)) {
    const entry = entries?.find(item => item.family === 'IPv4' && !item.internal)
    if (entry) return entry.address
  }
  throw new Error('No IPv4 address found')
}

/**
 * Generates a log file path under `./logs/` with the format
 * `preview-YYYY-MM-DD_HH-MM-SS_mmm.log`, matching wrangler's own log
 * filename convention. The millisecond suffix guarantees uniqueness when
 * the script is invoked multiple times within the same second.
 *
 * @returns {string} The absolute log file path.
 */
function getLogPath() {
  const now = new Date()
  const pad = (value, length = 2) => String(value).padStart(length, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  const ms = pad(now.getMilliseconds(), 3)
  mkdirSync('./logs', { recursive: true })
  return join('./logs', `preview-${date}_${time}_${ms}.log`)
}

/**
 * Runs the preview pipeline: clears stale log files, detects the LAN IP,
 * opens a timestamped log stream, builds the OpenNext bundle, and runs
 * the LAN-bound preview server over plain HTTP. Exits with the child
 * process's status code so build or preview failures propagate to the
 * shell.
 *
 * @returns {Promise<void>}
 */
async function preview() {
  cleanLogs()
  const ip = getLanAddress()
  const logPath = getLogPath()
  const logStream = createWriteStream(logPath, { flags: 'a' })
  const buildStatus = await startProcess('opennextjs-cloudflare', ['build'], logStream)
  if (buildStatus !== 0) {
    logStream.end()
    process.exit(buildStatus)
  }
  const previewStatus = await startProcess('opennextjs-cloudflare', ['preview', '--ip', ip], logStream)
  logStream.end()
  process.exit(previewStatus)
}

/**
 * Spawns a child command, mirroring its stdout and stderr to both the
 * parent process and the provided log stream. Resolves with the child's
 * exit status.
 *
 * @param {string} command - The executable to run.
 * @param {string[]} args - Arguments to pass to the executable.
 * @param {WriteStream} logStream - Open log stream to mirror output into.
 * @returns {Promise<number>} The exit status of the child process.
 */
function startProcess(command, args, logStream) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, FORCE_COLOR: '1', NODE_OPTIONS: '--no-webstorage' }
    })
    child.stdout.on('data', chunk => {
      process.stdout.write(chunk)
      logStream.write(chunk)
    })
    child.stderr.on('data', chunk => {
      process.stderr.write(chunk)
      logStream.write(chunk)
    })
    child.on('error', reject)
    child.on('close', code => resolve(code ?? 0))
  })
}

await preview()
