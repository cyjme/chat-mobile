<template>
  <div id="chatbox">
    <div id="friendslist">
      <div id="topmenu">
        <a href="https://www.ideapar.com">
          <div class="left"></div>
        </a>
        <div class="right">
          <span>
          {{currentUser.nick}}
          </span>
        </div>
      </div>

      <div id="friends">
        <div class="friend" v-for="contact in contacts" :key="contact.token" @click="handleClick(contact.userId)">
          <div v-if="contact.avt==''?true:false" class="text-avatar">{{contact.nick.substring(0,1)}}</div>
          <img v-if="contact.avt==''?false:true"
               :src="'https://qiniu.ideapar.com/'+JSON.parse(contact.avt)[0]+'?imageMogr2/thumbnail/80x/strip/quality/50/format/jpg'"/>
          <p>
            <strong>{{contact.nick}}</strong>
            <br/>
            <span>{{contact.phone}}</span>
          </p>
          <div class="status available">{{contact.hasOwnProperty('unreadCount')==true? contact.unreadCount:''}}</div>
        </div>

        <!--<div id="search">-->
        <!--<input type="text" id="searchfield" placeholder="Search contacts..."/>-->
        <!--</div>-->
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
        this.clearUnreadCount(toUserId);
        this.$router.push({
          name: "Chat",
          params: {
            toUser: toUserId
          }
        });
        scrollBottom();
      },
      clearUnreadCount(userId) {
        this.contacts.map((contact, index) => {
          if (contact.userId == userId) {
            delete contact.unreadCount
            // console.warn("contact",contact)
            // this.contacts.splice(index, 1, contact)
          }
        })
      }
    }
  };
</script>

<style>

</style>
