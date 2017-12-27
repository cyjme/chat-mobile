<template>
  <div id="chatbox">
    <div id="friendslist">
      <div id="topmenu">
        <div class="left"></div>
        <div class="right">
          <span>
          {{currentUser.nick}}
          </span>
        </div>
      </div>

      <div id="friends">
        <div class="friend" v-for="contact in contacts" :key="contact.token" @click="handleClick(contact.userId)">
          <div v-if="contact.avt==''?true:false" class="text-avatar">{{contact.nick.substring(0,1)}}</div>
          <img v-if="contact.avt==''?false:true" :src="contact.avt"/>
          <p>
            <strong>{{contact.nick}}</strong>
            <br/>
            <span>{{contact.phone}}</span>
          </p>
          <div class="status available"></div>
        </div>

        <div id="search">
          <input type="text" id="searchfield" placeholder="Search contacts..."/>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import {scrollBottom} from "../../help";

  export default {
    name: "contactList",
    props: ["contacts", "newMsg", "currentUser"],
    created: function () {
    },
    methods: {
      updateLastReadAt(toUserId) {
        this.axios.get(`/update-last-read-at/${toUserId}`).then(() => {
        });
      },
      handleClick(toUserId) {
        this.updateLastReadAt(toUserId);
        this.$router.push({
          name: "Chat",
          params: {
            toUser: toUserId
          }
        });
        scrollBottom();
      }
    }
  };
</script>

<style>

</style>
