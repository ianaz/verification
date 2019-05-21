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

import Vue from 'vue'
import Vuex from 'vuex'
import client from '../lib/contract-adapter'
import VERIFICATION_TYPES from '@/lib/verification-types'

import hashingService from '../lib/hashing-service'

Vue.use(Vuex)

function mapVerificationItemType (item) {
  if (item.issuer === null) {
    return VERIFICATION_TYPES.V_NOT_FOUND
  }
  if (item.revoked === true) {
    return VERIFICATION_TYPES.V_REVOKED
  }
  if (item.issuer_verified === true) {
    return VERIFICATION_TYPES.V_VERIFIED
  }
  return VERIFICATION_TYPES.V_SELF_DECLARED
}

export default new Vuex.Store({
  state: {
    verificationItems: [],
  },
  getters: {
    verificationItems: (state) => {
      return state.verificationItems.map(item => {
        if (item.hash === undefined) {
          return {
            hashed: false,
          }
        }
        return {
          hashed: true,
          type: mapVerificationItemType(item),
          ...item,
        }
      })
    },
  },
  mutations: {
    RESET_VERIFICATION_ITEMS (state) {
      state.verificationItems = []
    },
    ADD_BLOBS (state, item) {
      state.verificationItems.push(item)
    },
    UPDATE_VERIFICATION_ITEM (state, {hash, payload}) {
      state.verificationItems.forEach((verificationItem, i) => {
        if (verificationItem.hash === hash) {
          Vue.set(state.verificationItems, i, {...verificationItem, ...payload})
        }
      })
    },
    SET_VERIFICATION_ITEM_HASH (state, {item, hash}) {
      state.verificationItems.forEach((verificationItem, i) => {
        if (verificationItem === item) {
          Vue.set(state.verificationItems[i], 'hash', hash)
        }
      })
    },
  },
  actions: {
    async VERIFY ({state, commit, dispatch}, files) {
      commit('RESET_VERIFICATION_ITEMS')
      try {
        for (const file of files) {
          commit('ADD_BLOBS', {file, name: file.name})
        }
        state.verificationItems.forEach(async (item) => {
          const hash = await hashingService.hashFile(item.file)
          commit('SET_VERIFICATION_ITEM_HASH', {item, hash})

          const verification = await client.verifyFile(hash)
          commit('UPDATE_VERIFICATION_ITEM', {hash, payload: verification})

          let registrationEvent = await client.getRegistrationEvent(hash)
          let registrationBlock = await client.getRegistrationTxBlock(hash)
          commit('UPDATE_VERIFICATION_ITEM',
            {hash, payload: {registrationEvent, registrationBlock}})

          if (verification.revoked === true) {
            let revocationEvent = await client.getRevocationEvent(hash)
            let revocationBlock = await client.getRevocationTxBlock(hash)
            commit('UPDATE_VERIFICATION_ITEM',
              {hash, payload: {revocationEvent, revocationBlock}})
          }
        })
      } catch (e) {
        console.log(e)
      }
    },
  },
})
