<!--
  - Copyright (c) 2019 BlockFactory AG
  -
  - Permission is hereby granted, free of charge, to any person obtaining a copy
  - of this software and associated documentation files (the "Software"), to deal
  - in the Software without restriction, including without limitation the rights
  - to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  - copies of the Software, and to permit persons to whom the Software is
  - furnished to do so, subject to the following conditions:
  -
  - The above copyright notice and this permission notice shall be included in all
  - copies or substantial portions of the Software.
  -
  - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  - IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  - FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  - AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  - LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  - OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  - SOFTWARE.
  -->

<template>
<div id="certifaction-verification">
  <div class="verification">
    <verification-drop-box @filesDropped="verify"/>
    <div class="verification-item-list">
      <verification-item v-for="verificationItem in filteredVerificationItems"
                         :verificationItem="verificationItem"/>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import './assets/styles/styles.scss'
import VerificationItem from './components/verification-items/VerificationItem'
import VerificationDropBox from './components/VerificationDropBox'
import client from './lib/contract-adapter'
import VERIFICATION_TYPES from './lib/verification-types'
import hashingService from './lib/hashing-service'

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

export default {
  name: 'bf-verification',
  components: {
    VerificationItem,
    VerificationDropBox
  },
  data () {
    return {
      verificationItems: []
    }
  },
  computed: {
    filteredVerificationItems () {
      return this.verificationItems.map(item => {
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
  methods: {
    async verify (files) {
      this.verificationItems = []
      try {
        for (const file of files) {
          this.verificationItems.push({file, name: file.name})
        }
        this.verificationItems.forEach(async (item, i) => {
          const hash = await hashingService.hashFile(item.file)
          const verification = await client.verifyFile(hash)
          Vue.set(this.verificationItems, i, {...this.verificationItems[i], hash, ...verification})

          if (verification.issuer !== null) {
            let [registrationEvent, registrationBlock] = await Promise.all(
              [client.getRegistrationEvent(hash), client.getRegistrationTxBlock(hash)]
            )

            Vue.set(this.verificationItems, i, {...this.verificationItems[i], registrationEvent, registrationBlock})

            if (verification.revoked === true) {
              let [revocationEvent, revocationBlock] = await Promise.all(
                [client.getRevocationEvent(hash), client.getRevocationTxBlock(hash)]
              )
              Vue.set(this.verificationItems, i, {...this.verificationItems[i], revocationEvent, revocationBlock})
            }
          }

          Vue.set(this.verificationItems[i], 'loaded', true)
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
