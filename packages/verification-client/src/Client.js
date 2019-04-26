/*
 * Copyright (c) 2019 BlockFactory AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Web3 from 'web3'
import SmartContractABI from './SmartContract.abi'

export default class Client {

  /**
   * Represents a BlockFactory/certifaction Ethereum smart contract client
   * @constructor
   * @param {string} providerUrl
   * @param {string} contractAddress
   */
  constructor (providerUrl, contractAddress) {
    this.providerUrl = providerUrl
    if (this.providerUrl.startsWith('wss')) {
      this.provider = new Web3.providers.WebsocketProvider(this.providerUrl)
    } else if (this.providerUrl.startsWith('http')) {
      this.provider = new Web3.providers.HttpProvider(this.providerUrl)
    }
    this.contractAddress = contractAddress
    this._contract = undefined
    this.web3 = new Web3(this.provider, this.address)
  }

  /**
   * Returns a web3 Ethereum Contract object
   *
   * @return {web3.eth.Contract}
   */
  async getContract () {
    return this._contract || (this._contract = await this.web3.eth.Contract(
      SmartContractABI,
      this.contractAddress)
    )
  }

  /**
   * Verifies a file hash on the smart contract
   * @param {string} hash
   * @return {null || {issuer: string,
   *                   expiry: number,
   *                   revoked: boolean,
   *                   issuerVerified: boolean,
   *                   issuerName: false,
   *                   issuerImg: boolean}}
   */
  async verifyFile (hash) {
    const contract = await this.getContract()

    return new Promise((resolve, reject) => {
      contract.methods.verifyFile(hash).call({}, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * Closes the Websocket connection of the current provider.
   * Does nothing for HttpProviders.
   */
  close () {
    return this.web3.currentProvider.connection.close()
  }

}
