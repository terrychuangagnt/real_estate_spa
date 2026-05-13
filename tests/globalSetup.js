import { spawn } from 'node:child_process'

const API_URL = 'http://localhost:3002/api/cities'

async function waitForApi(timeoutMs = 30000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(API_URL)
      if (response.ok) return true
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

export default async function setup() {
  if (await waitForApi(1000)) {
    return
  }

  const server = spawn(process.execPath, ['dataServer.js'], {
    cwd: process.cwd(),
    stdio: 'ignore',
    windowsHide: true,
  })

  const ready = await waitForApi()
  if (!ready) {
    server.kill()
    throw new Error('Timed out waiting for dataServer.js on port 3002')
  }

  return () => {
    server.kill()
  }
}
