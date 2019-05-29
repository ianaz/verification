import HashingWorker from './hashing.worker.js'

async function hashFile (file) {
  return new Promise((resolve, reject) => {
    const worker = new HashingWorker()
    worker.addEventListener('message', function (e) {
      worker.terminate()
      if (e.data.status === true) {
        resolve(e.data.hash)
      } else {
        reject(e.data.error)
      }
    }, false)

    worker.postMessage(file)
  })
}

export default {hashFile}
